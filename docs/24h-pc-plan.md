# 24時間PCの使い方（2026-10-01 作成）

天祐自動化で、オーナーの24時間PC（WSL2 Ubuntu・ネットワーク制限なし）に何を任せるかの正本です。
OpenClaw の基本設定は `claude/ecstatic-dirac-wegwoj` ブランチの `docs/openclaw/TENYU.md` を先に読んでください。

## 方針：投稿はクラウド、PCは「目と手」

| 役割 | 担当 | 理由 |
| --- | --- | --- |
| 投稿する | Vercel・GCP・GitHub Actions（今のまま） | PCが再起動・停電・Windows Update で止まっても投稿が止まらない |
| 見張る・知らせる | **OpenClaw**（PC・読むだけ） | クラウドの Claude からは note・WordPress・本部APIが見えない（ネットワーク制限）。PCからは全部見える |
| 直す | **PCの Claude Code**（オーナーが頼んだ時だけ） | GCP・Vercel の管理画面とログは、ログイン済みのPCからしか触れない |

**OpenClaw に投稿・再投稿・設定変更はさせません。** ChatGPT・Claude・OpenClaw の3者が投稿できると、二重投稿の経路が増えるためです。

## OpenClaw に足す見張り（貼り付け用）

鍵は使いません。下の4つは鍵なしで読める公開の情報だけです。
**`/api/report` や `/api/threads/slot` は使わないこと**（Threads は見張り・報告の対象外）（読み取り用の鍵が Threads の投稿もできる鍵と同じため、OpenClaw に渡さない）。

```text
天祐自動化の見張りを次の時刻に追加してください。読むだけで、投稿・再実行・設定変更はしないこと。
結果は Telegram「天祐 見張り役」に、問題がなければ1行、問題があれば「何が・いつから・確認したURL」を3行以内で送ること。

1) 毎朝 08:20：WordPress
   https://career-design.co.jp/wp-json/wp/v2/posts?per_page=3&_fields=id,date,link,title
   今日の日付の記事が1本あれば「✅ WordPress 公開（URL）」。なければ「⚠️ WordPress 08:00 未公開」。
   2本以上あれば「⚠️ WordPress 重複の疑い」。

2) 毎朝 08:20：本部の状態
   https://tenyu-meta-social-automation-psi.vercel.app/api/health
   progress.departments の note と wordpress の status を報告。
   commit（本番に入っているコードの版）も1行添える。
   ※ Threads は報告しない（2026-10-01 オーナー決定）。

3) 毎朝 08:30（既存）：Instagram
   tenyu-carrer/projects の instagram-queue ブランチ instagram/queue/results/ の最新ファイル。
   今日の2件が published / already_published かに加えて、
   「最初に published になったファイルの時刻が 08:10 より前か後か」も書く
   （前なら本線の Vercel Cron、後なら予備の Claude 08:10 で投稿されている）。
```

## PCの Claude Code に頼むこと（オーナーがPCの前にいる時）

上から順に。どれも「既存の経路を直す」作業で、新しい Cron や経路は作りません。

1. **WordPress 08:00 の復旧**：GCP `metal-direction-413601` の Cloud Scheduler `wordpress-daily-0800` の実行履歴と、Cloud Run のログを見て、止まっている場所（未起動・認証・Cloud Run・WordPress API）を特定して直す。直す前に公開REST APIで当日分がないか確認し、二重投稿しない。
2. **Instagram 本線（Vercel Cron 07:35）が動いていない原因**：Vercel（チーム tenyu-carrier）→ プロジェクト → Cron Jobs と Logs で `/api/cron/instagram` と `/api/cron/report` の実行記録を見る。401（`CRON_SECRET` 未設定）・未実行・エラーのどれかを確かめる。予備の 08:10 で毎日投稿されているので急ぎではないが、予備は Claude の定期実行1本に頼っている。

### PCの Claude Code に貼る文（そのまま使えます）

```text
天祐自動化の障害を2つ直してください。まず tenyu-carrer/tenyu-meta-social-automation の最新 main の
AGENTS.md・docs/daily-operations.md・docs/handoff-log.md を読み、ルール（新しい Cron・経路を作らない、
二重投稿しない、鍵の値を表示しない）を守ること。

1. WordPress 08:00 の自動公開（9/28から止まっている）
   - Google Cloud（プロジェクト metal-direction-413601）の Cloud Scheduler「wordpress-daily-0800」の
     有効状態・直近の実行結果・ターゲットを確認し、対応する Cloud Run のログを見て止まっている場所を特定する
   - 原因を直す。直す前に https://career-design.co.jp/wp-json/wp/v2/posts?per_page=5&_fields=id,date,link
     で当日分が無いことを確かめ、手動で流すのは当日分1本だけ
   - 翌朝 08:00 の実行で公開URL・投稿IDが出たら復旧とする

2. Instagram の本線（Vercel Cron 07:35 /api/cron/instagram）が投稿していない
   - Vercel（チーム tenyu-carrier・プロジェクト tenyu-meta-social-automation）の Cron Jobs と Logs で
     /api/cron/instagram と /api/cron/report の実行記録とステータスを確認する
   - 401 なら環境変数 CRON_SECRET の有無を確認（値は表示しない）。未実行・エラーなら原因を特定して直す
   - 08:10 の Claude の予備で毎日投稿は出ているので、二重投稿にならないよう予約箱は触らない

終わったら docs/handoff-log.md の先頭に結果を書き、オーナーに3行で報告すること。
```

## やらないこと

- OpenClaw に Canva・WordPress・Threads・Instagram への投稿権限や鍵を渡さない
- PCで新しい定期投稿を作らない（クラウドの投稿と二重になる）
- 鍵・パスワードの値をファイル・チャット・Telegram に書かない
