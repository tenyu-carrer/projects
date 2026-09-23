// 投稿データのチェックと、予約投稿の残り日数の確認
//   node instagram/scripts/validate.mjs [account...]
import {
  loadAccounts, getAccount, todayJst, listPostFiles, readPost, readPostedLog, normalizePost, validatePost,
} from './lib.mjs';

const WARN_DAYS = Number(process.env.QUEUE_WARN_DAYS || 7);
const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(await loadAccounts());
const today = todayJst();
let errorCount = 0;

for (const key of keys) {
  const account = await getAccount(key);
  const posted = await readPostedLog(account);
  const files = await listPostFiles(account);
  console.log(`\n■ ${account.displayName} (${key})`);

  for (const file of files) {
    let errors;
    try {
      errors = validatePost(normalizePost(await readPost(account, file), account), account);
    } catch (e) {
      errors = [`JSON を読み込めません: ${e.message}`];
    }
    if (errors.length) {
      errorCount += errors.length;
      console.log(`  ✗ ${file}\n    - ${errors.join('\n    - ')}`);
    }
  }

  // 今日以降で、まだ投稿されていない日付を数える
  const upcoming = new Set(files.filter((f) => f.slice(0, 10) >= today && !posted[f]).map((f) => f.slice(0, 10)));
  const missing = [];
  for (let i = 0; i < WARN_DAYS; i++) {
    const d = todayJst(new Date(Date.now() + i * 86400 * 1000));
    if (!upcoming.has(d)) missing.push(d);
  }
  console.log(`  予約済み: ${upcoming.size} 日分 / 投稿済み: ${Object.keys(posted).length} 件`);
  if (missing.length) console.log(`  ⚠ 今後 ${WARN_DAYS} 日間で投稿が未登録の日: ${missing.join(', ')}`);
}

if (errorCount) {
  console.error(`\n${errorCount} 件の問題があります`);
  process.exit(1);
}
console.log('\nOK');
