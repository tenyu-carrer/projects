---
name: instagram-weekly
description: Instagram部（占い・前向きな言葉・心理学の言葉など全アカウント）の翌週分の投稿を、Canva で画像を作って予約する週次作業。「来週分を作って」「インスタの投稿を作成」や、週1回の定期実行で使う。
---

# Instagram 週次制作

`instagram/content/<account>/` の方針書に従い、**まだ登録されていない日**の投稿を、今日から14日先までの範囲で、日付の早い順に最大7日分作る。
（週1回の実行で常に1〜2週間分の作り置きができ、1回失敗しても投稿が途切れない）
対象アカウントの指定がなければ `instagram/accounts.json` の全アカウントを対象にする。

## 手順（アカウントごと）

1. **状況を確認する**
   - `instagram/content/<account>/GUIDE.md`（方針書）と `canva.json`（ひな形デザインID）を読む
   - `node instagram/scripts/validate.mjs <account>` で、未登録の日を確認する
   - 直近の `posts/*.json` を10件ほど読み、内容の重複（同じ星座の1位が続くなど）を避ける

2. **1日分ずつ作る**（未登録の日それぞれについて）
   1. 方針書の曜日の型に沿って、画像に入れる文字とキャプションを決める
   2. Canva（デザイン部の作業。ルールは `design/README.md`）: `copy-design` で `canva.json` の `master` を複製し、
      `move-item-to-folder` で `canva.json` の `folder`（アカウントのフォルダ）へ移動する
   3. `read-design`（`open_transaction: true`）でテキスト要素の `locator_id` を取得し、
      `edit-design` の `replace_text` で文字を差し替える
   4. 文字数の目安は `canva.json` の `textFields` に従う。返ってきたサムネイルで、文字のはみ出し・重なりがないか確認する。問題があれば
      `resize_element` や `format_text`（font_size）で直す。直らなければ文字を短くする
   5. `edit-design` の `finalize: "commit"` で保存し、`update_title` でタイトルを
      `<account> YYYY-MM-DD` にする
   6. `get-export-formats` → `export-design`（jpg, width 1080, quality 90）で書き出す
   7. `instagram/content/<account>/posts/YYYY-MM-DD.json` を書く。`image` には**書き出し URL をそのまま**入れ、
      `canvaDesignId` に複製したデザインIDを、`brief` にデザイン依頼の内容（`design/README.md` の形式）を入れる。
      push すると GitHub Actions（instagram-prepare）が画像をダウンロードして `images/` に保存し、
      JSON をファイル名に書き換える。書き出し URL は約20時間で切れるので、**書き出したらその日のうちに push する**

3. **確認してコミットする**
   - `node instagram/scripts/validate.mjs <account>` がエラーなしになること
   - 変更をコミットして、GitHub のデフォルトブランチ（定期投稿が読むブランチ）に push する（コミットメッセージ例: `instagram: fortune 10/1〜10/7 の投稿を追加`）

## 守ること
- 方針書の禁止事項を必ず守る。迷う内容は入れずに、報告で相談する
- Canva の制作はオーナーに確認せずに進めてよい（2026-09-25 オーナー決定）。仕上がりはサムネイルで自分で確認する
- Canva のひな形（`master`）そのものは編集しない。必ず複製してから編集する
- 1回の実行で作るのは最大7日分まで
- 最後に、作った日付・各日のテーマ・Canva のデザインリンクを一覧にして報告する
