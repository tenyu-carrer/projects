---
name: instagram-post-now
description: Instagram部で、オーナーの指示を受けて1件の投稿をすぐ出す（指示投稿）。「占いを今すぐ投稿して」「心理学の投稿を1本出して」「この文章で前向きアカウントに投稿して」などで使う。
---

# 指示投稿（今すぐ投稿）

オーナーの指示1件につき、1つの投稿を作ってすぐ公開する。push をきっかけに GitHub Actions
（`instagram-prepare`「instagram 準備と指示投稿」）が画像保存 → チェック → 投稿まで行う。

## 手順

1. **指示を確認する**
   - どのアカウント（`instagram/accounts.json` のキー）か。あいまいなら確認する
   - 内容の指定があるか（テーマ・文章・画像）。指定がなければ方針書 `GUIDE.md` の今日の曜日の型で作る
   - `AGENTS.md` の「作業中」欄を確認し、ほかの AI が同じアカウントを作業中でないか見る

2. **投稿を作る**（画像はオーナー指定がなければ Canva で作る。手順は `instagram-weekly` の 2-2〜2-6 と同じ）
   - Canva: `canva.json` の `master` を複製 → 文字を差し替え → サムネイルで確認 → commit → JPG 書き出し

3. **投稿データを置く**
   - ファイル名: `instagram/content/<account>/posts/<今日の日付(JST)>-now-<連番>.json`（例: `2026-09-23-now-1.json`）
   - 中身: 通常の投稿データに `"publish": "now"` を加える。`image` は Canva の書き出し URL のままでよい
   ```json
   { "publish": "now", "type": "image", "image": "<書き出しURL>", "canvaDesignId": "DA...", "caption": "...", "hashtags": ["..."] }
   ```
   - `node instagram/scripts/validate.mjs <account>` でエラーがないこと

4. **push して結果を確認する**
   - コミットして作業ブランチに push する
   - GitHub の Actions「instagram 準備と指示投稿」の実行結果を確認する（`mcp__github__actions_list` など）
   - 成功したら、ブランチを pull して `posted.json` に記録された **permalink（投稿の URL）** をオーナーに報告する
   - 失敗したら、ログ（`mcp__github__get_job_logs`）で原因を確認して報告する。同じ投稿を勝手に作り直して二重投稿しない

## 守ること
- 指示投稿は、日付が今日（日本時間）の `"publish": "now"` のものだけが投稿される。昨日以前の指示は投稿されない
- アカウントの `enabled`（毎日投稿のスイッチ）とは関係なく投稿される。オーナーの指示があるときだけ使う
- 方針書の禁止事項を守る。「作った」「pushした」だけで完了報告しない。投稿の URL を確認してから報告する
