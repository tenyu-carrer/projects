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

// 付属のMarkdown（設計シートとプロンプトなど）から、コードブロックのプロンプトを全部取り出して教材ページに並べる
const FENCE = '`'.repeat(3);
const promptBlock = new RegExp(`${FENCE}(?:text)?\\r?\\n([\\s\\S]*?)${FENCE}`, 'g');
const outputRoot = path.resolve(siteRoot, '..', '..', 'products', 'output');
for (const product of data.products) {
  if (!product.lesson) continue;
  // C（再利用できる道具）の設計シート・プロンプトがダウンロード欄に無ければ、コピーして追加する
  const cDir = path.join(outputRoot, `${product.id}-C`);
  if (product.webStatus === 'sample' && fs.existsSync(cDir)) {
    product.lesson.downloads ||= [];
    for (const name of fs.readdirSync(cDir).filter((n) => n.endsWith('.md'))) {
      const url = `assets/downloads/${product.id}/${name}`;
      if (product.lesson.downloads.some((d) => decodeURI(d.url) === url || d.url.endsWith(`/${name}`))) continue;
      fs.mkdirSync(path.join(siteRoot, 'assets', 'downloads', product.id), { recursive: true });
      fs.copyFileSync(path.join(cDir, name), path.join(siteRoot, url));
      product.lesson.downloads.push({ label: name.replace(/\.md$/, ''), note: 'C｜再利用できる道具（設計シート・プロンプト）。', url });
    }
  }
  const prompts = [];
  for (const item of product.lesson.downloads || []) {
    if (!/\.md$/i.test(item.url || '')) continue;
    const file = path.join(siteRoot, decodeURI(item.url));
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(promptBlock)) {
      const body = match[1].trim();
      if (body && !prompts.includes(body)) prompts.push(body);
    }
  }
  // 講座本文（D 完全パック）の ```text プロンプトも加える
  const dPack = path.join(outputRoot, `${product.id}-D`, '完全パック.md');
  if (product.webStatus === 'sample' && fs.existsSync(dPack)) {
    const textBlock = new RegExp(`${FENCE}text\\r?\\n([\\s\\S]*?)${FENCE}`, 'g');
    for (const match of fs.readFileSync(dPack, 'utf8').matchAll(textBlock)) {
      const body = match[1].trim();
      if (body && !prompts.includes(body)) prompts.push(body);
    }
  }
  if (prompts.length) product.lesson.promptLibrary = prompts;
  else delete product.lesson.promptLibrary;
}

fs.writeFileSync(productsPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`教材データを同期しました: ${fs.readdirSync(lessonsDir).filter((name) => name.endsWith('.json')).length}件`);
