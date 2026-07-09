# ガジュマル｜IRIAM配信準備ノート

IRIAM初配信前の「準備期間」を過ごすライバーのための無料ツール。ログインは任意（ゲストでも使えるが、ログインすると端末間でデータが引き継がれる）。

- Next.js 16 (App Router, TypeScript) + Supabase (Auth / Postgres)
- ログイン任意: 未ログイン時はブラウザのlocalStorageに保存、ログイン時はSupabaseに同期
- 本番: Vercel（`main`へのpushで自動デプロイ）

## ローカル開発

Node.jsはPATHに無いため、`.claude/launch.json`の`gajumaru`設定（`env.PATH`オーバーライド）経由でClaude Previewから起動するか、以下を直接実行:

```
"C:\Program Files\nodejs\npm.cmd" run dev
```

環境変数は`.env.local`（gitignore対象）に設定:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## DBマイグレーション

`supabase/migrations/*.sql`はVercelデプロイでは自動適用されない。SupabaseダッシュボードのSQL Editorで手動実行すること。
