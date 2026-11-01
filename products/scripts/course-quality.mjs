import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const productsRoot = path.resolve(here, '..');
const outputRoot = path.join(productsRoot, 'output');
const reportPath = path.join(productsRoot, 'checks', 'quality-v2-report.json');

const dirs = fs.readdirSync(outputRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{3}-D$/.test(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name));

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const results = dirs.map((entry) => {
  const dir = path.join(outputRoot, entry.name);
  const pack = path.join(dir, '完全パック.md');
  if (!fs.existsSync(pack)) return { id: entry.name, score: 0, status: '不合格', reasons: ['完全パック.mdがない'] };
  const text = fs.readFileSync(pack, 'utf8');
  const files = fs.readdirSync(dir, { recursive: true }).filter((name) => !String(name).endsWith('.py'));
  const allText = files.filter((name) => String(name).endsWith('.md')).map((name) => fs.readFileSync(path.join(dir, name), 'utf8')).join('\n');
  const checks = [
    { name: '本文6000文字以上', points: 20, pass: text.length >= 6000 },
    { name: 'A・B・C・Dの役割', points: 15, pass: ['A｜', 'B｜', 'C｜', 'D｜'].every((key) => text.includes(key)) },
    { name: 'プロンプト5本以上', points: 10, pass: count(allText, /```(?:text)?/g) >= 10 },
    { name: 'トラブル10件以上', points: 10, pass: count(text, /^\d+\. \*\*/gm) >= 10 },
    { name: '検品チェック8項目以上', points: 10, pass: count(allText, /- \[ \]/g) >= 8 },
    { name: '公式URLと確認日', points: 10, pass: /https:\/\//.test(text) && /確認日/.test(text) },
    { name: '権利・安全・収益非保証', points: 10, pass: /権利/.test(text) && /保証しない/.test(text) },
    { name: '実在する付属ファイル3点以上', points: 10, pass: files.length >= 4 },
    { name: '状態表示', points: 5, pass: /状態：/.test(text) }
  ];
  const score = checks.filter((item) => item.pass).reduce((sum, item) => sum + item.points, 0);
  const fatal = /必ず稼げる|放置で儲かる|誰でも成功/.test(text);
  return {
    id: entry.name,
    characters: text.length,
    attachmentCount: files.length - 1,
    score: fatal ? 0 : score,
    status: !fatal && score >= 85 ? '自動検査合格（目視・実機は別）' : '要改訂',
    checks,
    reasons: checks.filter((item) => !item.pass).map((item) => item.name)
  };
});

const report = { generatedAt: new Date().toISOString(), standard: 'QUALITY-STANDARD-V2', results };
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.table(results.map(({ id, characters, attachmentCount, score, status }) => ({ id, characters, attachmentCount, score, status })));
console.log(reportPath);

