# AGENTS.md — このリポジトリで作業する AI（Claude・GPT など）への共有メモ

このファイルは、このリポジトリに関わるすべての AI とオーナーが読む**共通の最新情報**です。
作業を始める前に必ず読み、役割や運用ルールが変わったらこのファイルを更新してください。

## 呼び方（オーナーと AI の共通認識）

| 呼び方 | 指すもの |
| --- | --- |
| **天祐自動化**（正式名: 天祐AI運用本部） | 会社全体。オーナー 山本、AI-CEO ASTRA、6人の取締役と各部署 |
| TENYU本部・本部リポジトリ | `tenyu-carrer/tenyu-meta-social-automation`（Threads・記事・TENYU公式Instagram など。Vercel で動く） |
| **Instagram部** | 天祐自動化の CMO サラ配下の部署。正本はこのリポジトリ `tenyu-carrer/projects`（GitHub Actions で動く） |
| **デザイン部**／**キャン太朗** | 天祐自動化の CCO 配下の部署で、Canva で画像を作る。部長は **キャン太朗**（オーナー決定）。運用書は `design/README.md` |

オーナーが「天祐自動化の Instagram部の続き」と言ったら、このファイルと `instagram/ORGANIZATION.md` から状況を把握して再開する。
天祐自動化全体の共通入口（読み込み順・確定事項・安全ルール）は、本部リポジトリの `AGENTS.md` と `.claude/skills/tenyu/SKILL.md` が正本。

## プロジェクト: Instagram 事業部（複数アカウントの毎日自動運用）

組織上は、天祐AI運用本部の **CMO・メディア集客担当取締役 サラ配下の「Instagram部」** です（2026-09-23 オーナー決定）。
部長の下にアカウントごとの課長を置きます。組織図は `instagram/ORGANIZATION.md`。
**仕組み（実行基盤）は TENYU（`tenyu-carrer/tenyu-meta-social-automation`）の Vercel とは別**で、このリポジトリの GitHub Actions で動きます。
TENYU の Instagram 自動投稿（TENYU公式課、Vercel Cron）とは投稿先アカウントも仕組みも別で、二重化ではありません。
Claude はオーナー直属のAI監査役であり、あわせて **Instagram部（部長・各課長）とデザイン部（Canva 制作）の担当AI** です（2026-09-25 オーナー決定）。企画・文面・Canva 画像・指示投稿・結果報告まで Claude が行い、監査役として投稿URL・重複・失敗も自分で確認します。毎日の自動投稿は停止中のまま（再開はオーナー指示）。

アカウントの一覧・投稿時刻・稼働状態の正本は `instagram/accounts.json`。現時点:

| アカウント | 内容 | 投稿時刻（日本時間） | 状態 |
| --- | --- | --- | --- |
| 毎日占い (`fortune`) | 今日の運勢・12星座ランキング・星座別の傾向と注意・今月のいい日 | 毎朝 6:30 | 準備中（トークン未登録） |
| 前向きな言葉 (`positive`) | 1日1つの前向きな言葉（曜日テーマあり） | 毎朝 7:00 | 準備中（トークン未登録） |
| 心理学の言葉 (`psychology`) | 心理効果を今日から使えるひと言に | 毎晩 20:00 | 準備中（トークン未登録） |

目的: 毎日投稿を続けてフォロワーを増やす。アカウントは今後増やしていく。自動フォロー・自動いいね等の規約違反はしない。

### 現在のフェーズ: 開発中（2026-09-23 オーナー指示）

- **毎日の自動投稿は停止中**（`instagram-publish` の schedule をコメントアウト、全アカウント `enabled: false`）。オーナーの再開指示まで動かさない
- **週1回の自動制作も未設定**。オーナーの指示まで設定しない
- 今は「**指示したら投稿できる**」（指示投稿）を開発・検証する段階。手順は `.claude/skills/instagram-post-now/SKILL.md`

### 最新の実績（新しいものを上に追記）

- **2026-09-25〜26 Claude**：@happy_cristal7（占い・`fortune`）への実投稿テスト1件を準備中。
  - 投稿経路：本部の方針変更（本部 `docs/handoff-log.md` 2026-09-25 5報目・ChatGPT）により、Instagram の投稿は**本部 Vercel の `/api/instagram/post`**（`INSTAGRAM_USER_ID` / `INSTAGRAM_ACCESS_TOKEN`）で行う。このリポジトリの GitHub Actions からの投稿（`IG_*` Secrets）は使わない
  - 本部の手動投稿は「1日1回」の枠だったため、投稿ごとに1回にする修正（`action=now`＋`requestId`）を本部 PR #153 で提出（オーナーのマージ待ち）
  - 画像：Canva「fortune 2026-09-26」（`DAHWNihwk9c`）→ `instagram/content/fortune/images/2026-09-26.jpg`、投稿データ `posts/2026-09-26.json`
  - 実行：投稿ボタンの合言葉（`INSTAGRAM_POST_KEY`）はオーナーが入れて開く。結果（media ID・投稿URL）を Claude が確認して記録する

- **2026-09-25 ChatGPT Work**：新しく連携した Instagram アカウント **@happy_cristal7** に、Canva 画像2枚のカルーセルを投稿（投稿ID `18135517288631232`、Meta API で公開成功を確認済みとの報告）。
  Canva デザイン「fortune かに座 誕生日TOP3 2026-09-25」（`DAHWM_EMrrk`）、プロフィール画像「happy_cristal7 プロフィール画像」（`DAHWMkf9DcU`）。
  この投稿は **ChatGPT 側の Meta 連携から直接** 行われたもので、このリポジトリの GitHub Actions 経由ではない（`posted.json` には記録なし）。定期投稿の設定は変更なし。
  - 未確認：@happy_cristal7 がどのアカウントキー（`fortune` など）に当たるか、GitHub Secrets（`IG_<キー>_ACCESS_TOKEN` / `_USER_ID`）に登録済みか。
    push のたびに `instagram-prepare` の「Instagram 連携確認（読み取りのみ）」ステップでユーザー名・フォロワー数が確認できる。

