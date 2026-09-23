# Instagram部 組織図

天祐AI運用本部の **CMO・メディア集客担当取締役 サラ** の配下にある部署です（2026-09-23 オーナー決定）。
組織上は TENYU の一部署ですが、**仕組み（投稿の実行基盤）は TENYU の Vercel とは別**で、このリポジトリの GitHub Actions で動きます。
TENYU の Vercel・Cron・Function の枠は使いません。

```
オーナー 山本
└─ AI-CEO
   └─ CMO・メディア集客担当取締役 サラ
      ├─ Threads部長 ハル
      ├─ Instagram部長 ソラ（仮）  ← 担当AI: Claude
      │  ├─ TENYU公式課      TENYU の Instagram（Vercel Cron 07:35、既存の仕組み）
      │  ├─ 占い課     課長 ルナ（仮）     アカウント1: 毎日占い        毎朝 6:30
      │  ├─ 前向き課   課長 ヒナタ（仮）   アカウント2: 前向きな言葉    毎朝 7:00
      │  ├─ 心理学課   課長 ミナト（仮）   アカウント3: 心理学の言葉    毎晩 20:00
      │  ├─ （アカウント4 準備枠）
      │  └─ （アカウント5 準備枠）
      └─ YouTube・Facebook部
```

名前の（仮）は Claude の仮案です。オーナーが自由に決めてください。

## 役割

| 役職 | 担当 | 実体（何がその役をするか） |
| --- | --- | --- |
| Instagram部長 | 部全体の方針、アカウントの追加・停止、課長の方針書の承認、週次の結果報告 | Claude（この `ORGANIZATION.md` と `AGENTS.md`） |
| 各課長 | 1アカウントの企画・文面・画像・投稿品質に責任を持つ | 各アカウントの方針書 `content/<account>/GUIDE.md` に従って Claude が週次制作 |
| 投稿の実行 | 毎日、投稿時刻に Instagram へ公開 | GitHub Actions `instagram-publish`（AI不要） |
| TENYU公式課 | TENYU の Instagram | TENYU の既存の仕組み（Vercel `api/cron/instagram.js`）。このリポジトリでは扱わない |

## 課の一覧（正本は `accounts.json`）

| 課 | キー | 投稿時刻 | 状態 | 方針書 |
| --- | --- | --- | --- | --- |
| 占い課 | `fortune` | 06:30 | 準備中（トークン未登録） | `content/fortune/GUIDE.md` |
| 前向き課 | `positive` | 07:00 | 準備中（トークン未登録） | `content/positive/GUIDE.md` |
| 心理学課 | `psychology` | 20:00 | 準備中（トークン未登録） | `content/psychology/GUIDE.md` |

## 課を増やすとき

1. オーナーがテーマを決める（例: アカウント4「◯◯」）
2. 部長（Claude）が `new-account.mjs` で課を作り、方針書と Canva のひな形を用意してオーナーに確認
3. オーナーがトークンを登録 → `enabled: true` で稼働開始
4. このファイルの組織図と課の一覧、TENYU の `docs/organization.md` を更新する
