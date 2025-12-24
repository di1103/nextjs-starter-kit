# レガシー移行スキル

既存プロジェクトを解析し、このスターターキットに移行・適合させるスキルです。

---

## 実行タイミング

ユーザーから以下のような指示を受けたとき:
- 「レガシー移行を開始して」
- 「既存プロジェクトを移行して」
- 「legacy_projectを解析して移行して」

---

## 全体フロー

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: 解析 (Analyze)                                     │
│  ├── レガシープロジェクトの構造解析                          │
│  ├── 技術スタック特定                                        │
│  ├── 機能一覧抽出                                            │
│  ├── DB構造解析                                              │
│  └── API/エンドポイント一覧                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: 移行計画 (Plan)                                    │
│  ├── 機能の優先順位決定                                      │
│  ├── 移行対象の選定                                          │
│  ├── 技術マッピング（旧→新）                                 │
│  └── 進捗ファイル生成                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │         移行ループ開始               │
        └─────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: 構築 (Build)                                       │
│  ├── DBスキーマ変換                                          │
│  ├── Server Actions作成                                      │
│  ├── UI変換                                                  │
│  └── テスト作成                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: 比較 (Compare)                                     │
│  ├── 機能の網羅性チェック                                    │
│  ├── 動作の同等性確認                                        │
│  └── 差分レポート生成                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: 評価 (Evaluate)                                    │
│  ├── テスト実行                                              │
│  ├── 動作確認                                                │
│  └── 品質評価                                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────┐
                    │  評価OK？    │
                    └──────┬──────┘
                      NG↓     ↓OK
┌─────────────────────────────────────────────────────────────┐
│  Phase 6: 修正 (Fix)                                         │
│  ├── 差分修正                                                │
│  ├── 不足機能追加                                            │
│  └── Phase 4へ戻る                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 7: 進捗記録 (Record)                                  │
│  ├── 進捗ファイル更新                                        │
│  ├── 完了機能をマーク                                        │
│  └── 次の機能へ（ループ継続）                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
              全機能完了まで Phase 3〜7 を繰り返し
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 8: 完了報告                                           │
│  ├── 移行サマリー                                            │
│  ├── 未移行機能リスト（あれば）                              │
│  └── 次のステップ                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: 解析 (Analyze)

### Step 1: プロジェクト構造の解析

```
Task(subagent_type="Explore")
├── docs/customer/legacy_project/ を探索
├── ディレクトリ構造を把握
├── 主要ファイルを特定
└── 技術スタックを推定
```

### Step 2: 技術スタック特定

以下を確認:

| 項目 | 確認ファイル |
|------|-------------|
| フレームワーク | package.json, requirements.txt, Gemfile等 |
| データベース | 設定ファイル, schema, migrations |
| 認証 | auth関連ファイル |
| UI | コンポーネント, テンプレート |
| API | routes, controllers, endpoints |

### Step 3: 機能一覧抽出

```markdown
## 機能一覧

| ID | 機能名 | 説明 | 優先度 | 移行難易度 |
|----|--------|------|--------|-----------|
| F-001 | ユーザー認証 | ログイン/ログアウト | 高 | 低 |
| F-002 | 商品管理 | CRUD操作 | 高 | 中 |
| F-003 | 注文処理 | カート・決済 | 高 | 高 |
```

### Step 4: DB構造解析

```markdown
## テーブル一覧

| テーブル名 | 説明 | カラム数 | 関連テーブル |
|-----------|------|---------|-------------|
| users | ユーザー | 10 | orders, reviews |
| products | 商品 | 15 | categories, orders |
```

### Step 5: API/エンドポイント一覧

```markdown
## API一覧

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | /api/users | ユーザー一覧 | 要 |
| POST | /api/products | 商品作成 | 要(admin) |
```

### 解析結果の保存

`docs/progress/legacy-analysis.md` に保存

---

## Phase 2: 移行計画 (Plan)

### Step 1: 技術マッピング

レガシー技術をスターターキット技術にマッピング:

