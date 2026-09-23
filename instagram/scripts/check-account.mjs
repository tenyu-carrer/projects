// 連携の確認と、フォロワー数などの簡易レポート
//   node instagram/scripts/check-account.mjs [account...]
import { loadAccounts, getAccount, credentials, graph } from './lib.mjs';

const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(await loadAccounts());
let failed = 0;

for (const key of keys) {
  const account = await getAccount(key);
  try {
    const creds = credentials(account);
    const me = await graph(account, creds, 'GET', creds.userId, {
      fields: 'username,followers_count,follows_count,media_count',
    });
    const limit = await graph(account, creds, 'GET', `${creds.userId}/content_publishing_limit`, {
      fields: 'quota_usage,config',
    }).catch(() => null);
    const quota = limit?.data?.[0];
    console.log(`✓ ${account.displayName}: @${me.username} フォロワー ${me.followers_count} / 投稿 ${me.media_count}`
      + (quota ? ` / 直近24時間のAPI投稿 ${quota.quota_usage}/${quota.config?.quota_total}` : ''));
  } catch (e) {
    console.error(`✗ ${account.displayName}: ${e.message}`);
    failed++;
  }
}

process.exit(failed ? 1 : 0);
