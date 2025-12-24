---
name: security-audit
description: 実装完了時にセキュリティ観点でコードを診断し、脆弱性を検出するスキル。認証・認可、入力検証、データ漏洩、インジェクション対策、設定をチェック。「セキュリティ診断して」「セキュリティ監査して」などの指示で起動。
---

# セキュリティ診断スキル

実装完了時にセキュリティ観点でコードを診断し、脆弱性を検出するスキルです。

---

## 実行タイミング

- 実装フェーズ完了後（implement.md の Step 6 後）
- プルリクエスト作成前
- ユーザーから「セキュリティ診断して」と指示があったとき

---

## 診断フロー

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 対象ファイルの特定                                  │
│  ├── 新規作成・変更されたファイルを取得                      │
│  ├── Server Actions (lib/actions/)                          │
│  ├── APIルート (app/api/)                                   │
│  ├── DBスキーマ (lib/db/schemas/)                           │
│  └── コンポーネント (app/**/components/)                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: 自動診断チェック                                    │
│  ├── 認証・認可チェック                                      │
│  ├── 入力検証チェック                                        │
│  ├── データ漏洩チェック                                      │
│  ├── インジェクション対策チェック                            │
│  └── 設定・環境変数チェック                                  │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: 診断レポート生成                                    │
│  ├── 重大度別に分類（Critical / High / Medium / Low）        │
│  ├── 修正推奨コードを提示                                    │
│  └── 未対応項目をブロッカーとして記録                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 診断チェックリスト

### 1. 認証・認可（AUTH）

| ID | チェック項目 | 重大度 | 確認方法 |
|----|-------------|--------|---------|
| AUTH-1 | Server Actionsに認証チェックがあるか | Critical | `requireAuth()` または `requireAdmin()` の呼び出し確認 |
| AUTH-2 | 保護すべきAPIルートに認証があるか | Critical | ミドルウェアまたはルート内での認証確認 |
| AUTH-3 | 権限チェックが適切か（admin操作にrequireAdmin） | High | 設計書の「権限」と実装の照合 |
| AUTH-4 | 他ユーザーのデータにアクセスできないか | Critical | `where` 句に `userId` フィルタがあるか確認 |
| AUTH-5 | セッション情報を信頼しすぎていないか | Medium | クライアントからのuser.idを直接使用していないか |

**チェックパターン**:
```typescript
// NG: 認証なしのServer Action
export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

// OK: 認証あり + 権限チェック
export async function deleteProduct(id: string) {
  await requireAdmin();  // 管理者のみ
  await db.delete(products).where(eq(products.id, id));
}

// NG: 他ユーザーのデータにアクセス可能
export async function getOrder(orderId: string) {
  await requireAuth();
  return db.select().from(orders).where(eq(orders.id, orderId));
}

// OK: 自分のデータのみ
export async function getOrder(orderId: string) {
  const session = await requireAuth();
  return db.select().from(orders).where(
    and(eq(orders.id, orderId), eq(orders.userId, session.user.id))
  );
}
```

---

### 2. 入力検証（INPUT）

| ID | チェック項目 | 重大度 | 確認方法 |
|----|-------------|--------|---------|
| INPUT-1 | Server Actionsで入力をZodで検証しているか | High | `schema.parse()` または `schema.safeParse()` の呼び出し |
| INPUT-2 | 検証前のデータをDBに渡していないか | Critical | `parse()` 後の値を使用しているか |
| INPUT-3 | ファイルアップロードの検証があるか | High | ファイルタイプ・サイズの制限 |
| INPUT-4 | URLパラメータを検証しているか | Medium | 動的ルートのパラメータ検証 |
| INPUT-5 | 数値のパースが安全か | Medium | `parseInt` ではなく Zod の `z.coerce.number()` |

**チェックパターン**:
```typescript
// NG: 検証なし
export async function createProduct(input: unknown) {
  await db.insert(products).values(input as any);
}

// OK: Zod検証あり
export async function createProduct(input: unknown) {
  const validated = productSchema.parse(input);
  await db.insert(products).values(validated);
}

// NG: 検証前の値を使用
export async function updateProduct(input: unknown) {
  const validated = productSchema.parse(input);
  await db.update(products)
    .set({ name: (input as any).name });  // NG: inputを直接使用
}

// OK: 検証後の値を使用
export async function updateProduct(input: unknown) {
  const validated = productSchema.parse(input);
  await db.update(products)
    .set({ name: validated.name });  // OK: validatedを使用
}
```

