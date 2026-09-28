# Instagram 自動文字入れ（2026-09-28 オーナー決定）

毎日の投稿画像を、Canva で1回だけ作った**文字なしの背景**に、プログラムで文字を載せて作る仕組みです。
毎日の制作に Canva も Claude のセッションも使わないので、許可の確認が出ず、オーナーの PC が切れていても止まりません。

- 背景：`backgrounds/`（Canva「worklife 背景」`DAHWfdcXP0g`・「fortune 1枚目 背景」`DAHWfa12BPg`・「fortune 2枚目 背景」`DAHWfe8krng`）。色と向きを変えて各5パターン、前の日と同じにならないようランダム
- 文面：`content/fortune.json`（星座の特徴・ひとこと・誕生日別のアドバイス）、`content/worklife.json`（曜日テーマごとのひとこと）。方針書の禁止事項を守る
- 作る：`node instagram/auto/build.mjs --from <日付> --days <日数>` → `posts/<account>/<日付>.json` と `images/`
- 予約：`node instagram/auto/queue.mjs --sha <画像のコミット> --queue <instagram-queue の queue.json>`（各日 06:50 JST・予約ID `<YYYYMMDD>-<account>-auto`）
- 投稿：本部 Vercel の毎朝の Cron（`/api/cron/instagram`）が予約箱から予約IDごとに1回だけ投稿する
- 作り置きは約2か月分。Claude が週1回、先の分を足す（止まっても作り置きがある間は投稿が続く）
- その日だけ特別な投稿にしたいときは、その日の予約（`<YYYYMMDD>-<account>-…`）を先に入れておけば自動の分は入らない
