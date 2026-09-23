# Counter App (Playwright E2E サンプル)

シンプルなカウンターアプリと、それに対する Playwright の E2E テストのサンプル一式です。

## 構成

- `server.js` / `public/` — テスト対象の静的サイト（カウンターアプリ）
- `playwright.config.ts` — Playwright の設定（`webServer` でテスト前にサーバーを自動起動）
- `tests/counter.spec.ts` — E2E テスト

## セットアップ

```bash
npm install
```

## アプリを単体で起動する

```bash
npm start
# http://localhost:3000
```

## E2E テストを実行する

```bash
npm run test:e2e
```

`playwright.config.ts` の `webServer` 設定により、テスト実行時にサーバーが自動起動・自動停止します。

UI モードで実行する場合:

```bash
npm run test:e2e:ui
```

## 補足

このリポジトリのリモート実行環境では Chromium が `/opt/pw-browsers` にプリインストールされているため、
`playwright.config.ts` の `use.launchOptions.executablePath` でそのパスを直接指定しています。
別環境で実行する場合は `npx playwright install chromium` でブラウザを取得し、
`executablePath` の指定を削除してください。

---

## Instagram 自動投稿

2つの Instagram アカウント（毎日占い / 前向きな言葉）を GitHub Actions で自動投稿する仕組みは
[`instagram/README.md`](instagram/README.md) を参照してください。