---

### 3. データ漏洩（LEAK）

| ID | チェック項目 | 重大度 | 確認方法 |
|----|-------------|--------|---------|
| LEAK-1 | パスワードハッシュを返していないか | Critical | `select()` で password 列を除外しているか |
| LEAK-2 | 機密情報をクライアントに送っていないか | High | APIレスポンスに秘密鍵・トークンがないか |
| LEAK-3 | エラーメッセージで内部情報を露出していないか | Medium | スタックトレース・SQL文の露出 |
| LEAK-4 | console.log に機密情報を出力していないか | Medium | 本番環境でのログ確認 |
| LEAK-5 | 一覧取得で全件返していないか | Medium | ページネーション・limit の有無 |

**チェックパターン**:
```typescript
// NG: 全カラムを返す（パスワードハッシュ含む可能性）
export async function getUsers() {
  return db.select().from(users);
}

// OK: 必要なカラムのみ
export async function getUsers() {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
  }).from(users);
}

// NG: エラー詳細をそのまま返す
catch (error) {
  return { error: error.message };  // SQLエラー等が露出
}

// OK: 汎用メッセージ
catch (error) {
  console.error(error);  // ログには記録
  return { error: '処理に失敗しました' };  // ユーザーには汎用メッセージ
}
```

---

### 4. インジェクション対策（INJ）

| ID | チェック項目 | 重大度 | 確認方法 |
|----|-------------|--------|---------|
| INJ-1 | SQLインジェクション対策 | Critical | Drizzle ORMのクエリビルダー使用（生SQLなし） |
| INJ-2 | XSS対策 | High | `dangerouslySetInnerHTML` の使用箇所確認 |
| INJ-3 | コマンドインジェクション対策 | Critical | `exec()` `spawn()` へのユーザー入力 |
| INJ-4 | パストラバーサル対策 | High | ファイルパスにユーザー入力を使用していないか |
| INJ-5 | リダイレクトオープン対策 | Medium | リダイレクト先URLの検証 |

**チェックパターン**:
```typescript
// NG: 生SQL（SQLインジェクションの危険）
const result = await db.execute(
  `SELECT * FROM users WHERE email = '${email}'`
);

// OK: Drizzle ORMのクエリビルダー
const result = await db.select()
  .from(users)
  .where(eq(users.email, email));

// NG: XSSの危険
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// OK: テキストとして表示（自動エスケープ）
<div>{userInput}</div>

// NG: オープンリダイレクト
redirect(searchParams.get('returnUrl'));

// OK: 許可リストで検証
const allowedPaths = ['/dashboard', '/profile', '/settings'];
const returnUrl = searchParams.get('returnUrl');
if (allowedPaths.includes(returnUrl)) {
  redirect(returnUrl);
} else {
  redirect('/');
}
```

---

### 5. 設定・環境変数（CONFIG）

| ID | チェック項目 | 重大度 | 確認方法 |
|----|-------------|--------|---------|
| CONFIG-1 | シークレットがハードコードされていないか | Critical | コード内の固定トークン・パスワード検索 |
| CONFIG-2 | 本番用シークレットがコミットされていないか | Critical | .gitignore と .env ファイルの確認 |
| CONFIG-3 | NEXT_PUBLIC_ の使い分けが適切か | High | 公開すべきでない値に NEXT_PUBLIC_ がないか |
| CONFIG-4 | CORS設定が適切か | Medium | APIルートのCORS設定確認 |
| CONFIG-5 | セキュリティヘッダーが設定されているか | Low | next.config.ts の headers 設定 |

