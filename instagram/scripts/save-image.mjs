// Canva などで書き出した画像を URL からダウンロードして images/ に保存する
//   node instagram/scripts/save-image.mjs <account> <保存するファイル名.jpg> <画像URL>
import path from 'node:path';
import { getAccount, downloadJpeg } from './lib.mjs';

const [key, name, url] = process.argv.slice(2);
if (!key || !name || !url) {
  console.error('使い方: node instagram/scripts/save-image.mjs <account> <ファイル名.jpg> <画像URL>');
  process.exit(1);
}
if (!/^[\w.-]+\.jpe?g$/i.test(name)) {
  console.error('ファイル名は英数字・ハイフン・ドットのみで、拡張子は .jpg にしてください');
  process.exit(1);
}

const account = await getAccount(key);
const dest = path.join(account.dir, 'images', name);
try {
  const bytes = await downloadJpeg(url, dest);
  console.log(`保存しました: ${path.relative(process.cwd(), dest)} (${Math.round(bytes / 1024)}KB)`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
