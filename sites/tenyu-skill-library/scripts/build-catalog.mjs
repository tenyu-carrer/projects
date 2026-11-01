import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const projectRoot = path.resolve(siteRoot, '..', '..');
const masterPath = path.join(projectRoot, 'products', 'master-v1.0.md');
const dataPath = path.join(siteRoot, 'data', 'products.json');

const master = fs.readFileSync(masterPath, 'utf8');
const current = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const existing = new Map(current.products.map((product) => [product.id, product]));

const rows = [...master.matchAll(/^(\d{3})｜(.+)$/gm)].map((match) => ({
  id: match[1],
  title: match[2].trim()
}));

if (rows.length !== 180) {
  throw new Error(`商品マスターは180件である必要があります。検出件数: ${rows.length}`);
}

function groupFor(id) {
  const no = Number(id);
  if (no <= 20) return 'AI画像・デザイン・グッズ制作';
  if (no <= 40) return 'AI動画・映像・音声';
  if (no <= 60) return 'SNS・集客・自動投稿';
  if (no <= 80) return 'ブログ・文章・電子書籍';
  if (no <= 100) return 'AIアプリ・システム・自動化開発';
  if (no <= 120) return 'AIビジネス・営業・マーケティング';
  if (no <= 140) return '海外販売・語学・教育';
  if (no <= 160) return 'AIクリエイター・エンタメ・生活';
  return 'AI法人向け業務改善';
}

const products = rows.map(({ id, title }) => existing.get(id) || {
  id,
  title,
  shortTitle: title.replace(/^(Canva|ChatGPT|Claude Code|Suno AI|AI)で?/, '').replace(/する方法$/, ''),
  summary: `${title.replace(/する方法$/, '')}を、初心者向けの手順・道具・完成基準まで含めて学ぶ教材です。`,
  category: groupFor(id),
  source: `products/output/${id}-D/完全パック.md`,
  sourceStatus: '未制作',
  webStatus: 'planned',
  access: { mode: 'locked', utageProductId: null }
});

for (const product of products) {
  product.category ||= groupFor(product.id);
}

const next = {
  version: 2,
  updatedAt: new Date().toISOString().slice(0, 10),
  products
};

fs.writeFileSync(dataPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
console.log(`商品カタログを更新しました: ${products.length}件`);

