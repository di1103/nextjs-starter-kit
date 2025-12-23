# 開発手順

このプロジェクトの開発ルール・パターンです。

---

## ファイル配置（コンポーネントコロケーションパターン）

### ディレクトリ構造

```
app/
├── page.tsx                    # トップページ
├── layout.tsx                  # ルートレイアウト
├── components/                 # グローバル共通コンポーネント
│   ├── ui/                     # shadcn/ui コンポーネント
│   ├── Header.tsx              # 全ページ共通ヘッダー
│   └── Footer.tsx              # 全ページ共通フッター
├── admin/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── components/             # admin専用コンポーネント
│       ├── AdminSidebar.tsx
│       └── AdminStats.tsx
├── products/
│   ├── page.tsx
│   ├── components/             # products専用コンポーネント
│   │   ├── ProductList.tsx
│   │   └── ProductCard.tsx
│   └── [id]/
│       ├── page.tsx
│       └── components/         # 商品詳細専用コンポーネント
│           └── ProductDetail.tsx
lib/
├── actions/                    # Server Actions
├── db/
│   ├── schemas/                # DBスキーマ
│   └── migrations/             # マイグレーション
└── validations/                # Zodスキーマ
```

### 配置ルール

| 種類 | パス | 説明 |
|------|------|------|
| ページ | `app/[route]/page.tsx` | ルートごとのページ |
| レイアウト | `app/[route]/layout.tsx` | ルートごとのレイアウト |
| ローディング | `app/[route]/loading.tsx` | ローディングUI |
| エラー | `app/[route]/error.tsx` | エラーUI |
| ルート専用コンポーネント | `app/[route]/components/[Name].tsx` | そのルートでのみ使用 |
| グローバルコンポーネント | `app/components/[Name].tsx` | 複数ルートで共有 |
| UIコンポーネント | `app/components/ui/[name].tsx` | shadcn/ui |
| Server Actions | `lib/actions/[name].ts` | サーバーアクション |
| DBスキーマ | `lib/db/schemas/[name].ts` | Drizzleスキーマ |
| バリデーション | `lib/validations/[name].ts` | Zodスキーマ |

### コンポーネント配置の判断基準

```
そのコンポーネントは複数のルートで使う？
├── Yes → app/components/ に配置
└── No  → app/[route]/components/ に配置
```

### 例: productsルートの構成

```tsx
// app/products/page.tsx
import { ProductList } from './components/ProductList';

export default function ProductsPage() {
  return (
    <div>
      <h1>商品一覧</h1>
      <ProductList />
    </div>
  );
}

// app/products/components/ProductList.tsx
import { ProductCard } from './ProductCard';

export function ProductList({ products }) {
  return (
    <div className="grid gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// app/products/components/ProductCard.tsx
export function ProductCard({ product }) {
  return <div>{product.name}</div>;
}
```

---

## 命名規則

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `UserList.tsx` |
| 関数 | camelCase | `createUser` |
| ファイル（非コンポーネント） | kebab-case | `auth-helpers.ts` |
| DBテーブル | snake_case | `user_profiles` |
| DBカラム | snake_case | `created_at` |
| 環境変数 | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

---

## Server Actions パターン

### 基本構造

```typescript
'use server';

import { requireAuth } from '@/lib/actions/auth-helpers';
import { db } from '@/lib/db';
import { xxxTable } from '@/lib/db/schemas';
import { xxxSchema } from '@/lib/validations/xxx';

export async function createXxx(input: unknown) {
  // 1. 認証チェック
  const session = await requireAuth();

  // 2. バリデーション
  const validated = xxxSchema.parse(input);

  // 3. DB操作
  const [result] = await db
    .insert(xxxTable)
    .values({
      ...validated,
      userId: session.user.id,
    })
    .returning();

  // 4. 結果を返す
  return { success: true, data: result };
}
```

### エラーハンドリング

```typescript
'use server';

export async function createXxx(input: unknown) {
  try {
    const session = await requireAuth();
    const validated = xxxSchema.parse(input);

    const [result] = await db.insert(xxxTable).values(validated).returning();

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '予期せぬエラーが発生しました' };
  }
}
```

### 認証ヘルパー