## 全体の流れ（すべてクラウドで動くので、オーナーの PC は不要）

**指示投稿（今すぐ）**: オーナーが Claude に指示 → Claude が文面と Canva 画像を作り、`"publish": "now"` を付けた今日の投稿データを push →
GitHub Actions `instagram-prepare`（「instagram 準備と指示投稿」）が画像保存・チェック・投稿まで実行 → Claude が投稿 URL を確認して報告

**毎日投稿（停止中・再開はオーナー指示）**:

1. **週1回・制作**（定期実行。担当は Claude・オーナーの再開指示まで設定しない）: 方針書に沿って文面を作り、Canva で画像を作り、`posts/` に登録して push
2. **push 直後・準備**（GitHub Actions `instagram-prepare`）: Canva の画像を `images/` に保存し、内容をチェック
3. **毎日・投稿**（GitHub Actions `instagram-publish`、30分ごとに起動）: 各アカウントの投稿時刻を過ぎたら、その日の投稿を Instagram API で公開

## アカウントを増やすとき

1. `node instagram/scripts/new-account.mjs <キー> <表示名> <投稿時刻>` を実行（フォルダ・方針書のひな形・登録を作る）
2. 方針書 `GUIDE.md` を書き、Canva のひな形を作って `canva.json` に登録する
3. オーナーが GitHub Secrets に `IG_<キー>_ACCESS_TOKEN` / `IG_<キー>_USER_ID` を登録する
4. `accounts.json` の `enabled` を `true` にする → 翌日から毎日投稿される（ワークフローへのトークン欄の追記は `new-account.mjs` が自動で行う）

## 役割分担

| 担当 | やること |
| --- | --- |
| オーナー | 方針の決定、最終確認、各種アカウント・トークンの管理 |
| Claude | Instagram部（部長・各課長）とデザイン部の担当AI。企画・文面・Canva 画像・指示投稿・保守・結果報告。あわせてオーナー直属のAI監査役として、予定と実績の照合、投稿URL・重複・失敗を確認する |
| GPT など他の AI | 企画・文面案・レビュー。**投稿データを直接作る場合は、事前にこのファイルの「作業中」に書く**（同じ日を二重に作らないため） |
| デザイン部（Canva・部長 キャン太朗） | CCO 配下。Instagram部の各課の依頼を受けて画像を作る（制作担当AIは Claude） |
| GitHub Actions | 画像の保存、チェック、毎朝の投稿（AI は不要） |

## 作業中（重複防止のため、作業を始める AI がここに書き、終わったら消す）

- 2026-09-25 Claude：`fortune`（@happy_cristal7）の GitHub Secrets 登録後の連携確認と、初回の指示投稿

## どこに何があるか

| パス | 内容 |
| --- | --- |
| `instagram/ORGANIZATION.md` | **Instagram部の組織図**（部長・課長・課の一覧） |
| `design/README.md` | **デザイン部（Canva）の運用書**（担当デザイナー・連携の流れ・ルール）。画像を作る前に必ず読む |
| `design/canva.json` | Canva のフォルダ ID（デザイン部の親フォルダ・ひな形・アカウント別） |
| `instagram/content/<account>/GUIDE.md` | **方針書**（キャラ・口調・投稿の型・禁止事項）。文面を作る前に必ず読む |
| `instagram/content/<account>/canva.json` | Canva のひな形デザインID と、差し替える文字の目安 |
| `instagram/content/<account>/posts/YYYY-MM-DD.json` | 投稿データ（1日1ファイル） |
| `instagram/content/<account>/images/` | 投稿画像（JPEG, 1080×1350） |
| `instagram/content/<account>/posted.json` | 投稿済みの記録（自動更新。手で編集しない） |
| `.claude/skills/instagram-post-now/SKILL.md` | 指示投稿（今すぐ投稿）の手順書 |
| `.claude/skills/instagram-weekly/SKILL.md` | 週次制作の手順書（毎日投稿の再開後に使う） |
| `instagram/README.md` | 仕組みとセットアップの詳細 |

## 投稿データの形式

```json
{
  "type": "image",
  "image": "2026-10-01.jpg",
  "canvaDesignId": "DAxxxxxxxxx",
  "caption": "本文（ハッシュタグは hashtags に分けて書く）",
  "hashtags": ["占い", "今日の運勢"]
}
```

- `type`: `image` / `carousel`（`images` に2〜10枚）/ `reel`（`video`）/ `story`
- 画像は JPEG のみ。`image` に Canva の書き出し URL を直接書いてもよい（push 後に自動で保存される。URL は約20時間で切れる）
- 作ったら `node instagram/scripts/validate.mjs` でチェックする

## ルール

- Canva の画像制作は、Claude が毎回オーナーに確認せずに行ってよい（2026-09-25 オーナー決定）。Instagram部の制作の流れに組み込む（ひな形そのものの変更だけはオーナー確認）

- 方針書の禁止事項を守る（不安をあおらない・断定しない・医療や投資の助言をしない・出典不明の名言を使わない）
- `posted.json` とワークフローの秘密情報（トークン）には触らない。トークンをファイルやチャットに書かない
- 投稿済みの日付のファイルは編集しない（Instagram 側は変わらないため）
- 定期投稿は GitHub の**デフォルトブランチ**の内容で動く。投稿データはデフォルトブランチに入れる
