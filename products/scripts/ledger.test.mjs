import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseMaster, buildLedger, checkLedger } from "./ledger-lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const genres = parseMaster(readFileSync(join(root, "master-v1.0.md"), "utf8"));

test("マスターは001〜180の180件で、名前がそのまま入る", () => {
  assert.equal(genres.length, 180);
  assert.equal(genres[0].no, "001");
  assert.equal(genres[16].name, "SUZURIでTシャツを作って販売する方法");
  assert.equal(genres[20].name, "AIで動画編集をする方法");
  assert.equal(genres[35].name, "Suno AIでオリジナル曲を作る方法");
  assert.equal(genres[179].no, "180");
  assert.equal(genres[179].part, "第9部｜AI法人向け業務改善");
});

test("台帳は720行で、作り直しても進捗が残る", () => {
  const rows = buildLedger(genres);
  assert.equal(rows.length, 720);
  assert.deepEqual(checkLedger(rows, genres), []);
  rows.find((r) => r.id === "036-C").status = "試作";
  const again = buildLedger(genres, rows);
  assert.equal(again.find((r) => r.id === "036-C").status, "試作");
});

test("承認・検査・権利がそろわないと販売中にできない", () => {
  const rows = buildLedger(genres);
  const r = rows.find((x) => x.id === "017-C");
  r.status = "販売中";
  const errs = checkLedger(rows, genres).join("\n");
  assert.match(errs, /品質検査に合格していない/);
  assert.match(errs, /商用利用が「可」と確認できていない/);
  assert.match(errs, /オーナー承認なし/);
  assert.match(errs, /販売 URL がない/);
});

test("販売 URL は独自ドメインだけ", () => {
  const rows = buildLedger(genres);
  Object.assign(rows[1], { sales_url: "https://utage-system.com/p/xxx" });
  assert.match(checkLedger(rows, genres).join("\n"), /info.career-design.co.jp/);
});
