// 投稿 JSON に書かれた Canva の一時 URL の画像をダウンロードして images/ に保存し、
// JSON の指定をファイル名に書き換える（GitHub Actions で push 直後に実行する）
//   node instagram/scripts/localize-images.mjs [account...]
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadAccounts, getAccount, listPostFiles, readPost, readPostedLog, downloadJpeg } from './lib.mjs';

// 期限付きの URL を出すホスト。これ以外の URL（恒久的な公開 URL）はそのまま使う
const TEMPORARY_HOSTS = [/(^|\.)canva\.com$/, /(^|\.)amazonaws\.com$/];
const isTemporary = (src) => {
  try {
    return TEMPORARY_HOSTS.some((re) => re.test(new URL(src).hostname));
  } catch {
    return false;
  }
};

const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(await loadAccounts());
let saved = 0;
let failed = 0;

for (const key of keys) {
  const account = await getAccount(key);
  const posted = await readPostedLog(account);
  for (const file of await listPostFiles(account)) {
    if (posted[file]) continue;
    const post = await readPost(account, file);
    const stem = file.replace(/\.json$/, '');
    let changed = false;

    const localize = async (src, suffix) => {
      if (typeof src !== 'string' || !isTemporary(src)) return src;
      const name = `${stem}${suffix}.jpg`;
      try {
        await downloadJpeg(src, path.join(account.dir, 'images', name));
        console.log(`✓ ${key}/${file} → images/${name}`);
        saved++;
        changed = true;
        return name;
      } catch (e) {
        console.error(`✗ ${key}/${file}: ${e.message}`);
        failed++;
        return src;
      }
    };

    if (post.image) post.image = await localize(post.image, '');
    if (post.cover) post.cover = await localize(post.cover, '-cover');
    if (Array.isArray(post.images)) {
      for (let i = 0; i < post.images.length; i++) post.images[i] = await localize(post.images[i], `-${i + 1}`);
    }
    if (changed) await writeFile(path.join(account.dir, 'posts', file), JSON.stringify(post, null, 2) + '\n');
  }
}

console.log(`保存: ${saved} 件 / 失敗: ${failed} 件`);
process.exit(failed ? 1 : 0);
