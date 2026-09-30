# 天祐自動化 プロジェクト（Claude 向けメモ）

このファイルは Claude Code が起動時に自動で読み込みます。
毎回説明しなくても、ここに書いた前提で作業してください。

## 目的

「天祐自動化」= 天祐（career-design）の日々の業務を自動化する取り組み。
最初のテーマは **WordPress への毎日の記事投稿の自動化**。

## 対象サイト

| サイト | 種類 | 備考 |
| --- | --- | --- |
| https://career-design.co.jp（デジタル資産を作ろう） | 自前 WordPress + Jetpack | メインの投稿先。日本語 |
| https://careerdesignaiblog.wordpress.com（career-design AI Blog） | WordPress.com 無料プラン | AI スキルアップ講座の情報発信。未公開 |

- WordPress.com MCP 経由の投稿は、どちらのサイトも有料プラン（Jetpack AI / WordPress.com 有料）が必要で現状は使えない。
- そのため投稿は **WordPress REST API + アプリケーションパスワード** で行う方針
  （career-design.co.jp: 管理画面 → ユーザー → プロフィール → アプリケーションパスワード）。

## 認証情報のルール

- ID・パスワード・API キーは `.env` にだけ書く。**絶対にコミットしない**（`.gitignore` 済み）。
- 使う環境変数名:
  - `WP_URL`（例: `https://career-design.co.jp`）
  - `WP_USER`
  - `WP_APP_PASSWORD`
- チャットにパスワードを貼られても、コードやファイルに直書きしない。

## 作業環境

- ユーザーは **Windows の PowerShell** で Claude Code を使う。
  - コマンド例は PowerShell 形式で示す（`$env:VAR = "..."`、パス区切り `\` など）。
  - 定期実行は Windows の「タスク スケジューラ」を第一候補にする。
- 言語: Node.js（既存の `package.json` に合わせる）。
- 既存のカウンターアプリ（`server.js`, `public/`, `tests/`）は Playwright のサンプル。触らなくてよい。

## 進め方の約束

- 返事は日本語で、専門用語には一言説明をつける。
- 記事を **公開** する前は、まず **下書き（draft）** で作って確認を取る。
- 大きな変更の前に「何をするか」を 3 行程度で先に伝える。
- 作業が終わったら「次にやること」を 1〜3 個提案する。

## 進捗メモ（作業のたびに更新）

- [x] 対象サイトの確認
- [ ] `.env` を用意して REST API で下書き投稿できるか確認
- [ ] 記事本文の生成方法を決める（テーマ・文字数・トーン）
- [ ] 投稿スクリプト作成
- [ ] タスク スケジューラで毎日自動実行
- [ ] OpenClaw を Windows PC に導入（手順: `docs/openclaw-setup-prompt.md`）
