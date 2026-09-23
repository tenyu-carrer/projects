# Instagram 自動投稿（複数アカウント運用）

アカウントの一覧と投稿時刻は `accounts.json` で管理します（`postTime` が投稿時刻、`enabled` が稼働スイッチ）。
投稿は `.github/workflows/instagram-publish.yml` が30分ごとに起動し、投稿時刻を過ぎたアカウントの今日の分を投稿します。
アカウントを増やす手順はリポジトリ直下の `AGENTS.md` を参照してください。

Instagram 公式の API（Instagram Graph API）を使い、GitHub Actions が毎日決まった時刻に自動投稿します。
パスワードでのログインや非公式ツールは使わないので、アカウント停止のリスクを抑えられます。

## 仕組み

```
【週1回】Claude（定期実行）
   方針書 GUIDE.md を読む → 7日分の文面を作る
   → Canva: ひな形を複製して文字を差し替え → JPG で書き出し
   → posts/2026-10-01.json（キャプション・書き出しURL）を push
            │
            ▼  push 直後に GitHub Actions（instagram-prepare）
   Canva の画像をダウンロードして images/ に保存 → 投稿データをチェック
            │
            ▼  毎朝 GitHub Actions（instagram 占い / 前向きな言葉）
   今日の日付のファイルを探す → Instagram API で投稿 → posted.json に記録（二重投稿防止）
```

| ファイル | 役割 |
| --- | --- |
| `content/<アカウント>/GUIDE.md` | 方針書（キャラ・投稿の型・禁止事項）。部長の役 |
| `content/<アカウント>/canva.json` | Canva のひな形デザインIDと、差し替える文字の目安 |
| `content/<アカウント>/posts/` | 日付ごとの投稿データ |
| `content/<アカウント>/images/` | 投稿画像（Canva から自動で保存される） |
| `.claude/skills/instagram-weekly/` | 週1回の制作手順（Claude が従う手順書） |

Canva のデザインは Canva 上にも残るので、Instagram に出る前に Canva で直接直すこともできます。
直したときは、Claude に「◯日の画像を差し替えて」と伝えてください。

- 投稿データを先に何日分でも入れておけば、その日付になると自動で投稿されます。
- 1日に複数投稿したいときは `2026-10-01.json`, `2026-10-01-2.json`, ... のように付け足します（この順で投稿）。
- 投稿データを push すると内容チェックが自動で走り、今後7日間で未登録の日があれば警告が出ます。

---

## アカウントの渡し方（最初に1回だけ）

**パスワードは共有しないでください。** 代わりに、各アカウントについて「アクセストークン」と「ユーザーID」の
2つを発行し、GitHub の Secrets に登録します。登録した値は GitHub の中で暗号化され、誰にも表示されません。

### 1. Instagram をプロアカウントに切り替える（2アカウントとも）

Instagram アプリ → 設定 → 「アカウントの種類とツール」→「プロアカウントに切り替える」→ **ビジネス** を選択。

### 2. Facebook ページを作って Instagram とつなぐ（2アカウントとも）

1. Facebook で各アカウント用のページを作成（例:「毎日占い ○○」「前向きな言葉 ○○」。中身は空で OK）
2. ページの設定 → リンク済みのアカウント → Instagram → 該当アカウントでログインして連携

> Facebook ページ経由にするのは、**有効期限のないトークン**が発行できるためです。
> （Instagram ログインだけの方式もありますが、60日ごとにトークンの更新が必要になります）

### 3. Meta のアプリを作る（2アカウントで1つ）

1. <https://developers.facebook.com/> にログイン → マイアプリ → アプリを作成
2. ユースケースで「Instagram でメッセージとコンテンツを管理」（または種類「ビジネス」）を選択
3. アプリの「設定 → ベーシック」で **アプリID** と **app secret** を控える

自分が所有するアカウントに投稿するだけなら、アプリ審査は不要です（開発モードのままで動きます）。

### 4. トークンとユーザーIDを取得する（アカウントごと）

1. <https://developers.facebook.com/tools/explorer/> を開き、作成したアプリを選択
2. 「ユーザーアクセストークン」で以下の権限を追加して「Generate Access Token」
   - `instagram_basic` / `instagram_content_publish` / `pages_show_list` / `pages_read_engagement` / `business_management`