| レガシー | スターターキット |
|---------|-----------------|
| Express API | Server Actions |
| Sequelize | Drizzle ORM |
| EJS/Pug | React Server Components |
| JWT | Better Auth |
| MySQL | PostgreSQL (Supabase) |
| REST API | Server Actions + API Routes |

### Step 2: 移行優先順位

```markdown
## 移行順序

1. **認証系** - 他機能の基盤
2. **マスタデータ** - 参照されるデータ
3. **主要機能** - ビジネスロジック
4. **UI** - 見た目・操作性
5. **その他** - オプション機能
```

### Step 3: 進捗ファイル生成

`docs/progress/legacy-migration.md`:

```markdown
# レガシー移行進捗

## サマリー
- 総機能数: XX
- 完了: 0
- 進行中: 0
- 未着手: XX

## 機能別進捗

| ID | 機能名 | 状態 | 解析 | 構築 | 比較 | 評価 | 修正 |
|----|--------|------|------|------|------|------|------|
| F-001 | ユーザー認証 | 未着手 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| F-002 | 商品管理 | 未着手 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
```

---

## Phase 3: 構築 (Build)

### Step 1: 機能選択

進捗ファイルから「未着手」の機能を1つ選択し、「進行中」に更新。

### Step 2: DBスキーマ変換

レガシーのスキーマをDrizzle ORMに変換:

```typescript
// レガシー (Sequelize)
const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
});

// スターターキット (Drizzle)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
});
```

### Step 3: Server Actions作成

レガシーのAPIをServer Actionsに変換:

```typescript
// レガシー (Express)
app.post('/api/products', auth, async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

// スターターキット (Server Actions)
'use server';

export async function createProduct(input: unknown) {
  const session = await requireAuth();
  const validated = productSchema.parse(input);

  const [product] = await db.insert(products)
    .values(validated)
    .returning();

  return { success: true, data: product };
}
```

### Step 4: UI変換

レガシーのUIをReactコンポーネントに変換:

```tsx
// レガシー (EJS)
// <form action="/products" method="POST">
//   <input name="name" />
//   <button type="submit">保存</button>
// </form>

// スターターキット (React)
'use client';

export function ProductForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <form action={(formData) => startTransition(() => createProduct(formData))}>
      <Input name="name" placeholder="商品名" />
      <Button disabled={isPending}>
        {isPending ? '保存中...' : '保存'}
      </Button>
    </form>
  );
}
```

### Step 5: テスト作成

移行した機能のテストを作成（implement.mdに従う）

---

## Phase 4: 比較 (Compare)

### 比較チェックリスト

| 項目 | レガシー | 新実装 | 状態 |
|------|---------|--------|------|
| データ構造 | users(10列) | users(8列) | ⚠️ 差分あり |
| API数 | 5 | 5 | ✅ 一致 |
| 機能 | CRUD | CRUD | ✅ 一致 |
| 認証 | JWT | Better Auth | ✅ 同等 |

### 差分レポート

```markdown
## 差分レポート: F-001 ユーザー認証

### 構造の差分
- レガシー: `password` カラム → 新: `passwordHash` カラム
- レガシー: `createdAt` datetime → 新: `createdAt` timestamp

### 機能の差分
- [追加] Google OAuth対応
- [削除] 独自セッション管理（Better Authに統合）

### 動作の差分
- なし（同等の動作を確認）
```

---

## Phase 5: 評価 (Evaluate)

### 評価基準

| 基準 | 条件 | 重み |
|------|------|------|
| 機能完全性 | 全機能が動作する | 必須 |
| データ整合性 | データが正しく保存・取得できる | 必須 |
| 認証/認可 | 権限チェックが正しく動作する | 必須 |
| UI/UX | 操作が同等以上 | 推奨 |
| パフォーマンス | 応答時間が許容範囲 | 推奨 |

### 評価実行

```bash
# テスト実行
pnpm test:run

# E2Eテスト（該当機能）
pnpm test:e2e --grep "F-001"
```

### 評価結果

| 基準 | 結果 | 備考 |
|------|------|------|
| 機能完全性 | ✅ Pass | |
| データ整合性 | ✅ Pass | |
| 認証/認可 | ✅ Pass | |
| UI/UX | ⚠️ 要確認 | ボタン配置が異なる |
| パフォーマンス | ✅ Pass | |

