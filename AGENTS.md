# AGENTS.md — このリポジトリで作業する AI（Claude・GPT など）への共有メモ

このファイルは、このリポジトリに関わるすべての AI とオーナーが読む**共通の最新情報**です。
作業を始める前に必ず読み、役割や運用ルールが変わったらこのファイルを更新してください。

## 呼び方（オーナーと AI の共通認識）

| 呼び方 | 指すもの |
| --- | --- |
| **天祐自動化**（正式名: 天祐AI運用本部） | 会社全体。オーナー 山本、AI-CEO ASTRA、6人の取締役と各部署 |
| TENYU本部・本部リポジトリ | `tenyu-carrer/tenyu-meta-social-automation`（Threads・記事・TENYU公式Instagram など。Vercel で動く） |
| **Instagram部** | 天祐自動化の CMO サラ配下の部署。方針書・Canva・予約箱はこのリポジトリ、投稿は本部 Vercel の予約箱入口 `/api/instagram/dispatch` |
| **デザイン部**／**キャン太朗** | 天祐自動化の CCO 配下の部署で、Canva で画像を作る。部長は **キャン太朗**（オーナー決定）。運用書は `design/README.md` |

オーナーが「天祐自動化の Instagram部の続き」と言ったら、このファイルと `instagram/ORGANIZATION.md` から状況を把握して再開する。
天祐自動化全体の共通入口（読み込み順・確定事項・安全ルール）は、本部リポジトリの `AGENTS.md` と `.claude/skills/tenyu/SKILL.md` が正本。

## プロジェクト: Instagram 事業部（最新版・2026-09-27 オーナー確認済み）

組織上は、天祐AI運用本部の **CMO・メディア集客担当取締役 サラ配下の「Instagram部」** です。組織図は `instagram/ORGANIZATION.md`。
Claude はオーナー直属のAI監査役であり、あわせて **Instagram部（部長・各課長）とデザイン部（Canva 制作）の担当AI** です。企画・文面・Canva 画像・投稿・確認・報告まで Claude が行います。

### 運用中のアカウント（毎朝 6:50 JST・稼働中）

| アカウント | キー | 内容 | 形式 |
| --- | --- | --- | --- |
| 占い @happy_cristal7 | `fortune` | 総合運1位の星座／誕生日別ラッキー運（仕事・恋愛・金運） | カルーセル2枚 |
| 前向きな言葉 @tenyu.worklife | `worklife` | 仕事・家事・育児・プライベートの前向きな1日ひとこと | 1枚 |

- **2026-09-29〜 作り置き方式（オーナー決定 2026-09-28）**：Canva で1回だけ作った文字なしの背景（各5パターン）に、プログラムで文字を載せた画像を `instagram/auto/` に作り置き（12/31 分まで予約済み）。投稿は毎朝の本部 Vercel Cron `/api/cron/instagram` が予約IDごとに1回だけ行う。Claude は 08:10 に確認（Routine `trig_01CQNjESJZggGQh5LBkrRPDt`）、毎週日曜に補充（`trig_01LGmTGx87x3FzuD5PurG5An`）。**毎日の作業で Canva は使わない**。詳しくは `instagram/auto/README.md`
- 他の AI（GPT など）は予約箱・`instagram/auto`・投稿データを直接変えない。変えたいことはオーナー経由で Claude に依頼する
- （旧）毎朝 6:50 JST に Claude が Canva で制作していた方式は 2026-09-28 で終了
- **オーナーの日々の作業なし・PC不要**。Claude のセッションのモードは「編集を受け入れる」のまま（毎朝の操作は `.claude/settings.json` で事前許可済み）
- 手順の正本：`.claude/skills/instagram-daily/SKILL.md`
- 枠：Vercel の Cron・Project・環境変数は増やさない。GPT は使わない。GitHub Actions は無料範囲。Claude Pro の使用量は使うので、アカウント追加時は様子を見る
- Meta の鍵：本部 Vercel の `INSTAGRAM_*`（占い）と `INSTAGRAM_WORKLIFE_*`（前向き）。期限なしのページトークン。**12月中旬に再認証**（data_access 期限 2026-12-26 頃）
- 旧 `positive`・`psychology` アカウント案と、このリポジトリの `instagram-publish`（GitHub Actions の毎日投稿・`IG_*` Secrets）は使わない