3. 出てきた短期トークンを長期トークンに交換（ブラウザでこの URL を開く）
   ```
   https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<アプリID>&client_secret=<app secret>&fb_exchange_token=<短期トークン>
   ```
4. 長期トークンでページ一覧を取得
   ```
   https://graph.facebook.com/v23.0/me/accounts?access_token=<長期トークン>
   ```
   → 各ページの `access_token`（**これが無期限のトークン**）と `id`（ページID）を控える
5. ページに紐づく Instagram のユーザーIDを取得
   ```
   https://graph.facebook.com/v23.0/<ページID>?fields=instagram_business_account&access_token=<ページのaccess_token>
   ```
   → `instagram_business_account.id` が **ユーザーID**

### 5. GitHub に登録する

リポジトリの Settings → Secrets and variables → Actions → **New repository secret** で4つ登録:

| Secret 名 | 値 |
| --- | --- |
| `IG_FORTUNE_ACCESS_TOKEN` | 占いアカウントのページの access_token |
| `IG_FORTUNE_USER_ID` | 占いアカウントの Instagram ユーザーID |
| `IG_POSITIVE_ACCESS_TOKEN` | 前向きな言葉アカウントのページの access_token |
| `IG_POSITIVE_USER_ID` | 前向きな言葉アカウントの Instagram ユーザーID |

### 6. 画像の公開場所を決める

Instagram の API は「インターネット上の URL から画像を取りに来る」仕組みです。

- **リポジトリが公開（Public）の場合**: 設定不要。`images/` に置いた画像がそのまま使われます。
- **非公開（Private）の場合**: 次のどちらかにします。
  - Variables（Secrets の隣のタブ）に `IMAGE_BASE_URL` を登録し、リポジトリの中身が公開されている URL
    （Vercel / GitHub Pages など）を指定する
  - 投稿 JSON の画像欄に、Canva などで書き出した画像の公開 URL（`https://...jpg`）を直接書く

### 7. 動作確認と稼働開始

1. このブランチをデフォルトブランチ（main）に取り込む（定期実行はデフォルトブランチ上のワークフローだけが動きます）
2. Actions タブ →「instagram 毎日投稿」→ Run workflow で、アカウント名を入れ **ドライランにチェック** のまま実行 → 投稿内容が表示されれば OK
3. `accounts.json` の該当アカウントの `enabled` を `true` にする → 以後、毎日自動で投稿されます

---

## 投稿データの書き方

`instagram/content/<fortune または positive>/posts/<日付>.json` を作ります。
ひな形は `instagram/examples/` にあります。

```json
{
  "type": "image",
  "image": "2026-10-01.jpg",
  "caption": "【10月1日の運勢】\n今日の1位は…おひつじ座♈",
  "hashtags": ["占い", "今日の運勢", "星座占い"]
}
```

| type | 内容 | 指定するもの |
| --- | --- | --- |
| `image` | 画像1枚 | `image` |
| `carousel` | 複数枚（2〜10枚、スワイプ） | `images`（配列） |
| `reel` | リール動画 | `video`（MP4）、任意で `cover`（表紙画像） |
| `story` | ストーリーズ | `image`（または `video`） |

- 画像は **JPEG（.jpg）** のみ。推奨サイズはフィード 1080×1350（縦4:5）、ストーリーズ・リール 1080×1920
- キャプションは 2,200 文字まで、ハッシュタグは 30 個まで
- 毎回付けたいハッシュタグは `instagram/accounts.json` の `defaultHashtags` に書いておくと自動で付きます
- 投稿時刻を変えたい場合は `accounts.json` の `postTime`（日本時間）を変更

## コマンド（ローカルで確認したいとき）

```bash
npm run ig:validate                 # 投稿データのチェック + 予約状況
npm run ig:publish -- fortune --dry-run   # 今日の投稿内容を表示（投稿はしない）
npm run ig:check                    # 連携確認・フォロワー数表示（要トークン環境変数）
```

## 注意事項

- **自動フォロー・自動いいね・自動DM はしません。** Instagram の規約違反でアカウント停止の原因になるため、
  フォロワーは投稿の質・継続・ハッシュタグ・リールで集める設計です。
- API 経由の投稿は 24 時間あたりの上限があります（通常の運用では届かない数です）。
- GitHub の定期実行は混雑時に数分〜数十分遅れることがあります。
- トークンが無効になった場合（パスワード変更・Facebook ページの連携解除など）は、手順4からやり直して Secret を更新してください。
