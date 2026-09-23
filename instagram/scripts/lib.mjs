// Instagram 自動投稿で共通して使う処理（外部依存なし・Node 18+ の fetch を使用）
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const IG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = path.resolve(IG_ROOT, '..');

const API_HOSTS = {
  facebook: 'https://graph.facebook.com',
  instagram: 'https://graph.instagram.com',
};
const API_VERSION = process.env.GRAPH_API_VERSION || 'v23.0';

export const CAPTION_MAX = 2200;
export const HASHTAG_MAX = 30;
export const CAROUSEL_MIN = 2;
export const CAROUSEL_MAX = 10;

export async function loadAccounts() {
  return JSON.parse(await readFile(path.join(IG_ROOT, 'accounts.json'), 'utf8'));
}

export async function getAccount(key) {
  const accounts = await loadAccounts();
  const account = accounts[key];
  if (!account) {
    throw new Error(`accounts.json にアカウント "${key}" がありません（候補: ${Object.keys(accounts).join(', ')}）`);
  }
  return { key, ...account, dir: path.join(IG_ROOT, 'content', key) };
}

export function credentials(account) {
  const token = process.env[`${account.envPrefix}_ACCESS_TOKEN`];
  const userId = process.env[`${account.envPrefix}_USER_ID`];
  if (!token || !userId) {
    throw new Error(`${account.envPrefix}_ACCESS_TOKEN と ${account.envPrefix}_USER_ID を設定してください`);
  }
  return { token, userId };
}

// 日本時間の日付 (YYYY-MM-DD)
export function todayJst(date = new Date()) {
  return new Date(date.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

// posts/ 配下の投稿ファイル一覧（ファイル名順 = 投稿順）
export async function listPostFiles(account) {
  const dir = path.join(account.dir, 'posts');
  if (!existsSync(dir)) return [];
  const stem = (f) => f.replace(/\.json$/, '');
  return (await readdir(dir))
    .filter((f) => /^\d{4}-\d{2}-\d{2}.*\.json$/.test(f))
    .sort((a, b) => (stem(a) < stem(b) ? -1 : stem(a) > stem(b) ? 1 : 0));
}

export async function readPost(account, file) {
  return JSON.parse(await readFile(path.join(account.dir, 'posts', file), 'utf8'));
}

export async function readPostedLog(account) {
  const file = path.join(account.dir, 'posted.json');
  if (!existsSync(file)) return {};
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function writePostedLog(account, log) {
  await writeFile(path.join(account.dir, 'posted.json'), JSON.stringify(log, null, 2) + '\n');
}

// 投稿 JSON を正規化: { type, media: [{kind, src}], caption }
export function normalizePost(post, account) {
  const type = post.type || (post.video ? 'reel' : (post.images?.length > 1 ? 'carousel' : 'image'));
  let media;
  if (type === 'reel' || (type === 'story' && post.video)) {
    media = [{ kind: 'video', src: post.video }];
  } else {
    const images = post.images || (post.image ? [post.image] : []);
    media = images.map((src) => ({ kind: 'image', src }));
  }
  const hashtags = [...(post.hashtags || []), ...(account.defaultHashtags || [])]
    .map((t) => t.replace(/^#/, ''))
    .filter((t, i, arr) => t && arr.indexOf(t) === i);
  const caption = [post.caption || '', hashtags.map((t) => `#${t}`).join(' ')]
    .filter(Boolean)
    .join('\n\n');
  return { type, media, caption, hashtags, coverUrl: post.cover };
}

// 投稿内容のチェック。エラー文字列の配列を返す
export function validatePost(post, account) {
  const errors = [];
  const allowed = ['image', 'carousel', 'reel', 'story'];
  if (!allowed.includes(post.type)) errors.push(`type は ${allowed.join(' / ')} のいずれか（現在: ${post.type}）`);
  if (post.media.length === 0) errors.push('画像または動画が指定されていません');
  if (post.type === 'carousel' && (post.media.length < CAROUSEL_MIN || post.media.length > CAROUSEL_MAX)) {
    errors.push(`カルーセルの枚数は ${CAROUSEL_MIN}〜${CAROUSEL_MAX} 枚（現在: ${post.media.length}）`);
  }
  if (['image', 'story'].includes(post.type) && post.media.length > 1) {
    errors.push(`${post.type} は1枚だけ指定できます（複数枚は type: "carousel"）`);
  }
  if (post.type !== 'story' && !post.caption.trim()) errors.push('キャプションが空です');
  if ([...post.caption].length > CAPTION_MAX) errors.push(`キャプションが ${CAPTION_MAX} 文字を超えています`);
  if (post.hashtags.length > HASHTAG_MAX) errors.push(`ハッシュタグが ${HASHTAG_MAX} 個を超えています`);
  for (const m of post.media) {
    if (!m.src) { errors.push('空のファイル指定があります'); continue; }
    const file = isUrl(m.src) ? new URL(m.src).pathname : m.src;
    if (m.kind === 'image' && !/\.jpe?g$/i.test(file)) errors.push(`画像は JPEG のみ対応です: ${m.src}`);
    if (m.kind === 'video' && !/\.(mp4|mov)$/i.test(file)) errors.push(`動画は MP4 / MOV のみ対応です: ${m.src}`);
    if (!isUrl(m.src) && !existsSync(path.join(account.dir, 'images', m.src))) {
      errors.push(`ファイルが見つかりません: content/${account.key}/images/${m.src}`);
    }
  }
  return errors;
}

function isUrl(src) {
  return /^https?:\/\//.test(src);
}

// Instagram API は公開 URL から画像を取得するため、リポジトリ内のファイルは公開 URL に変換する
export function publicUrl(account, src) {
  if (isUrl(src)) return src;
  const base = process.env.IMAGE_BASE_URL
    || (process.env.GITHUB_REPOSITORY && process.env.GITHUB_SHA
      ? `https://raw.githubusercontent.com/${process.env.GITHUB_REPOSITORY}/${process.env.GITHUB_SHA}`
      : null);
  if (!base) throw new Error('IMAGE_BASE_URL が未設定のため、画像の公開 URL を作れません');
  const rel = path.relative(REPO_ROOT, path.join(account.dir, 'images', src)).split(path.sep).join('/');
  return `${base.replace(/\/$/, '')}/${rel.split('/').map(encodeURIComponent).join('/')}`;
}

const IMAGE_MAX_BYTES = 8 * 1024 * 1024; // Instagram の画像上限

// URL から JPEG をダウンロードして保存する（Canva の書き出し URL は一時的なので、投稿日まで残すため）
export async function downloadJpeg(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ダウンロードに失敗しました (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  // JPEG は先頭が FF D8 FF
  if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) {
    throw new Error('JPEG ではありません。Canva から JPG 形式で書き出してください');
  }
  if (buf.length > IMAGE_MAX_BYTES) {
    throw new Error(`画像が大きすぎます (${(buf.length / 1024 / 1024).toFixed(1)}MB)。品質を下げて書き出してください`);
  }
  await writeFile(dest, buf);
  return buf.length;
}

export async function graph(account, { token }, method, endpoint, params = {}) {
  const host = process.env.GRAPH_API_BASE || API_HOSTS[account.apiHost] || API_HOSTS.facebook;
  const url = new URL(`${host}/${API_VERSION}/${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: token });
  let res;
  if (method === 'GET') {
    body.forEach((v, k) => url.searchParams.set(k, v));
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new Error(`Instagram API エラー (${res.status}) ${endpoint}: ${e.message || JSON.stringify(json)}`);
  }
  return json;
}
