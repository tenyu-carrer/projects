# 古川さんへ：天祐AIスキル商品180 の引き継ぎ手順（Mac）

## 1. 最初に1回だけやる準備

ターミナルを開いて、上から順に1行ずつ貼り付けて実行してください。

```bash
# 作業用フォルダに、教材一式をダウンロードする
cd ~ && git clone -b claude/content-products https://github.com/tenyu-carrer/projects.git tenyu-skill180

# 図を作る道具を入れる（すでに入っていれば何も起きません）
python3 -m pip install --user pillow
```

- `git` や `python3` が無いと言われたら、Mac が出す案内（「インストール」ボタン）に従ってください
- Node.js が無い場合は https://nodejs.org/ から LTS 版を入れてください
- 作った教材を保存（push）するには、オーナーから GitHub の招待を受けて承認しておいてください

## 2. Claude Code を始める

```bash
cd ~/tenyu-skill180 && claude
```

Claude Code が開いたら、下の「3」の文をそのまま貼り付けてください。

## 3. Claude Code に最初に貼る文

```text
天祐AIスキル商品180の続きを、前任から引き継いで進めてください。
まず CLAUDE.md を最後まで読み、次に products/CONTINUATION-NOTE.md と products/PRODUCTION-TRACKER.md を読んで、
「今どこまでできていて、次に何を作るか」を、やさしい日本語で3行で教えてください。
そのあと、私の指示を待ってください。
ルールは CLAUDE.md のとおりです（追加課金をしない・確かめていないことを確認済みと書かない・表紙はテーマが一目で分かる絵・全教材をブラウザで点検してから完了と言う）。
```

## 4. 毎日の進め方（例）

- 「066から5つ作って」→ 1つずつ作って、点検まで終わらせてくれます
- 「049〜065の表紙を絵にして」→ 残っている表紙の作業です
- 「今日の分を保存して」→ 進捗表と再開メモを更新し、GitHub に push します
- 作業を終える前に必ず「今日の分を保存して」と言ってください。次の日に「続きから」で再開できます

## 5. 困ったとき

- 公開サイト（https://tenyu-skill-library.vercel.app/ ）への反映方法は、オーナーと決めた方法に従ってください
- お金がかかること・公開・販売・投稿は、オーナーに確認してから
