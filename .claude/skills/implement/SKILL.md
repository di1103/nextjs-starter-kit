---
name: implement
description: 設計書に基づいて実装を行うスキル。DBスキーマ、バリデーション、Server Actions、UI、テストを設計書を正として段階的に実装。「実装して」「設計書を実装して」「実装フェーズを開始して」などの指示で起動。
---

# 実装スキル

設計書に基づいて実装を行うスキルです。設計書を正として、差分があれば自動修正します。

---

## 実行タイミング

ユーザーから以下のような指示を受けたとき:
- 「要件定義駆動開発の実装フェーズを開始して」
- 「実装を開始して」
- 「設計書を実装して」

---

## 全体フロー

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: 実装準備 (Subagent: Explore)                       │
│  ├── docs/progress/design-docs-list.md から未実装を取得      │
│  ├── .claude/skills/guidelines/* を読み込み                   │
│  ├── 既存コードのパターンを把握                              │
│  └── 実装対象の設計書一覧を抽出                              │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: 実装計画 (Subagent: Plan)                          │
│  ├── 設計書間の依存関係を分析                                │
│  ├── 実装順序を決定                                          │
│  ├── 各設計書の実装ステップを計画                            │
│  └── 作成するファイル一覧を確定                              │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: 段階的実装（設計書を正として自動修正）              │
│  ├── Step 1: DBスキーマ                                      │
│  ├── Step 2: バリデーション                                  │
│  ├── Step 3: Server Actions                                  │
│  ├── Step 4: UI                                              │
│  ├── Step 5: テスト作成                                      │
│  └── Step 6: 動作確認                                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: セキュリティ診断                                   │
│  ├── .claude/skills/security-audit.md に従って診断           │
│  ├── Critical/High項目があれば修正                           │
│  └── 診断レポートを生成                                      │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: 進捗更新                                           │
│  ├── 設計書の実装チェックリストを更新                        │
│  ├── design-docs-list.md を「実装完了」に更新                │
│  └── 次の設計書へ                                            │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
              全設計書完了まで繰り返し
```

---

## Phase 1: 実装準備 (Subagent: Explore)

```
Task(subagent_type="Explore")
├── docs/progress/design-docs-list.md を読み込み
│   └── 状態が「設計完了」の設計書を抽出
├── .claude/skills/guidelines/design-system.md を読み込み
│   └── デザイン方針を把握
├── .claude/skills/guidelines/development.md を読み込み
│   └── 開発パターンを把握
├── lib/db/schemas/ の既存スキーマを確認
│   └── 命名規則・パターンを把握
├── lib/actions/ の既存アクションを確認
│   └── 認証パターン・エラーハンドリングを把握
└── app/components/ の既存コンポーネントを確認
    └── コンポーネント構成パターンを把握
```

**出力**:
- 実装対象の設計書一覧
- 既存コードのパターン要約
- ガイドラインの要点

---

## Phase 2: 実装計画 (Subagent: Plan)

```
Task(subagent_type="Plan")
├── 設計書間の依存関係を分析
│   ├── DBテーブルのリレーション
│   ├── Server Actions間の依存
│   └── UIコンポーネントの親子関係
├── 実装順序を決定
│   └── 依存される側から先に実装
├── 各設計書の実装ステップを計画
│   ├── 必要なファイル一覧
│   ├── 各ステップの詳細
│   └── 注意点・リスク
└── 作成するファイル一覧を確定
    ├── lib/db/schemas/xxx.ts
    ├── lib/validations/xxx.ts
    ├── lib/actions/xxx.ts
    └── app/[route]/components/Xxx.tsx  # コロケーションパターン
```

**出力**:
- 実装順序（依存関係順）
- 設計書ごとの実装計画
- 作成ファイル一覧

---

## 実装順序の基本原則

依存関係に基づく基本的な実装順序:

```
1. 認証・ユーザー関連
   └── users, sessions, accounts など

2. マスタデータ
   └── categories, tags, settings など
   └── 他から参照されるが、自身は参照しないテーブル

3. トランザクションデータ
   └── products, orders, posts など
   └── マスタデータを参照するテーブル

4. 関連・中間テーブル
   └── product_categories, user_roles など
   └── 複数テーブルを参照するテーブル

5. UIコンポーネント
   └── 親コンポーネント → 子コンポーネント
   └── 共通コンポーネント → ページ固有コンポーネント
```

### 依存関係の判定

| 依存パターン | 例 | 実装順序 |
|------------|-----|---------|
| 外部キー参照 | products.userId → users.id | users → products |
| Actions間呼び出し | createOrder → getProduct | getProduct → createOrder |
| コンポーネント親子 | ProductList → ProductCard | ProductCard → ProductList |

---

## Phase 3: 段階的実装

### Step 1: DBスキーマ

1. 設計書の「データベース設計」セクションを参照
2. `lib/db/schemas/[name].ts` を作成
3. `lib/db/schemas/index.ts` にエクスポート追加
4. **比較**: 設計書のスキーマ定義と実装を照合
5. **差分あり**: 設計書を正として実装を修正
6. ユーザーに `pnpm db:push` の実行を依頼

```typescript
// 設計書の定義をそのまま実装
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Step 1.5: シードデータ（マスタデータがある場合）

マスタデータ（カテゴリ、設定値など）が必要な場合、シードファイルを作成。

1. `scripts/seed/[name].ts` を作成
2. `scripts/seed/index.ts` から呼び出し
3. `package.json` にスクリプト追加（必要に応じて）

```typescript
// scripts/seed/categories.ts
import { db, cleanup } from './index';
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

#### シードデータの分類

| 種別 | 配置 | 実行タイミング |
|------|------|---------------|
| マスタデータ | `scripts/seed/master/[name].ts` | 本番・開発両方 |
| 開発用データ | `scripts/seed/dev/[name].ts` | 開発環境のみ |
| 管理者作成 | `scripts/seed/admin.ts` | 初回セットアップ |

#### 注意事項

- `onConflictDoNothing()` で冪等性を担保
- IDは固定値を使用（UUID生成しない）
- 本番環境で実行するマスタデータは設計書に記載

---

### Step 2: バリデーション

1. 設計書の「バリデーション」セクションを参照
2. `lib/validations/[name].ts` を作成
3. `lib/validations/index.ts` にエクスポート追加
4. **比較**: 設計書のZodスキーマと実装を照合
5. **差分あり**: 設計書を正として実装を修正

```typescript
// 設計書の定義をそのまま実装
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().int().min(0),
});

export type ProductInput = z.infer<typeof productSchema>;
```

---

### Step 3: Server Actions

1. 設計書の「API / Server Actions」セクションを参照
2. `lib/actions/[name].ts` を作成
3. **比較**: 引数・戻り値・権限が設計書通りか照合
4. **差分あり**: 設計書を正として実装を修正

```typescript
'use server';

import { requireAuth } from '@/lib/actions/auth-helpers';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schemas';
import { productSchema } from '@/lib/validations/product';

// 設計書通りの引数・戻り値・権限で実装
export async function createProduct(input: unknown) {
  const session = await requireAuth();  // 設計書の権限に従う
  const validated = productSchema.parse(input);

  const [result] = await db
    .insert(products)
    .values(validated)
    .returning();

  return { success: true, data: result };
}
```

---

### Step 4: UI実装

1. 関連UI設計書を参照
2. `.claude/skills/guidelines/design-system.md` を参照
3. ページファイルを作成: `app/[route]/page.tsx`
4. コンポーネントを作成（コロケーションパターン）:
   - ルート専用: `app/[route]/components/[Name].tsx`
   - 複数ルート共有: `app/components/[Name].tsx`
5. **比較**: ページ構成・コンポーネント構成が設計書通りか照合
6. **差分あり**: 設計書を正として実装を修正

実装時の注意:
- shadcn/ui コンポーネントを使用
- レイアウトはApple風（広い余白、視覚的階層）
- ミニマムデザイン（必要最小限、装飾を排除）
- モバイル最適化（タップターゲット44px、親指ゾーン考慮）

```tsx
// ページファイル
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

```tsx
// コンポーネント（コロケーションパターン）
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

### Step 5: テスト作成（観点ベース）

1. 設計書の「テスト観点」セクションを参照
2. `.claude/skills/guidelines/test-viewpoints.md` で観点の詳細を確認
3. 各観点に対応するテストを作成:
   - バリデーション: `lib/validations/[name].test.ts`
   - Server Actions: `lib/actions/[name].test.ts`
   - コンポーネント: `app/[route]/components/[Name].test.tsx`
4. 全観点にテストがあることを確認
5. `pnpm test:run` で全テスト実行

#### 観点からテストへの変換例

設計書のテスト観点:
```markdown
| ID | 観点 | テスト種別 | 優先度 |
|----|------|-----------|--------|
| F-2-1 | 必須チェック | Unit | 必須 |
| F-2-5 | 境界値 | Unit | 必須 |
| S-2-1 | 未認証アクセス | Unit | 必須 |
```

対応するテストコード:
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

// lib/actions/product.test.ts
describe('createProduct', () => {
  // S-2-1: 未認証アクセス
  it('S-2-1: 未認証の場合エラー', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));
    await expect(createProduct({ name: '商品', price: 1000 }))
      .rejects.toThrow('Unauthorized');
  });
});
```

#### テスト完了条件

- [ ] 設計書の全観点（必須）にテストがある
- [ ] テスト名に観点ID（F-2-1等）が含まれている
- [ ] `pnpm test:run` が全てパス

---

### Step 6: 動作確認

1. 設計書の「テスト観点」セクションを参照
2. `pnpm dev` で起動
3. 正常系を確認
4. 異常系を確認
5. 問題があれば該当ステップに戻って修正

確認項目:
- [ ] 画面が正しく表示されるか
- [ ] フォーム送信が動作するか
- [ ] データが保存されるか
- [ ] エラー時に適切なメッセージが出るか
- [ ] モバイルで操作しやすいか
- [ ] テストが全てパスするか

---

## Phase 4: セキュリティ診断

Step 6 完了後、実装コードのセキュリティを診断する。

### 実行手順

1. `.claude/skills/security-audit.md` を参照
2. 今回実装したファイルを対象に診断を実行
3. 診断レポートを生成

### 診断カテゴリ

| カテゴリ | ID接頭辞 | 主な確認内容 |
|---------|---------|-------------|
| 認証・認可 | AUTH | requireAuth/requireAdmin の有無、権限チェック |
| 入力検証 | INPUT | Zodスキーマ検証、検証前データの使用 |
| データ漏洩 | LEAK | パスワード除外、機密情報の露出 |
| インジェクション | INJ | SQLi, XSS, コマンドインジェクション |
| 設定 | CONFIG | ハードコード秘密鍵、環境変数 |

### 診断結果の対応

| 重大度 | 対応 |
|--------|------|
| Critical | **実装完了前に必ず修正**（ブロッカー） |
| High | 実装完了前に修正推奨 |
| Medium | 次回リリースまでに修正 |
| Low | 任意で対応 |

### 完了条件

- [ ] Critical 項目が 0件
- [ ] High 項目が 0件（または対応計画あり）
- [ ] 診断レポートを生成済み

Critical/High が残っている場合、Phase 5 に進まない。

---

## Phase 5: 進捗更新

セキュリティ診断完了後、進捗を更新する。

---

## 3段階評価方式

設計書の内容が正しく実装に反映されているかを3段階で評価する。

```
┌─────────────────────────────────────────────────────────────┐
│  Level 1: 設計書の項目レベル                                 │
│  各セクション（DB、Actions、UI等）が実装に反映されているか   │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 2: 設計書ファイルレベル                               │
│  1つの設計書全体として、機能が正しく実装されているか          │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Level 3: 設計書全体レベル                                   │
│  複数の設計書間の連携、システム全体の整合性が取れているか     │
└─────────────────────────────────────────────────────────────┘
```

---

### Level 1: 設計書の項目レベル

各ステップ（DB、バリデーション、Actions、UI）の実装後に評価。

| セクション | 評価観点 |
|-----------|---------|
| DB設計 | テーブル名、カラム名、型、制約が設計通りか |
| バリデーション | 必須、最大長、範囲等の制約が設計通りか |
| Server Actions | 関数名、引数、戻り値、権限が設計通りか |
| UI | コンポーネント名、使用部品、状態管理が設計通りか |

**差分あり**: 設計書を正として実装を自動修正

---

### Level 2: 設計書ファイルレベル

1つの設計書の全項目実装後に評価。

| 評価観点 | 確認内容 |
|---------|---------|
| 機能の実現 | 設計書の「概要」に記載された目的が達成されているか |
| 要件の充足 | 設計書の「要件」チェックリストが全て実装されているか |
| データフロー | DB → Actions → UI のデータの流れが正しいか |
| エラーハンドリング | 設計書の「異常系」が適切に処理されているか |

**差分あり**: 設計書を正として不足箇所を追加実装

---

### Level 3: 設計書全体レベル

全設計書の実装完了後に評価。

| 評価観点 | 確認内容 |
|---------|---------|
| 機能間連携 | 複数機能をまたぐ処理が正しく動作するか |
| 認証・認可 | 権限設計が全体で一貫しているか |
| UI/UX | 画面遷移、操作フローが設計意図通りか |
| 要件カバー率 | traceability-matrix.md の全要件が実装されているか |

**差分あり**: 該当する設計書に戻り、Level 1から再評価

---

### 評価フロー

```
設計書1つの実装
        │
        ▼
┌───────────────┐
│ Level 1 評価   │ ← 各項目ごと
└───────┬───────┘
        │ 全項目OK
        ▼
┌───────────────┐
│ Level 2 評価   │ ← 設計書ファイル全体
└───────┬───────┘
        │ OK
        ▼
    次の設計書へ
        │
        ▼
    全設計書完了
        │
        ▼
┌───────────────┐
│ Level 3 評価   │ ← 設計書全体
└───────┬───────┘
        │ OK
        ▼
    実装フェーズ完了
```

---

## Phase 5: 進捗更新（詳細）

各設計書の実装完了後:

1. 設計書の「実装チェックリスト」を `[x]` に更新
2. `docs/progress/design-docs-list.md` の状態を更新

### 状態の定義

| 状態 | 説明 |
|------|------|
| 未着手 | 設計書未作成 |
| 設計中 | 設計書作成中 |
| 設計完了 | 設計書完成、実装待ち |
| 実装中 | 実装作業中 |
| 実装完了 | 実装・動作確認完了 |

---

## 完了レポート

全設計書の実装完了後:

```
## 実装フェーズ完了レポート

### サマリー
- 実装した設計書: X件
- 作成したファイル: Y件

### 作成ファイル一覧

#### DBスキーマ
- lib/db/schemas/products.ts

#### バリデーション
- lib/validations/product.ts

#### Server Actions
- lib/actions/product.ts

#### コンポーネント（コロケーションパターン）
- app/products/components/ProductForm.tsx
- app/products/components/ProductList.tsx

#### テスト
- lib/validations/product.test.ts
- lib/actions/product.test.ts
- app/products/components/ProductForm.test.tsx

### 次のステップ
- pnpm dev で動作確認
- pnpm test:run でテスト実行
- 必要に応じてE2Eテスト追加
```

---

## 中断・再開

### 進捗管理ファイル

`docs/progress/design-docs-list.md` で設計・実装の両方を管理:

```markdown
| 設計書ID | 設計書名 | ファイル | 状態 | カバー要件 |
|----------|----------|----------|------|-----------|
| DOC-FUN-001 | 認証機能 | features/auth.md | 実装完了 | REQ-FUN-001 |
| DOC-FUN-002 | 商品管理 | features/product.md | 実装中 | REQ-FUN-002 |
| DOC-UI-001 | ログイン画面 | ui/login.md | 設計完了 | REQ-UI-001 |
```

### 状態の流れ

```
未着手 → 設計中 → 設計完了 → 実装中 → 実装完了
```

### 再開時の手順

1. `docs/progress/design-docs-list.md` を確認
2. 状態が「実装中」の設計書があれば、その設計書から再開
3. 「実装中」がなければ、「設計完了」の設計書から順次実装
4. Phase 1 (Explore) で現状を把握してから再開

### 実装開始時の状態更新

設計書の実装を開始する際:
1. `design-docs-list.md` の状態を「実装中」に更新
2. 実装完了後、「実装完了」に更新

---

## エラー時の対処

### 自動修正可能なエラー

| エラー種別 | 内容 | 対処 |
|-----------|------|------|
| ビルドエラー | TypeScript型エラー、import不足 | エラーメッセージを読み、設計書を参照して自動修正 |
| 実行時エラー | Server Actions失敗、認証エラー | ログを確認し、設計書を参照して自動修正 |
| 依存エラー | 他の設計書の実装が先に必要 | 依存先を先に実装してから再開 |

### 中断が必要なエラー

以下のエラーは進捗に記録し、中断してユーザーに報告する。

| エラー種別 | 内容 | 対処 |
|-----------|------|------|
| DBエラー | マイグレーション失敗、制約違反 | 進捗に記録 → 中断 → ユーザーに報告 |
| 設計書不備 | 情報不足で実装できない | 進捗に記録 → 中断 → ユーザーに報告 |

### 中断時の進捗記録

`docs/progress/cycle-status.md` に以下を記録:

```markdown
## ブロッカー

| 発生日時 | 設計書 | エラー種別 | 内容 | 状態 |
|---------|--------|-----------|------|------|
| 2024-01-20 10:30 | DOC-FUN-002 | DBエラー | 外部キー制約違反 | 未解決 |
| 2024-01-20 11:00 | DOC-UI-001 | 設計書不備 | ワイヤーフレームが未記載 | 未解決 |
```

### 中断時の報告フォーマット

```
## 実装中断レポート

### エラー内容
- 設計書: DOC-FUN-002 (features/product.md)
- エラー種別: DBエラー
- 詳細: 外部キー制約違反 - users テーブルが存在しない

### 必要な対応
1. users テーブルを先に作成
2. pnpm db:push を実行
3. 「実装を再開して」で続行

### 現在の進捗
- 完了: DOC-FUN-001
- 中断: DOC-FUN-002 (Step 1: DBスキーマ)
- 未着手: DOC-UI-001, DOC-UI-002
```

---

## 注意事項

- 設計書を常に正とする（差分があれば実装を修正）
- `.claude/skills/guidelines/` を必ず参照して実装
- DBスキーマ変更後は `pnpm db:push` が必要（ユーザー手動）
- 認証・認可は設計書の「権限」に従う
- モバイル最適化を忘れない（タップターゲット、余白）
