# Vercelデプロイ手順

プロダクション環境にデプロイする手順。

---

## 前提条件

- Vercel CLIがインストール済み（`npm i -g vercel`）
- `vercel login` で認証済み

---

## Step 1: ログイン確認

```bash
vercel whoami
```

エラーが出る場合は、ユーザーに `vercel login` を依頼。

---

## Step 2: プロジェクトリンク

```bash
vercel link
```

対話形式で以下を設定:
- Vercelアカウント/チームを選択
- 既存プロジェクトにリンク or 新規作成
- プロジェクト名を入力

---

## Step 3: 環境変数設定

`.env` の内容をVercelに設定:

```bash
# 各環境変数を追加
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_URL production
```

または一括で:
```bash
vercel env pull .env.local  # 確認用
```

---

## Step 4: プロダクションデプロイ

```bash
vercel --prod
```

---

## Step 5: デプロイ確認

デプロイ完了後、以下を確認:
- [ ] デプロイURLにアクセス可能
- [ ] ログイン機能が動作
- [ ] DBに接続できている

---

## 完了条件

- [ ] Vercelプロジェクトが作成済み
- [ ] 環境変数が設定済み
- [ ] プロダクションデプロイ成功
- [ ] 動作確認完了

---

## 最終レポート

```markdown
## デプロイ情報
- **本番URL**: https://[project-name].vercel.app
- **Vercelダッシュボード**: https://vercel.com/[team]/[project]
- **Supabaseダッシュボード**: https://supabase.com/dashboard/project/[ref]
```

---

## スキップ条件

以下の場合はスキップ:

- ユーザーが「デプロイは後で」と回答
- ローカル開発のみの場合
