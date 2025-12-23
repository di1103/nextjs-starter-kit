# デザインシステム

このプロジェクトのUIデザイン方針です。

---

## 基本方針

| 要素 | 方針 |
|------|------|
| コンポーネント | shadcn/ui デフォルトを使用 |
| レイアウト | Apple風（広い余白、視覚的階層、滑らかなアニメーション） |
| モバイル | タップしやすい配置、親指ゾーン考慮 |
| デザイン思想 | ミニマムデザイン（必要最小限、装飾を排除） |

---

## ミニマムデザイン原則

### 基本思想

- 必要な要素のみを残し、不要な装飾を排除
- 機能がそのままデザインになる
- 「足す」より「引く」を優先

### 実践ルール

| ルール | 説明 | 例 |
|--------|------|-----|
| 単一目的 | 1画面1目的 | 商品一覧画面は一覧表示のみ |
| 色の制限 | 意味のある色のみ使用 | primary, destructive, muted のみ |
| 装飾の排除 | 影、グラデーション、枠線は最小限 | Card の border のみ |
| 余白で区切る | 線ではなく余白でグループ化 | `space-y-8` でセクション分離 |
| テキストで伝える | アイコンより言葉で明確に | 「削除」ボタン > ゴミ箱アイコンのみ |

### やらないこと

```tsx
// NG: 過剰な装飾
<Card className="shadow-2xl border-2 border-primary bg-gradient-to-r">
  <div className="animate-pulse bg-primary/10 rounded-full">
    <Icon className="text-primary drop-shadow-lg" />
  </div>
</Card>

// OK: シンプル
<Card>
  <div className="space-y-4">
    <p>テキストで内容を伝える</p>
  </div>
</Card>
```

### コンポーネント選択の優先順位

```
1. テキストのみで伝わるか？ → テキスト
2. 構造化が必要か？ → リスト、テーブル
3. グループ化が必要か？ → Card（装飾なし）
4. 強調が必要か？ → フォントサイズ、太字
5. 最後の手段 → 色、アイコン
```

### 削除の判断基準

新しい要素を追加する前に確認:

- [ ] この要素がないと機能しないか？
- [ ] ユーザーの目的達成に必要か？
- [ ] 他の方法で代替できないか？

1つでも「いいえ」があれば、追加しない。

---

## レイアウト原則

### 余白

広めの余白で視覚的な余裕を持たせる:

```tsx
// ページ全体
<div className="p-6 md:p-8 lg:p-12">

// セクション間: 大きな余白
<div className="space-y-8 md:space-y-12">
  <section>...</section>
  <section>...</section>
</div>

// 要素間: 中程度の余白
<div className="space-y-4">
  <h2>タイトル</h2>
  <p>説明</p>
</div>

// 関連要素間: 小さな余白
<div className="space-y-2">
  <Label>ラベル</Label>
  <Input />
</div>
```

### 視覚的階層

情報の重要度を余白とフォントサイズで表現:

```tsx
<div className="space-y-6">
  {/* 主要な見出し */}
  <h1 className="text-2xl font-semibold">ページタイトル</h1>

  {/* セクション */}
  <section className="space-y-4">
    <h2 className="text-lg font-medium">セクションタイトル</h2>
    <p className="text-muted-foreground">説明テキスト</p>

    {/* コンテンツ */}
    <div className="space-y-2">
      ...
    </div>
  </section>
</div>
```

### アニメーション

控えめで滑らかなトランジション:

```tsx
// ホバー時の透明度変化
<Button className="transition-opacity hover:opacity-80">

// スケール変化（カード等）
<Card className="transition-transform hover:scale-[1.02]">

// 色変化
<div className="transition-colors hover:bg-muted">
```

---

## モバイル最適化

### タップターゲット

| 要素 | 最小サイズ |
|------|-----------|
| ボタン | 44px x 44px |
| タップ領域 | 44px x 44px |
| 入力フィールド | 高さ 44px 以上 |

```tsx
// タップしやすいボタン
<Button className="min-h-[44px]">送信</Button>

// リスト項目
<div className="min-h-[44px] flex items-center px-4">
  リスト項目
</div>
```

### 親指ゾーン

重要なアクションは画面下部に配置:

```tsx
// 固定フッター
<footer className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
  <Button className="w-full">保存</Button>
</footer>

// ページコンテンツは下部に余白を確保
<main className="pb-24">
  {/* コンテンツ */}
</main>
```

### 固定ヘッダー

```tsx
<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
  <div className="flex h-14 items-center px-4">
    {/* ヘッダー内容 */}
  </div>
</header>
```

