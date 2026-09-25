// Instagram アカウントを追加する（フォルダ・方針書のひな形・accounts.json の登録をまとめて行う）
//   node instagram/scripts/new-account.mjs <キー(英小文字)> <表示名> <投稿時刻 HH:MM>
//   例: node instagram/scripts/new-account.mjs cat "猫の癒やしアカウント" 20:00
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { IG_ROOT } from './lib.mjs';

const [key, displayName, postTime] = process.argv.slice(2);
if (!/^[a-z][a-z0-9-]*$/.test(key || '') || !displayName || !/^([01]\d|2[0-3]):[0-5]\d$/.test(postTime || '')) {
  console.error('使い方: node instagram/scripts/new-account.mjs <キー(英小文字)> <表示名> <投稿時刻 HH:MM>');
  process.exit(1);
}

const accountsFile = path.join(IG_ROOT, 'accounts.json');
const accounts = JSON.parse(await readFile(accountsFile, 'utf8'));
if (accounts[key]) {
  console.error(`"${key}" はすでに登録されています`);
  process.exit(1);
}

const envPrefix = `IG_${key.toUpperCase().replace(/-/g, '_')}`;
accounts[key] = { displayName, postTime, envPrefix, apiHost: 'facebook', defaultHashtags: [], enabled: false };
await writeFile(accountsFile, JSON.stringify(accounts, null, 2) + '\n');

// ワークフローにこのアカウントのトークンを渡す行を追記する
const MARK = '          # --- ここまで ---';
for (const wf of ['instagram-prepare.yml', 'instagram-publish.yml']) {
  const file = path.join(IG_ROOT, '..', '.github', 'workflows', wf);
  const text = await readFile(file, 'utf8');
  if (!text.includes(MARK)) throw new Error(`${wf} にトークン欄の目印がありません`);
  const add = `          ${envPrefix}_ACCESS_TOKEN: \${{ secrets.${envPrefix}_ACCESS_TOKEN }}\n`
    + `          ${envPrefix}_USER_ID: \${{ secrets.${envPrefix}_USER_ID }}\n`;
  await writeFile(file, text.replaceAll(MARK, add + MARK));
}

const dir = path.join(IG_ROOT, 'content', key);
for (const sub of ['posts', 'images']) await mkdir(path.join(dir, sub), { recursive: true });
await writeFile(path.join(dir, 'images', '.gitkeep'), '');
await writeFile(path.join(dir, 'posted.json'), '{}\n');
if (!existsSync(path.join(dir, 'GUIDE.md'))) {
  await writeFile(path.join(dir, 'GUIDE.md'), `# 運用方針書：${displayName}

投稿を作る人（Claude を含む）は、毎回この方針書に従います。

## コンセプト
- （誰に、何を届けるアカウントか）
- 口調:

## 投稿の型
| 曜日 | 型 | 内容 |
| --- | --- | --- |
| 毎日 |  |  |

## キャプションの型
\`\`\`
\`\`\`
- ハッシュタグは5〜10個。固定:

## 禁止事項
- 不安をあおる表現、断定表現、医療・投資の助言、出典不明の引用

## Canva
- ひな形デザイン: \`canva.json\` の \`master\` を参照
`);
}
if (!existsSync(path.join(dir, 'canva.json'))) {
  await writeFile(path.join(dir, 'canva.json'), JSON.stringify({ master: '', masterPage: 1, masterUrl: '', textFields: {}, notes: '' }, null, 2) + '\n');
}

console.log(`追加しました: ${displayName} (${key})、毎日 ${postTime} に投稿

次にやること:
  1. content/${key}/GUIDE.md に方針を書く（Claude に頼んでもOK）
  2. Canva でひな形を作り、content/${key}/canva.json に登録する（Claude に頼んでもOK）
  3. GitHub の Secrets に ${envPrefix}_ACCESS_TOKEN と ${envPrefix}_USER_ID を登録する
  4. accounts.json の "${key}" の "enabled" を true にする（ここで毎日の投稿が始まる）`);
