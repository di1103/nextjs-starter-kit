# Supabaseプロジェクト作成手順

開発開始前にSupabaseプロジェクトを作成し、データベース環境を準備する手順。

---

## 前提条件

- Supabase CLIがインストール済み（`brew install supabase/tap/supabase`）
- `supabase login` で認証済み

---

## Step 1: ログイン確認

```bash
supabase projects list
```

エラーが出る場合は、ユーザーに `supabase login` を依頼。

---

## Step 2: ユーザーから情報を取得

AskUserQuestionツールで以下を確認:

| 項目 | 説明 | 例 |
|------|------|-----|
| プロジェクト名 | Supabase上の表示名 | my-awesome-app |
| リージョン | データセンターの場所 | ap-northeast-1（東京） |
| DBパスワード | PostgreSQLのパスワード | 12文字以上推奨 |

---

## Step 3: 組織ID取得

```bash
supabase orgs list
```

複数ある場合はユーザーに選択を依頼。

---

## Step 4: プロジェクト作成

```bash
supabase projects create [プロジェクト名] \
  --org-id [組織ID] \
  --db-password [DBパスワード] \
  --region ap-northeast-1
```

---

## Step 5: プロジェクトリンク

```bash
supabase link --project-ref [プロジェクトRef]
```

プロジェクトRefは作成時の出力から取得。

---

## Step 6: 環境変数設定

`.env` ファイルに以下を書き込み:

```bash
# Supabase
DATABASE_URL=postgresql://postgres.[プロジェクトRef]:[DBパスワード]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[プロジェクトRef]:[DBパスワード]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres

# Supabase API
NEXT_PUBLIC_SUPABASE_URL=https://[プロジェクトRef].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
```

API Keyは以下で取得:
```bash
supabase projects api-keys --project-ref [プロジェクトRef]
```

---

## Step 7: 初期スキーマ適用

```bash
pnpm db:push
```

---

## 完了条件

- [ ] Supabaseプロジェクトが作成済み
- [ ] ローカルプロジェクトがリンク済み
- [ ] `.env` に接続情報が設定済み
- [ ] `pnpm db:push` が成功

---

## スキップ条件

以下の場合はスキップ:

- `.env` に `DATABASE_URL` が既に設定済み
- ユーザーが「Supabaseは設定済み」と回答
