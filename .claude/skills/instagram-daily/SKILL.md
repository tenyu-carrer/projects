---
name: instagram-daily
description: Instagram部の毎朝の投稿（占い @happy_cristal7 と 前向きな言葉 @tenyu.worklife）。Canva で画像を作り、予約箱に入れて投稿し、media ID と URL を確認する。毎朝の定期実行（Routine）と「今日の分を投稿して」で使う。
---

# 毎朝の投稿（2アカウント）— 2026-09-27 オーナー決定

担当：Claude（Instagram部長・デザイン部）。Canva の制作はオーナー確認不要（オーナー決定）。
投稿経路：`instagram-queue` ブランチの `instagram/queue/queue.json` → GitHub Actions「instagram 予約箱の投稿」→ 本部 `/api/instagram/dispatch`（GitHub OIDC 署名）→ Instagram。
トークンは本部 Vercel にある（`INSTAGRAM_*` / `INSTAGRAM_WORKLIFE_*`）。**トークンに触らない・書かない。**

## 0. 準備
```bash
cd <projects の clone>
git fetch origin claude/zealous-carson-5kpdye instagram-queue
git checkout -B claude/zealous-carson-5kpdye origin/claude/zealous-carson-5kpdye
```
- 今日の日付は **日本時間**（`TZ=Asia/Tokyo date +%F`）。以下 D とする
- `instagram/content/fortune/GUIDE.md`・`instagram/content/worklife/GUIDE.md` と各 `canva.json` を読む
- `git show origin/instagram-queue:instagram/queue/queue.json` を見て、今日の予約（id `D-fortune-*`・`D-worklife-*`）が**すでにあれば作り直さない**（手順 3 から）

## 1. 画像を作る（Canva・確認不要）
**占い（カルーセル2枚）**：`fortune/canva.json` の `carouselMasters` の2つをそれぞれ `copy-design` →
- 1枚目：日付「◯月◯日 今日の運勢」、総合運1位の星座、ひとことメッセージ（1行・20字以内）、ラッキーカラー
- 2枚目：日付、仕事運・恋愛運・金運の1位の誕生日（「1月4日」形式・3つとも別の日）
- 星座1位は直近12日の `fortune/posts/*.json` と重ならないようにする。日付・星座・誕生日は1枚目・2枚目・キャプションで一致させる
**前向きな言葉（1枚）**：`worklife/canva.json` の `master` を複製 → 日付と「今日のひとこと」（曜日テーマ・4行まで）
- 共通：サムネイルで文字切れ・はみ出し・重なりがないか自分で確認して直す → commit → アカウントのフォルダへ移動 → タイトル `<account> D` → JPG（幅1080・品質90）で書き出し

## 2. 投稿データを置いて画像を保存する
- `instagram/content/fortune/posts/D.json`（`type: carousel`、`images` に書き出しURL2つ）と `instagram/content/worklife/posts/D.json`（`type: image`）を作る。キャプションは各 GUIDE の型、`hashtags` は別に書く
- `node instagram/scripts/validate.mjs fortune worklife` → commit → `git push origin claude/zealous-carson-5kpdye`
- GitHub Actions「instagram 準備と指示投稿」が画像を `images/` に保存して「Canva の画像を保存」コミットを積むので、`git pull` して `images/D-1.jpg`・`D-2.jpg`（占い）と `D.jpg`（前向き）ができるまで待つ（1分ほど）。そのコミットの SHA を S とする
- 保存された画像を Read で開いて、中身が正しいか確認する

## 3. 予約箱に入れて投稿する
- `git checkout -B instagram-queue origin/instagram-queue`
- `queue.json` の `items` に追加（まだ無い場合だけ。id は二度と使い回さない）
  - `{"id":"D-fortune-<星座ローマ字>","account":"fortune","publishAt":"<今のUTC時刻>","caption":"<本文>\n\n#タグ…","imageUrls":["https://raw.githubusercontent.com/tenyu-carrer/projects/S/instagram/content/fortune/images/D-1.jpg", ".../D-2.jpg"]}`
  - `{"id":"D-worklife-1","account":"worklife","publishAt":"<今のUTC時刻>","caption":"…","imageUrl":"https://raw.githubusercontent.com/tenyu-carrer/projects/S/instagram/content/worklife/images/D.jpg"}`
- 予約がすでにあった場合は、`queue.json` の `lastRun` を今の時刻に更新するだけにする（push で投稿処理が動く）
- 画像URLが200で取れることを curl で確かめる → commit → `git push origin instagram-queue`

## 4. 確認して報告する
- 1分ほど待って `git pull origin instagram-queue` → `instagram/queue/results/` の最新ファイルを読む
- 今日の2件が `published`（または `already_published`）で `mediaId` と `url` があれば成功
- `failed` の場合：`error` を読む。**同じ予約を消したり id を変えて作り直したりしない**（二重投稿防止）。トークン期限切れ・権限エラーなら、オーナーに「Meta の鍵の入れ直しが必要」と日本語で短く知らせる
- 結果を `instagram/content/<account>/posted.json` には書かない（本部の記録が正）。本部 `docs/handoff-log.md` への記録は、失敗時・変更時だけでよい

## 守ること
- 毎日の投稿は各アカウント1件。オーナーの停止指示があったら止める
- 方針書の禁止事項（不安をあおらない・断定しない・医療や投資の助言をしない・出典不明の名言を使わない）
- `data_access_expires_at` は 2026-12-26 頃。12月中旬になったら、オーナーに Meta の再認証（PC作業担当の手順）をお願いする
