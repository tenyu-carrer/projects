# AGENTS.md — このリポジトリで作業する AI（Claude・GPT など）への共有メモ

**最新版：2026-09-28（オーナー確認済み）**
このリポジトリに関わるすべての AI とオーナーが読む**共通の最新情報**です。作業の前に必ず読んでください。
天祐自動化全体の共通入口は、本部リポジトリ `tenyu-carrer/tenyu-meta-social-automation` の `AGENTS.md` と `docs/daily-operations.md` が正本です。

## 1. ひとことで言うと

Instagram 2アカウント（占い・前向きな言葉）は、**約3か月分の画像と文面を作り置きしてあり、毎朝自動で投稿されます。**
オーナーの毎日の作業はなく、PC を切っていても、Claude が止まっていても、作り置きがある間は投稿が続きます。

## 2. 呼び方

| 呼び方 | 指すもの |
| --- | --- |
| **天祐自動化**（天祐AI運用本部） | 会社全体。オーナー 山本、AI-CEO ASTRA、取締役と各部署 |
| **本部**（本部リポジトリ） | `tenyu-carrer/tenyu-meta-social-automation`。Vercel で動く。Instagram の投稿もここの Cron が行う |
| **Instagram部** | CMO サラ配下の部署。担当AIは Claude。組織図は `instagram/ORGANIZATION.md` |
| **デザイン部**（部長 キャン太朗） | CCO 配下。Canva で背景デザインを作る。運用書は `design/README.md` |

## 3. 運用中のアカウント

| アカウント | キー | 内容 | 形式 |
| --- | --- | --- | --- |
| 占い @happy_cristal7 | `fortune` | 1枚目：総合運1位の星座・今日のひとこと・ラッキーカラー／2枚目：誕生日別ラッキー運（仕事・恋愛・金運）と誕生日ごとのアドバイス | カルーセル2枚 |
| 前向きな言葉 @tenyu.worklife | `worklife` | 曜日テーマ（月 仕事・火 家事・水 育児・木 人間関係・金 ねぎらい・土 休む・日 来週への準備）の1日ひとこと | 1枚 |

## 4. しくみ（2026-09-29〜・作り置き方式）

```
【作り置き】Claude（毎週日曜 10:10 に60日先まで補充。Canva は使わない）
  ├ instagram/auto/build.mjs … Canva で1回だけ作った「文字なしの背景」（各5パターン・日ごとにランダム）に
  │                          その日の文字を載せて画像を作る
  └ instagram/auto/queue.mjs … 予約箱（instagram-queue ブランチの instagram/queue/queue.json）に
                               各日 06:50 JST の予約を入れる（予約ID `<YYYYMMDD>-<account>-auto`）
            ↓
【投稿】毎朝 7〜8時台  本部 Vercel Cron `/api/cron/instagram` → Instagram（予約IDごとに1回だけ）
            ↓
【確認】08:10  Claude が予約箱を再実行して確認（未投稿ならここで投稿＝予備）→ オーナーへ短く報告
```

- 作り置き：**2026-09-29〜12-31 分（188件）を予約済み**
- 背景の Canva デザイン：前向き `DAHWfdcXP0g`、占い1枚目 `DAHWfa12BPg`、占い2枚目 `DAHWfe8krng`
- 文面：`instagram/auto/content/fortune.json`（星座・誕生日のアドバイス）、`instagram/auto/content/worklife.json`（曜日ごとに10種類）
- 詳しい手順：`instagram/auto/README.md`
- **毎日の作業で Canva は使わない**（Canva はセッションで使うたびに許可の確認が出て、無人だと止まるため）。Canva を使うのは背景デザインを変えるときだけで、オーナーが PC の前にいるときに行う

## 5. Claude の定期実行（Routine）

| 時刻 | Routine | 内容 |
| --- | --- | --- |
| 毎朝 08:10 | `trig_01CQNjESJZggGQh5LBkrRPDt` | 今日の2件が投稿されたか確認（未投稿なら予約箱の再実行で投稿）して報告 |
| 毎週日曜 10:10 | `trig_01LGmTGx87x3FzuD5PurG5An` | 作り置きを60日先まで補充 |
| 2026-12-10 09:10 | `trig_01SKooWhmRNYYWAdUdUHmSjW` | Meta の鍵の再認証をオーナーにお知らせ |