### 入力フォーム

```tsx
// モバイル最適化
<Input
  type="email"
  inputMode="email"
  autoComplete="email"
  className="h-11"
  placeholder="メールアドレス"
/>

<Input
  type="tel"
  inputMode="tel"
  autoComplete="tel"
  className="h-11"
  placeholder="電話番号"
/>
```

### 横スクロール

```tsx
<div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
  {items.map(item => (
    <div key={item.id} className="shrink-0 w-72 snap-start">
      <Card>...</Card>
    </div>
  ))}
</div>
```

---

## UIフレームワーク

### shadcn/ui

- UIコンポーネントは shadcn/ui を使用
- カスタムコンポーネントは最小限に
- 新規コンポーネント追加: `npx shadcn@latest add [component]`

### 使用可能なコンポーネント

```
app/components/ui/
├── accordion.tsx
├── alert-dialog.tsx
├── avatar.tsx
├── button.tsx
├── card.tsx
├── checkbox.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
├── popover.tsx
├── progress.tsx
├── select.tsx
├── separator.tsx
├── switch.tsx
├── table.tsx
├── tabs.tsx
├── textarea.tsx
├── toast.tsx
└── tooltip.tsx
```

---

## Tailwind CSS

### カラー

CSS変数を使用:

```tsx
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="border-border" />
```

| 変数 | 用途 |
|------|------|
| background | ページ背景 |
| foreground | メインテキスト |
| primary | プライマリボタン、リンク |
| secondary | セカンダリ要素 |
| muted | 控えめな背景・テキスト |
| accent | アクセント要素 |
| destructive | 削除・エラー |
| border | ボーダー |

---

## レスポンシブデザイン

### モバイルファースト

```tsx
// モバイル -> デスクトップ
<div className="flex flex-col md:flex-row" />
<div className="w-full md:w-1/2 lg:w-1/3" />
<div className="p-4 md:p-6 lg:p-8" />
```

### ブレークポイント

| プレフィックス | 最小幅 | 対象 |
|--------------|-------|------|
| (なし) | 0px | モバイル |
| sm | 640px | 大きめモバイル |
| md | 768px | タブレット |
| lg | 1024px | デスクトップ |
| xl | 1280px | 大画面 |

---

## コンポーネント設計（コロケーションパターン）

### 配置の判断

| コンポーネント種別 | 配置場所 | 例 |
|-------------------|---------|-----|
| そのルートでのみ使用 | `app/[route]/components/` | ProductCard, AdminStats |
| 複数ルートで共有 | `app/components/` | PageHeader, EmptyState |
| UIプリミティブ | `app/components/ui/` | Button, Input, Card |

### Server Component vs Client Component

| 条件 | 選択 |
|------|------|
| データ取得のみ | Server Component |
| useState/useEffect使用 | Client Component |
| onClick等のイベント | Client Component |
| フォーム入力 | Client Component |
| 静的表示 | Server Component |

```tsx
// Server Component（ルート専用）
// app/users/components/UserList.tsx
export async function UserList() {
  const users = await db.select().from(users);
  return <ul>...</ul>;
}

// Client Component（ルート専用）
// app/users/components/UserForm.tsx
'use client';
export function UserForm() {
  const [name, setName] = useState('');
  return <form>...</form>;
}

// グローバル共通コンポーネント
// app/components/PageHeader.tsx
export function PageHeader({ title }: { title: string }) {
  return <h1 className="text-2xl font-semibold">{title}</h1>;
}
```

---

## 状態表示

### ローディング

```tsx
import { Skeleton } from '@/app/components/ui/skeleton';

export function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
```

### エラー

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ErrorMessage({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
```

### 空状態

```tsx
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p>{message}</p>
    </div>
  );
}
```

---

## 通知

### sonner (toast)

```tsx
'use client';
import { toast } from 'sonner';

toast.success('保存しました');
toast.error('保存に失敗しました');
toast.info('処理中です...');
```

---

## アイコン

### Lucide React

```tsx
import { User, Settings, LogOut } from 'lucide-react';

<User className="h-4 w-4" />  // 小
<User className="h-5 w-5" />  // 中
<User className="h-6 w-6" />  // 大
```

---

## フォーム

### react-hook-form + zod

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@/lib/validations/user';

export function UserForm() {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* フォームフィールド */}
    </form>
  );
}
```

---

## アクセシビリティ

- セマンティックHTML（button, nav, main 等）
- 画像には alt 属性
- フォーム要素には label または aria-label
- キーボード操作対応（Tab, Enter, Escape）
- 十分なコントラスト比
