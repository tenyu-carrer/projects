// 使い方：
//   node products/scripts/ledger.mjs build   マスターから ledger.json を作る（進捗は残す）
//   node products/scripts/ledger.mjs check   台帳をチェックする
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseMaster, buildLedger, checkLedger } from "./ledger-lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const masterPath = join(root, "master-v1.0.md");
const ledgerPath = join(root, "ledger.json");

const genres = parseMaster(readFileSync(masterPath, "utf8"));
const cmd = process.argv[2] || "check";

if (cmd === "build") {
  const existing = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, "utf8")).items : [];
  const items = buildLedger(genres, existing);
  writeFileSync(ledgerPath, JSON.stringify({ master: "master-v1.0.md", count: items.length, items }, null, 2) + "\n");
  console.log(`ledger.json：${genres.length}ジャンル・${items.length}行`);
}

const items = JSON.parse(readFileSync(ledgerPath, "utf8")).items;
const errors = checkLedger(items, genres);
if (errors.length) {
  console.error(`台帳チェック：${errors.length}件の問題`);
  errors.slice(0, 50).forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log(`台帳チェック：合格（${items.length}行）`);
