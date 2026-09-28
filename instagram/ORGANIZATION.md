# Instagram部 組織図

**最新版：2026-09-28（オーナー確認済み）**

天祐AI運用本部の **CMO・メディア集客担当取締役 サラ** の配下にある部署です。担当AIは **Claude**（Instagram部長・各課長）。
画像の背景デザインは CCO 配下の **デザイン部（部長 キャン太朗）** が Canva で作ります（制作担当AIも Claude）。

```
オーナー 山本
└─ AI-CEO ASTRA
   ├─ CMO・メディア集客担当取締役 サラ
   │  ├─ Threads部長 ハル
   │  └─ Instagram部長（担当AI: Claude）
   │     ├─ 占い課          @happy_cristal7   毎朝 自動投稿（カルーセル2枚）  稼働中
   │     ├─ 前向きな言葉課   @tenyu.worklife   毎朝 自動投稿（1枚）            稼働中
   │     └─ （3つ目の課：準備枠。2アカウントが安定してからオーナーがテーマを決める）
   └─ CCO
      └─ デザイン部 部長 キャン太朗（Canva。背景デザインの作成・変更）
```

## 役割

| 役職 | やること | 実体 |
| --- | --- | --- |
| Instagram部長 | 部全体の方針、アカウントの追加、毎朝の確認と報告 | Claude |
| 占い課長・前向きな言葉課長 | 文面（`instagram/auto/content/`）と方針書（`instagram/content/<account>/GUIDE.md`）の品質 | Claude |
| デザイン部 | 文字なしの背景デザイン（各5パターンのもと）を Canva で作る・変える | Claude（オーナーが PC の前にいるときだけ） |
| 毎日の画像づくり | 背景に文字を載せて作り置き（約2〜3か月分） | プログラム `instagram/auto/build.mjs`（毎週日曜に Claude が補充） |
| 毎日の投稿 | 予約箱から予約IDごとに1回だけ投稿 | 本部 Vercel Cron `/api/cron/instagram`（AI 不要） |

## 課の一覧

| 課 | キー | 投稿 | 状態 | 方針書 |
| --- | --- | --- | --- | --- |
| 占い課 | `fortune`（@happy_cristal7） | 毎朝 7〜8時台 | **稼働中**（12/31 分まで予約済み） | `content/fortune/GUIDE.md` |
| 前向きな言葉課 | `worklife`（@tenyu.worklife） | 毎朝 7〜8時台 | **稼働中**（12/31 分まで予約済み） | `content/worklife/GUIDE.md` |

旧案の `positive`・`psychology` は使いません。

## 課を増やすとき（3つ目以降）

1. オーナーがテーマを決める
2. Claude が方針書・文面・背景デザイン（Canva・オーナーが PC の前にいるとき）を用意する
3. PC作業担当（オーナーPCの Claude Code）が Facebook ページ作成・Instagram 連携・鍵を本部 Vercel に設定する（1回だけ）
4. Claude が本部の予約箱にアカウントを追加し、テスト投稿のあと作り置きに加える
5. このファイルと `AGENTS.md`、本部の `docs/daily-operations.md` を更新する
