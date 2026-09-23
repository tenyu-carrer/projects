# AGENTS.md — このリポジトリで作業する AI（Claude・GPT など）への共有メモ

このファイルは、このリポジトリに関わるすべての AI とオーナーが読む**共通の最新情報**です。
作業を始める前に必ず読み、役割や運用ルールが変わったらこのファイルを更新してください。

## プロジェクト: Instagram 2アカウントの自動運用

| アカウント | 内容 | 投稿時刻（日本時間） |
| --- | --- | --- |
| 毎日占い (`fortune`) | 今日の運勢・12星座ランキング・星座別の傾向と注意・今月のいい日 | 毎朝 6:30 |
| 前向きな言葉 (`positive`) | 1日1つの前向きな言葉（曜日テーマあり） | 毎朝 7:00 |

目的: 毎日投稿を続けてフォロワーを増やす。自動フォロー・自動いいね等の規約違反はしない。

## 全体の流れ（すべてクラウドで動くので、オーナーの PC は不要）

1. **週1回・制作**（Claude の定期実行）: 方針書に沿って文面を作り、Canva で画像を作り、`posts/` に登録して push
2. **push 直後・準備**（GitHub Actions `instagram-prepare`）: Canva の画像を `images/` に保存し、内容をチェック
3. **毎朝・投稿**（GitHub Actions `instagram-fortune` / `instagram-positive`）: その日の投稿を Instagram API で公開

## 役割分担

| 担当 | やること |
| --- | --- |
| オーナー | 方針の決定、最終確認、各種アカウント・トークンの管理 |
| Claude | 週次制作（文面・Canva 画像・登録）、仕組みの保守 |
| GPT など他の AI | 企画・文面案・レビュー。**投稿データを直接作る場合は、事前にこのファイルの「作業中」に書く**（同じ日を二重に作らないため） |
| GitHub Actions | 画像の保存、チェック、毎朝の投稿（AI は不要） |

## 作業中（重複防止のため、作業を始める AI がここに書き、終わったら消す）

- なし

## どこに何があるか

| パス | 内容 |
| --- | --- |
| `instagram/content/<account>/GUIDE.md` | **方針書**（キャラ・口調・投稿の型・禁止事項）。文面を作る前に必ず読む |
| `instagram/content/<account>/canva.json` | Canva のひな形デザインID と、差し替える文字の目安 |
| `instagram/content/<account>/posts/YYYY-MM-DD.json` | 投稿データ（1日1ファイル） |
| `instagram/content/<account>/images/` | 投稿画像（JPEG, 1080×1350） |
| `instagram/content/<account>/posted.json` | 投稿済みの記録（自動更新。手で編集しない） |
| `.claude/skills/instagram-weekly/SKILL.md` | 週次制作の手順書 |
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

- 方針書の禁止事項を守る（不安をあおらない・断定しない・医療や投資の助言をしない・出典不明の名言を使わない）
- `posted.json` とワークフローの秘密情報（トークン）には触らない。トークンをファイルやチャットに書かない
- 投稿済みの日付のファイルは編集しない（Instagram 側は変わらないため）
- 定期投稿は GitHub の**デフォルトブランチ**の内容で動く。投稿データはデフォルトブランチに入れる