## 6. 大事な日程

- **Meta の鍵（data_access）の期限：2026-12-26 頃**。12月中旬に、PC作業担当（オーナーPCの Claude Code＋Claude in Chrome）で再認証する。鍵は本部 Vercel の `INSTAGRAM_*`（占い）と `INSTAGRAM_WORKLIFE_*`（前向き）
- 期限が切れても二重投稿などの事故は起きない（投稿が止まるだけ）。入れ直せば再開する

## 7. 役割分担

| 担当 | やること |
| --- | --- |
| オーナー 山本 | 方針の決定、アカウント・鍵の管理（12月の再認証など） |
| Claude | Instagram部・デザイン部の担当AI。文面づくり、作り置きの補充、毎朝の確認と報告、背景デザインの変更。オーナー直属のAI監査役として、投稿URL・重複・失敗も確認する |
| GPT など他の AI | 企画・文面案・レビュー。**予約箱・`instagram/auto`・投稿データは直接変えない**。変えたいことはオーナー経由で Claude に依頼する（二重投稿防止） |
| 本部 Vercel Cron | 毎朝の投稿（AI 不要） |
| GitHub Actions | 予約箱の投稿（08:10 の確認・予備）と結果の記録（AI 不要） |

## 8. ルール

- **二重投稿は絶対にしない**。予約IDは使い回さない。失敗した予約の id を変えて作り直さない
- 特別な投稿を入れたい日は、その日の予約（`<YYYYMMDD>-<account>-…`）を Claude が入れる。自動の分がすでに入っている日は、未投稿の日だけ差し替える
- 方針書（`instagram/content/<account>/GUIDE.md`）の禁止事項を守る：不安をあおらない・断定しない・医療や投資の助言をしない・出典不明の名言を使わない
- トークン（鍵）の値に触らない・ファイルやチャットに書かない
- Vercel の Cron・Project・環境変数は増やさない。GitHub Actions は公開リポジトリで無料範囲
- 旧方式（毎朝 Canva で制作・`.claude/skills/instagram-daily`）、旧アカウント案（`positive`・`psychology`）、`instagram-publish`（`IG_*` Secrets）は使わない

## 9. 作業中（重複防止のため、作業を始める AI がここに書き、終わったら消す）

- なし

## 10. どこに何があるか

| パス | 内容 |
| --- | --- |
| `instagram/auto/README.md` | **作り置き方式の説明と手順（正本）** |
| `instagram/auto/content/` | 占い・前向きな言葉の文面 |
| `instagram/auto/backgrounds/` | Canva で作った文字なしの背景 |
| `instagram/auto/posts/`・`images/` | 作り置きした投稿（キャプション）と画像 |
| `instagram/content/<account>/GUIDE.md` | 各アカウントの方針書（キャラ・口調・禁止事項） |
| `instagram/ORGANIZATION.md` | Instagram部の組織図 |
| `design/README.md` | デザイン部（Canva）の運用書 |
| `instagram-queue` ブランチ `instagram/queue/queue.json` | 予約箱（投稿の予定） |
| `instagram-queue` ブランチ `instagram/queue/results/` | 予約箱の投稿結果（media ID・URL） |

## 11. 最近の実績（新しいものを上に）

- **2026-09-28 深夜**：作り置き方式に切り替え（オーナー決定）。9/29〜12/31 の188件を予約。本部 PR #160（毎朝の Cron で予約箱を投稿）・#161（本部資料の更新）・#162（GPT 向けの文章）
- **2026-09-28**：旧方式で2アカウント投稿（Canva の許可待ちで夜 21:32 にずれた。これが作り置き方式に変えたきっかけ）
  - 占い（おうし座）：https://www.instagram.com/p/Dd1MSjplz7M/（media ID `18109689161130969`）
  - 前向きな言葉：https://www.instagram.com/p/Dd1MbW9F4fU/（media ID `18102532412345142`）
- **2026-09-27**：2アカウントの初投稿に成功（占い https://www.instagram.com/p/DdyDDQFjLj6/ 、前向き https://www.instagram.com/p/DdyDEX7jPoD/ ）
