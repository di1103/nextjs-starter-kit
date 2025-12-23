# テストガイドライン

このプロジェクトのテスト方針です。

---

## テストツール

| ツール | 用途 | コマンド |
|--------|------|---------|
| Vitest | Unit/Integration | `pnpm test` |
| Testing Library | コンポーネントテスト | Vitestと併用 |
| Playwright | E2E | `pnpm test:e2e` |

---

## テストファイル配置

```
lib/
├── validations/
│   ├── product.ts
│   └── product.test.ts       # 同階層に配置
├── actions/
│   ├── product.ts
│   └── product.test.ts
app/
├── products/
│   ├── components/
│   │   ├── ProductForm.tsx
│   │   └── ProductForm.test.tsx
e2e/
├── auth.spec.ts              # 認証フロー
├── products.spec.ts          # 商品管理フロー
└── example.spec.ts           # サンプル
```

---

## テストの優先順位

### 必須テスト（実装時に書く）

| 対象 | 理由 |
|------|------|
| バリデーション | 入力値の境界を保証 |
| Server Actions | ビジネスロジックの正確性 |
| 認証フロー（E2E） | セキュリティの担保 |

### 推奨テスト

| 対象 | 理由 |
|------|------|
| フォームコンポーネント | ユーザー操作の確認 |
| 主要画面（E2E） | 回帰テスト |

### 任意テスト

| 対象 | 理由 |
|------|------|
| 表示のみのコンポーネント | 変更が少ない |
| ユーティリティ関数 | シンプルなら不要 |

---

## Unit テスト（Vitest）

### バリデーションテスト

```typescript
// lib/validations/product.test.ts
import { describe, it, expect } from 'vitest';
import { productSchema } from './product';

describe('productSchema', () => {
  it('正常な入力を受け付ける', () => {
    const input = { name: '商品A', price: 1000 };
    const result = productSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('名前が空の場合エラー', () => {
    const input = { name: '', price: 1000 };
    const result = productSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('価格が負の場合エラー', () => {
    const input = { name: '商品A', price: -100 };
    const result = productSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('価格の境界値: 0は許可', () => {
    const input = { name: '商品A', price: 0 };
    const result = productSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
```

### Server Actionsテスト

```typescript
// lib/actions/product.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct } from './product';

// モック
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: '1', name: '商品A', price: 1000 }]),
  },
}));

vi.mock('@/lib/actions/auth-helpers', () => ({
  requireAuth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}));

describe('createProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常に商品を作成できる', async () => {
    const input = { name: '商品A', price: 1000 };
    const result = await createProduct(input);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('バリデーションエラーで失敗', async () => {
    const input = { name: '', price: 1000 };

    await expect(createProduct(input)).rejects.toThrow();
  });
});
```

---

## コンポーネントテスト（Testing Library）

```tsx
// app/products/components/ProductForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from './ProductForm';

describe('ProductForm', () => {
  it('フォームが表示される', () => {
    render(<ProductForm />);

    expect(screen.getByPlaceholderText('商品名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('価格')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });

  it('入力して送信できる', async () => {
    const user = userEvent.setup();
    render(<ProductForm />);

    await user.type(screen.getByPlaceholderText('商品名'), '商品A');
    await user.type(screen.getByPlaceholderText('価格'), '1000');
    await user.click(screen.getByRole('button', { name: '保存' }));

    // 送信中の状態を確認
    expect(screen.getByRole('button', { name: '保存中...' })).toBeDisabled();
  });

  it('ボタンのタップターゲットが44px以上', () => {
    render(<ProductForm />);

    const button = screen.getByRole('button', { name: '保存' });
    const styles = window.getComputedStyle(button);

    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44);
  });
});
```

---

## E2Eテスト（Playwright）

### 認証フローテスト

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /ログイン/ })).toBeVisible();
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
  });

  test('未認証で保護ページにアクセスするとリダイレクト', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/login/);
  });

  test('ログイン成功後リダイレクト', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('メールアドレス').fill('test@example.com');
    await page.getByPlaceholder('パスワード').fill('password123');
    await page.getByRole('button', { name: /ログイン/ }).click();

    await expect(page).toHaveURL('/dashboard');
  });
});
```

### モバイルUIテスト

```typescript
// e2e/mobile.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 14']);

test.describe('モバイルUI', () => {
  test('タップターゲットが44px以上', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('入力フィールドが適切なサイズ', async ({ page }) => {
    await page.goto('/login');

    const inputs = page.locator('input');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const box = await inputs.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
```

---

## テスト実行コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm test` | Vitest（ウォッチモード） |
| `pnpm test:run` | Vitest（単発実行） |
| `pnpm test:coverage` | カバレッジ付き |
| `pnpm test:e2e` | Playwright |
| `pnpm test:e2e:ui` | Playwright UI モード |

---

## テスト命名規則

### describe

```typescript
describe('対象の名前', () => {
  // productSchema, createProduct, ProductForm など
});
```

### it / test

```typescript
it('期待する動作を日本語で', () => {
  // 「正常な入力を受け付ける」
  // 「名前が空の場合エラー」
  // 「ログイン成功後リダイレクト」
});
```

---

## テスト観点チェックリスト

### バリデーション

- [ ] 正常な入力
- [ ] 必須項目が空
- [ ] 最大長超過
- [ ] 型が不正（文字列に数値など）
- [ ] 境界値（0, 最大値, 最小値）

### Server Actions

- [ ] 正常系
- [ ] 認証エラー（未ログイン）
- [ ] 権限エラー（権限不足）
- [ ] バリデーションエラー
- [ ] DBエラー（モック）

### コンポーネント

- [ ] 初期表示
- [ ] ユーザー操作（入力、クリック）
- [ ] ローディング状態
- [ ] エラー表示
- [ ] アクセシビリティ（ラベル、ボタン名）

### E2E

- [ ] 主要なユーザーフロー
- [ ] 認証が必要なページのガード
- [ ] モバイルでの操作性
- [ ] エラー時のフィードバック

---

## CI連携

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:run

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e
```