---

## Phase 6: 修正 (Fix)

評価で問題があった場合、修正を行う。

### 修正ループ

```
問題特定 → 原因分析 → 修正実装 → Phase 4（比較）へ戻る
```

### 修正記録

```markdown
## 修正履歴: F-001

| 修正ID | 問題 | 原因 | 対応 | 状態 |
|--------|------|------|------|------|
| FIX-001 | ボタン配置 | デザイン差異 | UIを調整 | 完了 |
| FIX-002 | バリデーション不足 | 旧仕様漏れ | スキーマ追加 | 完了 |
```

---

## Phase 7: 進捗記録 (Record)

### 進捗ファイル更新

```markdown
| ID | 機能名 | 状態 | 解析 | 構築 | 比較 | 評価 | 修正 |
|----|--------|------|------|------|------|------|------|
| F-001 | ユーザー認証 | ✅ 完了 | ✅ | ✅ | ✅ | ✅ | ✅ |
| F-002 | 商品管理 | 🔄 進行中 | ✅ | 🔄 | ⬜ | ⬜ | ⬜ |
```

### 次の機能へ

1. 現在の機能を「完了」にマーク
2. 次の「未着手」機能を選択
3. Phase 3（構築）へ戻る

---

## Phase 8: 完了報告

### 移行完了レポート

```markdown
## レガシー移行完了レポート

### サマリー
- 移行元: docs/customer/legacy_project/
- 総機能数: XX
- 移行完了: XX
- 移行スキップ: XX（理由付き）

### 移行された機能

| ID | 機能名 | 移行方式 | 備考 |
|----|--------|---------|------|
| F-001 | ユーザー認証 | 再実装 | Better Authに変更 |
| F-002 | 商品管理 | 変換 | ほぼ1:1移行 |

### 移行されなかった機能

| ID | 機能名 | 理由 |
|----|--------|------|
| F-010 | レガシーレポート | 不要と判断 |

### 技術的な変更点

| 項目 | 旧 | 新 |
|------|-----|-----|
| DB | MySQL | PostgreSQL |
| ORM | Sequelize | Drizzle |
| 認証 | JWT | Better Auth |

### データ移行

- [ ] マスタデータ: scripts/seed/から投入
- [ ] トランザクションデータ: 別途移行スクリプト

### 次のステップ
1. 本番データの移行
2. 動作確認
3. 切り替え
```

---

## 進捗ファイルフォーマット

### docs/progress/legacy-analysis.md

```markdown
# レガシープロジェクト解析結果

解析日時: YYYY-MM-DD HH:MM
ソース: docs/customer/legacy_project/

## プロジェクト概要
[プロジェクトの説明]

## 技術スタック
| カテゴリ | 技術 |
|---------|------|
| 言語 | ... |
| フレームワーク | ... |
| DB | ... |

## 機能一覧
[機能テーブル]

## DB構造
[テーブル一覧]

## API一覧
[API一覧]
```

### docs/progress/legacy-migration.md

```markdown
# レガシー移行進捗

最終更新: YYYY-MM-DD HH:MM

## サマリー
- 総機能数: XX
- 完了: XX (XX%)
- 進行中: XX
- 未着手: XX

## 機能別進捗
[進捗テーブル]

## 修正履歴
[修正ログ]
```

---

## 中断・再開

### 再開時の手順

1. `docs/progress/legacy-migration.md` を確認
2. 「進行中」の機能があれば、そのPhaseから再開
3. なければ「未着手」から選択してPhase 3へ

### 中断時の記録

```markdown
## 中断情報

- 中断日時: YYYY-MM-DD HH:MM
- 中断Phase: Phase X
- 機能: F-XXX
- 状態: [状態の説明]
- 再開時の注意: [注意事項]
```

---

## 注意事項

- レガシーコードは読み取り専用（変更しない）
- 移行は機能単位で段階的に実施
- 各機能の移行完了後にテストを実行
- データ移行は別途計画（本スキルではスキーマ移行のみ）
- 不明点はユーザーに確認（AskUserQuestion）