**チェックパターン**:
```typescript
// NG: ハードコードされたシークレット
const API_KEY = "sk-1234567890abcdef";

// OK: 環境変数から取得
const API_KEY = process.env.API_KEY;

// NG: サーバー専用の値を公開
NEXT_PUBLIC_DATABASE_URL=...  // 絶対NG
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=...  // 絶対NG

// OK: 公開可能な値のみ NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 診断実行手順

### Step 1: 対象ファイルの特定

```
Task(subagent_type="Explore")
├── 今回の実装で作成・変更されたファイルを特定
├── Server Actions (lib/actions/*.ts)
├── APIルート (app/api/**/*.ts)
├── DBスキーマ (lib/db/schemas/*.ts)
└── コンポーネント (app/**/components/*.tsx)
```

### Step 2: 各チェック項目を実行

各ファイルに対して以下を確認:

1. **AUTH チェック**: 認証・認可の実装確認
2. **INPUT チェック**: 入力検証の実装確認
3. **LEAK チェック**: データ漏洩リスクの確認
4. **INJ チェック**: インジェクション対策の確認
5. **CONFIG チェック**: 設定・環境変数の確認

### Step 3: 診断レポート生成

---

## 診断レポートフォーマット

```markdown
## セキュリティ診断レポート

**診断日時**: YYYY-MM-DD HH:MM
**対象**: [設計書名 / 機能名]
**診断ファイル数**: X件

---

### サマリー

| 重大度 | 件数 | 対応状況 |
|--------|------|---------|
| Critical | X | 即時対応必須 |
| High | X | 対応推奨 |
| Medium | X | 検討 |
| Low | X | 任意 |

---

### 検出項目

#### Critical（即時対応必須）

##### [INJ-1] SQLインジェクションの危険
- **ファイル**: `lib/actions/product.ts:25`
- **問題**: 生SQLクエリでユーザー入力を直接使用
- **修正前**:
```typescript
const result = await db.execute(`SELECT * FROM products WHERE name LIKE '%${name}%'`);
```
- **修正後**:
```typescript
const result = await db.select().from(products).where(like(products.name, `%${name}%`));
```

---

#### High（対応推奨）

##### [AUTH-3] 権限チェック不足
- **ファイル**: `lib/actions/user.ts:42`
- **問題**: 管理者操作に `requireAuth()` のみ使用
- **修正**: `requireAdmin()` に変更

---

### 対応不要（確認済み）

| ID | 項目 | 確認結果 |
|----|------|---------|
| AUTH-1 | 認証チェック | ✅ 全Server Actionsで実装済み |
| INPUT-1 | Zod検証 | ✅ 全入力でスキーマ検証済み |
| LEAK-1 | パスワード除外 | ✅ select で除外済み |

---

### 次のアクション

1. [ ] Critical項目を修正
2. [ ] High項目を修正
3. [ ] 修正後に再診断を実行
```

---

## 重大度の定義

| 重大度 | 定義 | 対応 |
|--------|------|------|
| **Critical** | 即座に悪用可能な脆弱性（認証バイパス、SQLインジェクション等） | 実装完了前に必ず修正 |
| **High** | 悪用される可能性が高い脆弱性（権限昇格、データ漏洩等） | 実装完了前に修正推奨 |
| **Medium** | 悪用には条件が必要な脆弱性（情報露出等） | 次回リリースまでに修正 |
| **Low** | ベストプラクティス違反（ヘッダー設定等） | 任意で対応 |

---

## 診断スキップ条件

以下の場合は診断をスキップ可能:

1. **UIのみの変更**: スタイル・レイアウトのみの変更
2. **ドキュメントのみ**: .md ファイルのみの変更
3. **テストのみ**: .test.ts, .spec.ts のみの変更

ただし、ユーザーが明示的に診断を要求した場合は実行する。

---

## 自動修正ガイド

Critical/High の項目は、可能な限り自動修正を提案:

### 認証追加の自動修正
```typescript
// 修正前
export async function dangerousAction(input: unknown) {
  // 認証なし
  await db.insert(products).values(input);
}

// 修正後（自動提案）
export async function dangerousAction(input: unknown) {
  await requireAuth();  // ← 追加
  const validated = productSchema.parse(input);  // ← 追加
  await db.insert(products).values(validated);
}
```

### select 制限の自動修正
```typescript
// 修正前
return db.select().from(users);

// 修正後（自動提案）
return db.select({
  id: users.id,
  name: users.name,
  email: users.email,
  // passwordHash は除外
}).from(users);
```

---

## 注意事項

- Critical 項目が残っている場合、実装完了としない
- 診断レポートは `docs/progress/security-audit/` に保存
- 本番デプロイ前に必ず再診断を実行
