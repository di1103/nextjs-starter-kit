# 実装コード例

実装時に参照するコード例集。

---

## DBスキーマ

```typescript
// lib/db/schemas/products.ts
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## バリデーション

```typescript
// lib/validations/product.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().int().min(0),
});

export type ProductInput = z.infer<typeof productSchema>;
```

---

## Server Actions

```typescript
// lib/actions/product.ts
'use server';

import { requireAuth } from '@/lib/actions/auth-helpers';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schemas';
import { productSchema } from '@/lib/validations/product';

export async function createProduct(input: unknown) {
  const session = await requireAuth();
  const validated = productSchema.parse(input);

  const [result] = await db
    .insert(products)
    .values(validated)
    .returning();

  return { success: true, data: result };
}
```

---

## UIコンポーネント

### ページファイル

```tsx
// app/products/page.tsx
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';

export default function ProductsPage() {
  return (
    <div className="space-y-8 p-6 md:p-8">
      <h1 className="text-2xl font-semibold">商品管理</h1>
      <ProductForm />
      <ProductList />
    </div>
  );
}
```

### フォームコンポーネント

```tsx
// app/products/components/ProductForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>商品登録</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input className="h-11" placeholder="商品名" />
        <Input className="h-11" type="number" placeholder="価格" />
        <Button className="w-full min-h-[44px]" disabled={isLoading}>
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## テスト

### バリデーションテスト

```typescript
// lib/validations/product.test.ts
import { describe, it, expect } from 'vitest';
import { productSchema } from './product';

describe('productSchema', () => {
  // F-2-1: 必須チェック
  it('F-2-1: 名前が空の場合エラー', () => {
    const result = productSchema.safeParse({ name: '', price: 1000 });
    expect(result.success).toBe(false);
  });

  // F-2-5: 境界値
  it('F-2-5: 価格が0は許可', () => {
    const result = productSchema.safeParse({ name: '商品', price: 0 });
    expect(result.success).toBe(true);
  });

  it('F-2-5: 価格が-1はエラー', () => {
    const result = productSchema.safeParse({ name: '商品', price: -1 });
    expect(result.success).toBe(false);
  });
});
```

### Server Actionsテスト

```typescript
// lib/actions/product.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createProduct } from './product';

describe('createProduct', () => {
  // S-2-1: 未認証アクセス
  it('S-2-1: 未認証の場合エラー', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));
    await expect(createProduct({ name: '商品', price: 1000 }))
      .rejects.toThrow('Unauthorized');
  });
});
```

---

## シードデータ

```typescript
// scripts/seed/categories.ts
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schemas';

export async function seedCategories() {
  const data = [
    { id: 'cat-1', name: '電子機器', slug: 'electronics' },
    { id: 'cat-2', name: '衣類', slug: 'clothing' },
    { id: 'cat-3', name: '書籍', slug: 'books' },
  ];

  await db.insert(categories).values(data).onConflictDoNothing();
  console.log(`✅ categories: ${data.length}件`);
}
```
