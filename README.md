# Next.js Starter Kit

要件定義駆動開発のためのNext.jsスターターキット

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **認証**: better-auth（Google OAuth対応）
- **ORM**: Drizzle ORM
- **データベース**: PostgreSQL (Supabase)
- **ストレージ**: Supabase Storage
- **UI**: shadcn/ui + Tailwind CSS 4
- **バリデーション**: Zod
- **通知**: sonner
- **エラー監視**: Sentry

## プロジェクト構造

```
starter-kit/
├── app/
│   ├── api/
│   │   └── auth/[...all]/       # better-auth APIルート
│   ├── components/
│   │   ├── ui/                  # shadcn/ui コンポーネント
│   │   └── Login.tsx            # ログイン画面
│   ├── layout.tsx
│   ├── page.tsx                 # メインページ
│   ├── loading.tsx              # ローディングUI
│   └── error.tsx                # エラーUI
├── lib/
│   ├── actions/                 # Server Actions
│   │   └── auth-helpers.ts      # 認証ヘルパー関数
│   ├── db/
│   │   ├── index.ts             # Drizzleクライアント
│   │   └── schemas/
│   │       ├── index.ts
│   │       └── auth-schema.ts   # better-auth + role
│   ├── validations/             # Zodスキーマ
│   │   └── index.ts
│   ├── auth.ts                  # better-authサーバー設定
│   ├── auth-client.ts           # better-authクライアント
│   └── supabase.ts              # Supabaseクライアント
├── scripts/
│   └── seed-admin.ts            # 管理者ユーザー作成
├── middleware.ts                # 認証ミドルウェア
└── drizzle.config.ts            # Drizzle Kit設定
```

## データベーススキーマ

### 認証テーブル (better-auth)
- `users` - ユーザー（role: 'admin' | 'user'）
- `sessions` - セッション
- `accounts` - アカウント
- `verifications` - 検証トークン

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

`.env`を作成:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth - Google（オプション）
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Sentry（オプション - エラー監視）
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Google OAuth設定（オプション）

Googleログインを有効にする場合：

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) にアクセス
2. 「認証情報を作成」→「OAuth クライアント ID」
3. アプリケーションの種類：「ウェブ アプリケーション」
4. 承認済みリダイレクト URI：
   - ローカル: `http://localhost:3000/api/auth/callback/google`
   - 本番: `https://your-domain.com/api/auth/callback/google`
5. クライアント ID と シークレットを `.env` に設定

### 4. データベースマイグレーション

```bash
pnpm db:push
```

### 5. 初期ユーザー作成

```bash
pnpm db:seed:admin
```

**管理者**（デフォルト）: `admin@example.com` / `password123`

環境変数でカスタマイズ:
```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=yourpassword
SEED_ADMIN_NAME=管理者名
```

### 6. 開発サーバーの起動

```bash
pnpm dev
```

## NPM Scripts

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm start` | プロダクションサーバー起動 |
| `pnpm db:generate` | マイグレーションファイル生成 |
| `pnpm db:migrate` | マイグレーション実行 |
| `pnpm db:push` | DBに直接反映（開発用） |
| `pnpm db:studio` | Drizzle Studio起動 |
| `pnpm db:seed:admin` | 管理者ユーザー作成 |

## デプロイ

### Vercelへのデプロイ手順

#### 1. GitHubにプッシュ

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Vercelでプロジェクト作成

1. [Vercel](https://vercel.com/) にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート
4. 「Deploy」をクリック（初回は環境変数なしでOK、ビルドは失敗する）

#### 3. 環境変数を設定

Vercelダッシュボード → Settings → Environment Variables で以下を設定：

| 変数名 | 値 |
|--------|-----|
| `DATABASE_URL` | Supabase Pooler URL（下記参照） |
| `BETTER_AUTH_SECRET` | ランダムな文字列 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT_ID].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

#### 4. 再デプロイ

Deployments → 最新のデプロイ → 「...」→「Redeploy」

### DATABASE_URLの違い

| 環境 | 接続形式 | ホスト | ポート |
|------|---------|--------|--------|
| ローカル開発 | Direct | `db.[PROJECT_ID].supabase.co` | 5432 |
| Vercel | Pooler | `aws-0-[REGION].pooler.supabase.com` | 6543 |

**Vercel用DATABASE_URL例**:
```
postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

> **注意**: Vercelではサーバーレス環境のため、Supabase Pooler（Transaction mode）を使用する必要があります。
> Supabaseダッシュボード → Project Settings → Database → Connection string → 「Transaction」タブで確認できます。

### 初期ユーザー作成（本番環境）

Vercelデプロイ後、ローカルCLIから本番DBに管理者を作成できます。

```bash
# 1. .env.productionを作成
cp .env.production.example .env.production
# 2. .env.productionを編集して本番Supabaseの接続情報を設定
# 3. 本番環境に管理者を作成
pnpm db:seed:admin:production
```