| ヘルパー | 用途 |
|---------|------|
| `requireAuth()` | ログイン必須（未ログインでエラー） |
| `requireAdmin()` | 管理者のみ（権限不足でエラー） |
| `getCurrentUser()` | ユーザー情報取得 |

```typescript
import { requireAuth, requireAdmin } from '@/lib/actions/auth-helpers';

// ログインユーザーのみ
export async function getUserData() {
  const session = await requireAuth();
  // ...
}

// 管理者のみ
export async function deleteUser(userId: string) {
  await requireAdmin();
  // ...
}
```

---

## DBスキーマ パターン

### テーブル定義

```typescript
// lib/db/schemas/products.ts
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### index.ts にエクスポート

```typescript
// lib/db/schemas/index.ts
export * from './auth-schema';
export * from './products';  // 追加
```

### リレーション

```typescript
import { pgTable, text } from 'drizzle-orm/pg-core';
import { users } from './auth-schema';

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
});
```

---

## バリデーション パターン

### Zodスキーマ

```typescript
// lib/validations/product.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100),
  price: z.number().int().min(0, '価格は0以上です'),
  description: z.string().max(1000).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
```

### 部分スキーマ

```typescript
// 作成用
export const createProductSchema = productSchema;

// 更新用（全てオプショナル）
export const updateProductSchema = productSchema.partial();

// ID付き
export const productWithIdSchema = productSchema.extend({
  id: z.string(),
});
```

---

## コンポーネント パターン

### Server Component（ルート専用）

```tsx
// app/products/components/ProductList.tsx
import { db } from '@/lib/db';
import { products } from '@/lib/db/schemas';
import { ProductCard } from './ProductCard';

export async function ProductList() {
  const items = await db.select().from(products);

  if (items.length === 0) {
    return <p className="text-muted-foreground">商品がありません</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  );
}
```

### Client Component（ルート専用）

```tsx
// app/products/components/ProductForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { productSchema, type ProductInput } from '@/lib/validations/product';
import { createProduct } from '@/lib/actions/product';

export function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', price: 0 },
  });

  async function onSubmit(data: ProductInput) {
    setIsLoading(true);
    try {
      const result = await createProduct(data);
      if (result.success) {
        toast.success('保存しました');
        form.reset();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input {...form.register('name')} placeholder="商品名" />
      <Input {...form.register('price', { valueAsNumber: true })} type="number" placeholder="価格" />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '保存中...' : '保存'}
      </Button>
    </form>
  );
}
```

### グローバル共通コンポーネント

```tsx
// app/components/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// 使用例: app/products/page.tsx
import { PageHeader } from '@/app/components/PageHeader';
import { ProductList } from './components/ProductList';

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="商品一覧" description="登録された商品の一覧です" />
      <ProductList />
    </div>
  );
}
```

---

## エラーハンドリング

### Server Actions

```typescript
// 戻り値の型
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### UI側

```tsx
const result = await createProduct(data);

if (result.success) {
  toast.success('保存しました');
} else {
  toast.error(result.error);
}
```

### 予期せぬエラー（Sentry）

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // 処理
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

---

## 認証・認可

### ページレベル

```tsx
// app/admin/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/');
  }

  // 管理者チェックが必要な場合
  // const user = await getCurrentUser();
  // if (user.role !== 'admin') redirect('/');

  return <div>管理者ページ</div>;
}
```

### Server Actions

```typescript
// requireAuth() または requireAdmin() を使用
export async function adminOnlyAction() {
  await requireAdmin();
  // 管理者のみ実行可能な処理
}
```

---

## ファイルアップロード（Supabase Storage）

```typescript
'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/actions/auth-helpers';

export async function uploadFile(formData: FormData) {
  const session = await requireAuth();
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'ファイルがありません' };
  }

  const fileName = `${session.user.id}/${Date.now()}-${file.name}`;

  const { data, error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(fileName, file);

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabaseAdmin.storage
    .from('uploads')
    .getPublicUrl(data.path);

  return { success: true, url: urlData.publicUrl };
}
```

---

## テスト観点

### 正常系

- 期待通りの入力で正しく動作するか
- データが正しく保存されるか
- UIが正しく表示されるか

### 異常系

- バリデーションエラーが適切に表示されるか
- 認証エラーが適切に処理されるか
- ネットワークエラー時の挙動

### 境界値

- 最大文字数
- 最小値・最大値
- 空の入力
