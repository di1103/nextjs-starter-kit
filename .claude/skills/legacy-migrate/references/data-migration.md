# データ移行ガイド

スキーマ移行完了後、本番データを移行する手順。

---

## Step 1: データ分類

| 種別 | 例 | 移行方法 |
|------|-----|---------|
| マスタデータ | カテゴリ、設定 | scripts/seed/で再作成 |
| ユーザーデータ | ユーザー、プロフィール | 移行スクリプトで変換 |
| トランザクション | 注文、履歴 | 移行スクリプトで変換 |
| 添付ファイル | 画像、ドキュメント | ストレージ移行 |

---

## Step 2: 移行スクリプト作成

```typescript
// scripts/migrate-data/users.ts
import { legacyDb } from './legacy-connection';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';

export async function migrateUsers() {
  // レガシーDBからデータ取得
  const legacyUsers = await legacyDb.query('SELECT * FROM users');

  // データ変換
  const newUsers = legacyUsers.map(u => ({
    id: u.id.toString(),
    email: u.email,
    name: u.name || u.username,
    // passwordHashは再設定が必要（セキュリティ上）
    createdAt: new Date(u.created_at),
  }));

  // 新DBに挿入
  await db.insert(users).values(newUsers).onConflictDoNothing();

  console.log(`✅ users: ${newUsers.length}件移行完了`);
}
```

---

## Step 3: 移行実行

```bash
# 開発環境でテスト
pnpm migrate:data --env=development

# 本番環境で実行
pnpm migrate:data --env=production
```

---

## Step 4: データ検証

```markdown
## データ検証チェックリスト

| テーブル | レガシー件数 | 新DB件数 | 差分 | 状態 |
|---------|------------|---------|------|------|
| users | 1,000 | 1,000 | 0 | ✅ |
| products | 500 | 500 | 0 | ✅ |
| orders | 2,000 | 1,998 | 2 | ⚠️ 要確認 |
```

---

## Step 5: パスワードリセット対応

セキュリティ上、パスワードハッシュは移行しない場合:

1. 全ユーザーに「パスワードリセット」メール送信
2. または初回ログイン時にパスワード再設定を強制

```typescript
// パスワードリセットメール一括送信
export async function sendPasswordResetEmails() {
  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    await sendPasswordResetEmail(user.email);
  }
}
```

---

## 完了条件

- [ ] マスタデータ移行完了
- [ ] ユーザーデータ移行完了
- [ ] トランザクションデータ移行完了
- [ ] データ件数検証OK
- [ ] サンプルデータの動作確認OK
