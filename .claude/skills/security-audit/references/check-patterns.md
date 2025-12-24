# セキュリティチェックパターン

各診断カテゴリのコード例とパターン。

---

## 認証・認可 (AUTH)

### AUTH-1: 認証チェック

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
```

### AUTH-4: 他ユーザーデータへのアクセス

```typescript
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

## 入力検証 (INPUT)

### INPUT-1/2: Zod検証

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
    .set({ name: (input as any).name });  // NG
}

// OK: 検証後の値を使用
export async function updateProduct(input: unknown) {
  const validated = productSchema.parse(input);
  await db.update(products)
    .set({ name: validated.name });  // OK
}
```

---

## データ漏洩 (LEAK)

### LEAK-1: パスワードハッシュ露出

```typescript
// NG: 全カラムを返す
export async function getUsers() {
  return db.select().from(users);
}

// OK: 必要なカラムのみ
export async function getUsers() {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    // passwordHash は除外
  }).from(users);
}
```

### LEAK-3: エラー詳細露出

```typescript
// NG: エラー詳細をそのまま返す
catch (error) {
  return { error: error.message };  // SQLエラー等が露出
}

// OK: 汎用メッセージ
catch (error) {
  console.error(error);  // ログには記録
  return { error: '処理に失敗しました' };
}
```

---

## インジェクション対策 (INJ)

### INJ-1: SQLインジェクション

```typescript
// NG: 生SQL
const result = await db.execute(
  `SELECT * FROM users WHERE email = '${email}'`
);

// OK: Drizzle ORMのクエリビルダー
const result = await db.select()
  .from(users)
  .where(eq(users.email, email));
```

### INJ-2: XSS

```tsx
// NG: XSSの危険
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// OK: テキストとして表示
<div>{userInput}</div>
```

### INJ-5: オープンリダイレクト

```typescript
// NG: オープンリダイレクト
redirect(searchParams.get('returnUrl'));

// OK: 許可リストで検証
const allowedPaths = ['/dashboard', '/profile'];
const returnUrl = searchParams.get('returnUrl');
if (allowedPaths.includes(returnUrl)) {
  redirect(returnUrl);
} else {
  redirect('/');
}
```

---

## 設定 (CONFIG)

### CONFIG-1: ハードコードシークレット

```typescript
// NG: ハードコードされたシークレット
const API_KEY = "sk-1234567890abcdef";

// OK: 環境変数から取得
const API_KEY = process.env.API_KEY;
```

### CONFIG-3: NEXT_PUBLIC_ の誤用

```bash
# NG: サーバー専用の値を公開
NEXT_PUBLIC_DATABASE_URL=...
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=...

# OK: 公開可能な値のみ
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 自動修正ガイド

### 認証追加

```typescript
// 修正前
export async function dangerousAction(input: unknown) {
  await db.insert(products).values(input);
}

// 修正後
export async function dangerousAction(input: unknown) {
  await requireAuth();  // 追加
  const validated = productSchema.parse(input);  // 追加
  await db.insert(products).values(validated);
}
```

### select 制限

```typescript
// 修正前
return db.select().from(users);

// 修正後
return db.select({
  id: users.id,
  name: users.name,
  email: users.email,
}).from(users);
```
