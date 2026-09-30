# OpenClaw を天祐自動化に組み込む（24時間PC）

**作成：2026-09-30**　このPCの Claude Code と OpenClaw が読む資料です。
天祐自動化の正本は `origin/claude/zealous-carson-5kpdye` ブランチの `AGENTS.md` と `instagram/auto/README.md` です。先にそちらを読んでください。

---

## 1. 前提：Instagram の投稿はもうクラウドで動いている

- 毎朝の投稿は **本部（Vercel Cron）** が行います。予約は12/31分まで入っています
- 毎朝08:10の確認と、毎週日曜の作り置きの補充は **Claude の定期実行（クラウド）** が行います
- **このPCが止まっても投稿は止まりません。** このPCは「見張り役・連絡係・PC作業係」として加わります

## 2. OpenClaw の立場（AGENTS.md「7. 役割分担」に合わせる）

OpenClaw の頭脳は ChatGPT（GPT）なので、AGENTS.md の **「GPT など他の AI」** に当たります。

| やってよいこと | やってはいけないこと |
| --- | --- |
| リポジトリを **読む**（`git pull` / `git show`） | 予約箱（`instagram-queue` ブランチの `queue.json`）を変える |
| 投稿結果を確認して Telegram で報告する | `instagram/auto/` や投稿データを変える |
| 文面案・企画案を作り、オーナーに Telegram で送る | Instagram に直接投稿する、`/api/instagram/dispatch` を呼ぶ |
| 異常を見つけたらオーナーに知らせる | Vercel・GitHub Actions・Cron を増やす、変える |
| | トークン（鍵）の値を読む・書く・送る |

変えたいことが出てきたら、**オーナー経由で Claude に依頼**します（二重投稿防止）。

## 3. OpenClaw に任せる定期作業

| 時刻（JST） | 作業 | 使う情報 |
| --- | --- | --- |
| 毎朝 08:30 | 今日の2件（占い・前向き）が投稿されたかを確認し、Telegram に「✅ 2件投稿済み（URL）」か「⚠️ 未投稿あり」と送る | `instagram-queue` ブランチの `instagram/queue/results/` の最新ファイル（`status` が `published` / `already_published` で、今日の予約ID `<YYYYMMDD>-fortune-auto`・`<YYYYMMDD>-worklife-auto` があるか） |
| 毎週月曜 09:00 | 作り置きが何日先まで残っているかを数えて報告する。30日を切ったら「⚠️ 補充が必要」と送る | `instagram-queue` ブランチの `instagram/queue/queue.json` |
| 毎週月曜 09:00 | 次の週の投稿文面を読み、方針書の禁止事項（不安をあおる・断定・医療や投資の助言・出典不明の名言）がないかを確認して報告する | `instagram/auto/posts/`・`instagram/content/<account>/GUIDE.md` |
| 2026-12-10 09:00 | 「Metaの鍵の再認証（期限12/26ごろ）をこのPCでやりましょう」とオーナーに知らせる | AGENTS.md「6. 大事な日程」 |

⚠️ 未投稿のときも、**OpenClaw は投稿し直しません**。報告だけにします。やり直しは08:10のClaudeの確認と本部の仕組みが行います。

## 4. このPCでの準備（Claude Code がやること）

1. `README.md` の「1. 導入」でOpenClawを入れる（WSL2・普段のユーザーで `openclaw onboard`・ChatGPTでログイン・Telegram）
2. WSL の中に、読み取り専用の作業用コピーを作る
   ```bash
   mkdir -p ~/tenyu && cd ~/tenyu
   git clone https://github.com/tenyu-carrer/projects.git
   cd projects && git fetch origin instagram-queue claude/zealous-carson-5kpdye
   ```
   - GitHub への書き込み権限は渡しません（読むだけなら公開リポジトリはログイン不要。非公開なら **読み取り専用** のトークンにする）
3. OpenClaw の作業フォルダ（`~/.openclaw/workspace`）の `AGENTS.md` に、この資料の「2. 立場」と「3. 定期作業」を書き込み、`~/tenyu/projects` を参照するように伝える
4. 「3. 定期作業」を OpenClaw の定期実行（cron）に登録する。各作業の最初に `git fetch` で最新を取る
5. Telegram でテストする：「今日の投稿を確認して」と送り、正しい報告が返るかを見る
6. 天祐自動化の `AGENTS.md` の「7. 役割分担」に、次の1行を足すようにオーナーに提案する（本人の了解後に Claude が反映）
   `| OpenClaw（24時間PC・GPT） | 投稿の見張りと Telegram 報告、文面チェック、12月の再認証のお知らせ。予約箱・投稿データは変えない |`

## 5. 将来：このPCだからできること（オーナーの了解を得てから）

- 12月の Meta の鍵の再認証を、このPCで Claude Code＋Claude in Chrome と一緒に行う
- 背景デザインを変えるときの Canva 作業（許可の確認が出るので、オーナーがPCの前にいるときに行う）
- Instagram 以外の業務（WordPress 投稿など）を OpenClaw に任せる。その場合も「投稿する前にオーナーが Telegram で OK する」形から始める
