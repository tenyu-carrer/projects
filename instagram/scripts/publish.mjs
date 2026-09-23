// 今日（日本時間）の投稿を Instagram に公開する
//   node instagram/scripts/publish.mjs --all [--dry-run]            投稿時刻（accounts.json の postTime）を過ぎた全アカウント
//   node instagram/scripts/publish.mjs <account> [--dry-run] [--date YYYY-MM-DD]   指定アカウント（時刻に関係なく）
//   node instagram/scripts/publish.mjs --now [--dry-run]            "publish": "now" の付いた今日の投稿を、全アカウントですぐ投稿（指示投稿）
import {
  loadAccounts, getAccount, credentials, todayJst, nowTimeJst, listPostFiles, readPost, readPostedLog,
  writePostedLog, normalizePost, validatePost, publicUrl, graph,
} from './lib.mjs';

const args = process.argv.slice(2);
const all = args.includes('--all');
const now = args.includes('--now');
const key = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--date');
const dryRun = args.includes('--dry-run') || process.env.DRY_RUN === 'true';
const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : null;

if (!all && !now && !key) {
  console.error('使い方: node instagram/scripts/publish.mjs (--all | --now | <account>) [--dry-run] [--date YYYY-MM-DD]');
  process.exit(1);
}

// GitHub Actions からは全 Secrets を JSON で受け取る（アカウントを増やしてもワークフローの変更が不要）
if (process.env.ALL_SECRETS) {
  for (const [k, v] of Object.entries(JSON.parse(process.env.ALL_SECRETS))) {
    if (k.startsWith('IG_') && !process.env[k]) process.env[k] = v;
  }
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

// 1アカウント分を処理し、失敗件数を返す（onlyNow: "publish": "now" の投稿だけを対象にする）
async function publishAccount(account, date, { onlyNow = false } = {}) {
  const posted = await readPostedLog(account);
  const due = [];
  for (const f of await listPostFiles(account)) {
    if (!f.startsWith(date) || posted[f]) continue;
    if (onlyNow && (await readPost(account, f)).publish !== 'now') continue;
    due.push(f);
  }

  const label = onlyNow ? '今すぐ投稿の指示' : '未投稿';
  if (onlyNow && due.length === 0) return 0;
  console.log(`[${account.displayName}] ${date} の${label}: ${due.length} 件${dryRun ? '（ドライラン）' : ''}`);
  if (due.length === 0) return 0;

  let creds;
  if (!dryRun) {
    try {
      creds = credentials(account);
    } catch (e) {
      console.error(`✗ ${e.message}`);
      return due.length;
    }
  }

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
  return failed;
}

const date = dateArg || todayJst();
let failed = 0;

if (now) {
  // 指示投稿はオーナーの明示的な指示なので、enabled（毎日投稿のスイッチ）に関係なく投稿する
  for (const k of Object.keys(await loadAccounts())) {
    failed += await publishAccount(await getAccount(k), date, { onlyNow: true });
  }
} else if (all) {
  const time = nowTimeJst();
  for (const [k, conf] of Object.entries(await loadAccounts())) {
    if (conf.enabled === false) continue;
    if (!dateArg && conf.postTime && time < conf.postTime) {
      console.log(`[${conf.displayName}] 投稿時刻 ${conf.postTime} 前のためスキップ（現在 ${time}）`);
      continue;
    }
    failed += await publishAccount(await getAccount(k), date);
  }
} else {
  failed = await publishAccount(await getAccount(key), date);
}

process.exit(failed ? 1 : 0);
