import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, '..');
const lessonsDir = path.join(siteRoot, 'data', 'lessons');
const productsPath = path.join(siteRoot, 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

for (const file of fs.readdirSync(lessonsDir).filter((name) => name.endsWith('.json'))) {
  const update = JSON.parse(fs.readFileSync(path.join(lessonsDir, file), 'utf8'));
  const product = data.products.find((item) => item.id === update.id);
  if (!product) throw new Error(`商品 ${update.id} がカタログにありません`);
  const lessonUpdate = update.lesson;
  delete update.lesson;
  Object.assign(product, update);
  if (lessonUpdate) product.lesson = { ...(product.lesson || {}), ...lessonUpdate };
}

fs.writeFileSync(productsPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`教材データを同期しました: ${fs.readdirSync(lessonsDir).filter((name) => name.endsWith('.json')).length}件`);

