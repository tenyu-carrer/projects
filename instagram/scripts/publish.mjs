// 今日（日本時間）の投稿を Instagram に公開する
//   node instagram/scripts/publish.mjs <account> [--dry-run] [--date YYYY-MM-DD]
import {
  getAccount, credentials, todayJst, listPostFiles, readPost, readPostedLog, writePostedLog,
  normalizePost, validatePost, publicUrl, graph,
} from './lib.mjs';

const args = process.argv.slice(2);
const key = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : null;

if (!key) {
  console.error('使い方: node instagram/scripts/publish.mjs <account> [--dry-run] [--date YYYY-MM-DD]');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// メディアコンテナの処理完了を待つ（動画・カルーセルは数十秒かかることがある）
async function waitUntilReady(account, creds, containerId) {
  for (let i = 0; i < 60; i++) {
    const { status_code: status } = await graph(account, creds, 'GET', containerId, { fields: 'status_code' });
    if (status === 'FINISHED') return;
    if (status === 'ERROR' || status === 'EXPIRED') throw new Error(`メディアの処理に失敗しました (${status})`);
    await sleep(5000);
  }
  throw new Error('メディアの処理がタイムアウトしました');
}

async function createContainer(account, creds, post) {
  const { userId } = creds;
  const url = (m) => publicUrl(account, m.src);

  if (post.type === 'carousel') {
    const children = [];
    for (const m of post.media) {
      const params = m.kind === 'video'
        ? { media_type: 'VIDEO', video_url: url(m), is_carousel_item: 'true' }
        : { image_url: url(m), is_carousel_item: 'true' };
      const { id } = await graph(account, creds, 'POST', `${userId}/media`, params);
      await waitUntilReady(account, creds, id);
      children.push(id);
    }
    return graph(account, creds, 'POST', `${userId}/media`, {
      media_type: 'CAROUSEL', children: children.join(','), caption: post.caption,
    });
  }
  if (post.type === 'reel') {
    const params = { media_type: 'REELS', video_url: url(post.media[0]), caption: post.caption };
    if (post.coverUrl) params.cover_url = publicUrl(account, post.coverUrl);
    return graph(account, creds, 'POST', `${userId}/media`, params);
  }
  if (post.type === 'story') {
    const m = post.media[0];
    return graph(account, creds, 'POST', `${userId}/media`, m.kind === 'video'
      ? { media_type: 'STORIES', video_url: url(m) }
      : { media_type: 'STORIES', image_url: url(m) });
  }
  return graph(account, creds, 'POST', `${userId}/media`, { image_url: url(post.media[0]), caption: post.caption });
}

const account = await getAccount(key);
const date = dateArg || todayJst();
const posted = await readPostedLog(account);
const due = (await listPostFiles(account)).filter((f) => f.startsWith(date) && !posted[f]);

console.log(`[${account.displayName}] ${date} の未投稿: ${due.length} 件${dryRun ? '（ドライラン）' : ''}`);
if (due.length === 0) {
  console.log('投稿予定がありません。posts/ に今日の日付のファイルがあるか確認してください。');
  process.exit(0);
}

const creds = dryRun ? null : credentials(account);
let failed = 0;

for (const file of due) {
  const post = normalizePost(await readPost(account, file), account);
  const errors = validatePost(post, account);
  if (errors.length) {
    console.error(`✗ ${file}: 内容に問題があります\n  - ${errors.join('\n  - ')}`);
    failed++;
    continue;
  }
  if (dryRun) {
    console.log(`○ ${file} (${post.type}, ${post.media.length} 件のメディア)`);
    for (const m of post.media) console.log(`   ${m.kind}: ${process.env.IMAGE_BASE_URL || process.env.GITHUB_SHA ? publicUrl(account, m.src) : m.src}`);
    console.log(post.caption.split('\n').map((l) => `   | ${l}`).join('\n'));
    continue;
  }
  try {
    const { id: containerId } = await createContainer(account, creds, post);
    await waitUntilReady(account, creds, containerId);
    const { id: mediaId } = await graph(account, creds, 'POST', `${creds.userId}/media_publish`, { creation_id: containerId });
    const { permalink } = await graph(account, creds, 'GET', mediaId, { fields: 'permalink' }).catch(() => ({}));
    posted[file] = { mediaId, permalink: permalink || null, postedAt: new Date().toISOString() };
    await writePostedLog(account, posted);
    console.log(`✓ ${file} を投稿しました ${permalink || mediaId}`);
  } catch (e) {
    console.error(`✗ ${file}: ${e.message}`);
    failed++;
  }
}

process.exit(failed ? 1 : 0);
