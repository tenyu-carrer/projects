# OpenClaw 導入・移行・引継ぎガイド（VPSなし／自宅PC運用）

> コマンドや画面はOpenClawの更新で変わることがあります。うまくいかないときは公式ドキュメント（https://docs.openclaw.ai）を確認してください。

---

## 1. 導入（Windows PC + WSL2）

### ① WSL2を入れる
PowerShellを **管理者として実行** して次を入力し、PCを再起動します。
```powershell
wsl --install
```
再起動後に開く「Ubuntu」で、ユーザー名とパスワードを決めます。

### ② Node.jsを入れる（Ubuntuの画面で実行）
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v22 以上ならOK
```

### ③ OpenClawを入れて初期設定する
```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```
- AIの選択：**OpenAI Codex（ChatGPTでログイン）** → ChatGPT Proのアカウントでログインします（月額内で使えます）
- 連絡手段：**Telegram** がいちばん簡単です（BotFatherでボットを作り、発行されたトークンを貼り付けます）

### ④ 動作確認
Telegramでボットに「こんにちは」と送り、返事が来ればOKです。

### ⑤ 24時間動かすための設定
- [ ] 設定 → システム → 電源 → スリープを「なし」にする
- [ ] （ノートPCの場合）ふたを閉じたときの動作を「何もしない」にする
- [ ] Windows Updateのアクティブ時間を設定する
- [ ] PCを再起動したあと、Telegramで返事が来るかを確認する

---

## 2. 別のPCへの移行

OpenClawの設定・記憶・ログイン情報は、基本的に **`~/.openclaw` フォルダ** にまとまっています。このフォルダを新しいPCにコピーすれば、ほぼそのまま引っ越せます。

### 旧PCでの作業
```bash
# 1. OpenClawを止める
openclaw gateway stop

# 2. 設定フォルダを1つのファイルにまとめる
cd ~
tar czf openclaw-backup-$(date +%Y%m%d).tar.gz .openclaw

# 3. Windows側（例：ダウンロードフォルダ）にコピーする
cp openclaw-backup-*.tar.gz /mnt/c/Users/<Windowsのユーザー名>/Downloads/
```
できたファイルは、USBメモリなどで新しいPCへ運びます。

> ⚠️ このバックアップにはChatGPTのログイン情報やTelegramボットのトークンが入っています。**人に渡さない、ネット上に置かない、GitHubに上げない**でください。

### 新PCでの作業
1. 上の「1. 導入」の①②を行います（③の `onboard` はまだ実行しません）
2. OpenClawを入れて、バックアップを戻します
```bash
npm install -g openclaw@latest
cd ~
cp /mnt/c/Users/<Windowsのユーザー名>/Downloads/openclaw-backup-*.tar.gz .
tar xzf openclaw-backup-*.tar.gz

# 設定の点検と、常駐（自動起動）の登録
openclaw doctor
openclaw gateway install
openclaw gateway start
```
3. ChatGPTのログインが切れている場合は、`openclaw onboard` でもう一度ログインします
4. Telegramで返事が来るかを確認します

### 注意
- **旧PCのOpenClawは必ず止めたままにしてください。** 同じTelegramボットを2台で同時に動かすと、どちらか一方にしかメッセージが届かず、動作がおかしくなります
- 移行して1週間ほど問題がなければ、旧PCのバックアップファイルと `~/.openclaw` を削除します

---

## 3. 引継ぎシート（記入用）

別の人に任せるときや、将来の自分のために埋めておきます。**パスワードやトークンそのものは書かず、「どこに保管しているか」だけ書きます。**

| 項目 | 内容 |
|---|---|
| 動かしているPC | （例：自宅の古いノートPC / 型番） |
| OpenClawのバージョン | `openclaw --version` の結果 |
| AIの接続先 | OpenAI Codex（ChatGPT Pro：アカウントのメールアドレス） |
| 連絡手段 | Telegram（ボット名：@xxxx_bot） |
| ボットトークンの保管場所 | （例：パスワード管理アプリの「OpenClaw」項目） |
| Instagram連携 | 公式Graph API / ビジネスアカウント名 / 連携しているFacebookページ |
| 定期実行している作業 | （例：毎朝9時に投稿の下書きを作ってTelegramに送る） |
| 入れているスキル | （名前と入手元） |
| 最終バックアップ日 | YYYY/MM/DD |
| 困ったときの確認先 | https://docs.openclaw.ai |

### 日常の運用メモ
- 状態を確認する：`openclaw status`
- 止める／起動する：`openclaw gateway stop` / `openclaw gateway start`
- 更新する：`npm install -g openclaw@latest` のあとに `openclaw doctor`
- バックアップ：月1回、「2. 旧PCでの作業」の1〜3と同じ手順で行う