### 最新の実績（新しいものを上に追記）

- **2026-09-28 Claude：毎朝の定期実行で2アカウント投稿（Canva の一時エラーで夜 21:32 頃にずれた）**
  - 占い（おうし座）：media ID `18109689161130969`、https://www.instagram.com/p/Dd1MSjplz7M/
  - 前向きな言葉：media ID `18102532412345142`、https://www.instagram.com/p/Dd1MbW9F4fU/
  - 前向きは1回目が `meta:Media ID is not available`（画像の準備待ちで未投稿）→ 同じ予約IDのまま予約箱を再実行して投稿。占いは `already_published` で二重投稿なし

- **2026-09-27 Claude：2アカウントの実投稿に成功（予約箱経由）**
  - 占い @happy_cristal7（カルーセル2枚・みずがめ座）：media ID `18105896111096158`、https://www.instagram.com/p/DdyDDQFjLj6/
  - 前向きな言葉 @tenyu.worklife（初投稿）：media ID `17900463933668226`、https://www.instagram.com/p/DdyDEX7jPoD/
  - 経路：`instagram-queue` の `queue.json` → Actions「instagram 予約箱の投稿」（GitHub OIDC）→ 本部 `/api/instagram/dispatch`（本部 PR #154・#156）
  - **毎朝 6:50 JST の定期実行を設定**（Routine `trig_01CQNjESJZggGQh5LBkrRPDt`、このセッションを起こして `.claude/skills/instagram-daily/SKILL.md` の手順で2アカウント投稿）
  - Meta の鍵：ページトークンは期限なし。`data_access_expires_at` が 2026-12-26 頃なので、12月中旬に再認証が必要

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

## 全体の流れ（すべてクラウド。オーナーの PC は不要）

```
毎朝 6:50  Claude（定期実行）
  ├ Canva：ひな形を複製 → 文字を差し替え → 確認 → JPG 書き出し
  ├ posts/<日付>.json を push → Actions「instagram 準備と指示投稿」が画像を images/ に保存
  └ instagram-queue の queue.json に予約を追加して push
        ↓ Actions「instagram 予約箱の投稿」（GitHub OIDC 署名）
     本部 /api/instagram/dispatch → Instagram（予約IDごとに1回だけ）
        ↓
  Claude が instagram/queue/results/ で media ID・URL を確認して報告
```

## アカウントを増やすとき（3つ目以降・2アカウントが数日安定してから）

1. オーナーがテーマを決める（アカウントがあればユーザー名も）
2. Claude が `instagram/content/<キー>/GUIDE.md`・`canva.json`・Canva ひな形とフォルダを作る
3. PC作業担当（オーナーPCの Claude Code＋Claude in Chrome、1回だけ）：Facebook ページ作成 → Instagram 連携 → 期限なしページトークンを本部 Vercel の `INSTAGRAM_<キー>_ACCESS_TOKEN` / `_USER_ID` に設定
4. Claude が本部 `lib/instagramQueue.js` の `QUEUE_ACCOUNT_ENV` にアカウントを追加 → テスト投稿 → `instagram-daily` に追加して毎朝の同じ枠で順番に処理（夜が合う内容なら夜の起動を1つ足す）

## 役割分担

| 担当 | やること |
| --- | --- |
| オーナー | 方針の決定、最終確認、各種アカウント・トークンの管理 |
| Claude | Instagram部（部長・各課長）とデザイン部の担当AI。企画・文面・Canva 画像・指示投稿・保守・結果報告。あわせてオーナー直属のAI監査役として、予定と実績の照合、投稿URL・重複・失敗を確認する |
| GPT など他の AI | 企画・文面案・レビュー。**投稿データを直接作る場合は、事前にこのファイルの「作業中」に書く**（同じ日を二重に作らないため） |
| デザイン部（Canva・部長 キャン太朗） | CCO 配下。Instagram部の各課の依頼を受けて画像を作る（制作担当AIは Claude） |
| GitHub Actions | 画像の保存、チェック、毎朝の投稿（AI は不要） |

## 作業中（重複防止のため、作業を始める AI がここに書き、終わったら消す）

- なし

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
