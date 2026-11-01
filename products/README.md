# コンテンツ商品マスター（天祐）

正本：`master-v1.0.md`（001〜180・番号と名前は変えない・新ジャンルは181から）
商品ID：`001-A`〜`180-D`（A 無料／B 魚＝完成品／C 釣り竿＝道具／D 釣り竿の作り方＝講座）

| ファイル | 中身 |
|---|---|
| `ledger.json` | 商品台帳 720行（状態・品質・権利・UTAGE ID・販売URL・売上・承認・履歴） |
| `templates/A〜D.md` | 4つの型（必ず入れるもの・合格の条件） |
| `genres/<番号>-<名前>.json` | ジャンル別の設定（使うサービス・確認する規約・4段の案） |
| `existing-utage.json` | UTAGE に既にある関連資産（重複して作らない） |
| `output/<商品ID>/` | 成果物　／　`checks/<商品ID>.json` 検査結果（合格は再生成しない） |
| `QUALITY-STANDARD-V2.md` | 1000万円規模を想定した教材・素材・検品の共通品質基準 |
| `CURRICULUM-ARCHITECTURE.md` | 固定番号と初心者向け推奨学習ルートの全体設計 |

## コマンド
- `node products/scripts/ledger.mjs build`：マスターから台帳を作る（進捗は残る）
- `node products/scripts/ledger.mjs check`：台帳チェック
- `node --test products/scripts/ledger.test.mjs`：テスト
- `node products/scripts/course-quality.mjs`：D講座の密度・付属物・安全表記を自動検査

## 決まり
- 状態：企画 → 試作 → 検査合格 → 承認待ち → 販売中（停止・商品化しない もあり）
- 品質「合格」・商用利用「可」（A 以外）・オーナー承認・販売 URL（info.career-design.co.jp）がそろわないと販売中にできない（チェックで止まる）
- 規約が確認できないものは「不明」のまま。勝手に「可」にしない
- 本番公開・決済・新しい課金はオーナー承認のあと
