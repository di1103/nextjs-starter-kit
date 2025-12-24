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
│  └── 品質評価（定量基準）                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 5.5: セキュリティ診断                                 │
│  ├── security-audit.md に従って診断                         │
│  ├── Critical/High は即時修正                               │
│  └── 診断レポート生成                                        │
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
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 9: データ移行                                         │
│  ├── マスタデータ: scripts/seed/で投入                      │
│  ├── ユーザー/トランザクション: 移行スクリプト               │
│  ├── データ件数検証                                          │
│  └── パスワードリセット対応                                  │
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

#### Node.js系

| レガシー | スターターキット |
|---------|-----------------|
| Express API | Server Actions |
| Sequelize | Drizzle ORM |
| Prisma | Drizzle ORM |
| EJS/Pug | React Server Components |
| JWT (jsonwebtoken) | Better Auth |
| Passport.js | Better Auth |
| MySQL (mysql2) | PostgreSQL (Supabase) |
| MongoDB (mongoose) | PostgreSQL (Supabase) |

#### Python系

| レガシー | スターターキット |
|---------|-----------------|
| Django Views | Server Actions |
| Flask Routes | Server Actions |
| FastAPI | Server Actions + API Routes |
| Django ORM | Drizzle ORM |
| SQLAlchemy | Drizzle ORM |
| Django Templates | React Server Components |
| Jinja2 | React Server Components |
| Django Auth | Better Auth |

#### Ruby系

| レガシー | スターターキット |
|---------|-----------------|
| Rails Controllers | Server Actions |
| ActiveRecord | Drizzle ORM |
| ERB/Haml | React Server Components |
| Devise | Better Auth |

#### PHP系

| レガシー | スターターキット |
|---------|-----------------|
| Laravel Controllers | Server Actions |
| Eloquent ORM | Drizzle ORM |
| Blade Templates | React Server Components |
| Laravel Auth | Better Auth |
| WordPress | 完全再構築推奨 |

#### 共通

| レガシー | スターターキット |
|---------|-----------------|
| REST API | Server Actions + API Routes |
| GraphQL | Server Actions |
| MySQL | PostgreSQL (Supabase) |
| SQLite | PostgreSQL (Supabase) |
| Redis (セッション) | Better Auth (DB) |
| S3/ローカルストレージ | Supabase Storage |

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

### 定量的評価基準

| 指標 | 基準値 | 測定方法 |
|------|--------|---------|
| テストカバレッジ | ≥80% | `pnpm test:coverage` |
| ビルド成功 | 100% | `pnpm build` |
| 型エラー | 0件 | `pnpm tsc --noEmit` |
| Lintエラー | 0件 | `pnpm lint` |

---

## Phase 5.5: セキュリティ診断

移行したコードに対して `.claude/skills/security-audit.md` を実行。

### 診断対象

今回移行した機能に関連するファイル:
- `lib/actions/[機能名].ts`
- `lib/db/schemas/[機能名].ts`
- `app/[機能]/components/*.tsx`

### 診断項目

| カテゴリ | 確認内容 |
|---------|---------|
| AUTH | 認証チェック漏れがないか |
| INPUT | Zodバリデーションが適用されているか |
| LEAK | パスワード等の機密情報が露出していないか |
| INJ | SQLインジェクション対策されているか |

### 診断結果の対応

| 重大度 | 対応 |
|--------|------|
| Critical | Phase 6で即時修正（ブロッカー） |
| High | Phase 6で修正 |
| Medium | 記録して後日対応 |
| Low | 任意 |

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
→ Phase 9: データ移行に進みます
```

---

## Phase 9: データ移行

スキーマ移行完了後、本番データを移行します。

### Step 1: データ分類

| 種別 | 例 | 移行方法 |
|------|-----|---------|
| マスタデータ | カテゴリ、設定 | scripts/seed/で再作成 |
| ユーザーデータ | ユーザー、プロフィール | 移行スクリプトで変換 |
| トランザクション | 注文、履歴 | 移行スクリプトで変換 |
| 添付ファイル | 画像、ドキュメント | ストレージ移行 |

### Step 2: 移行スクリプト作成

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

### Step 3: 移行実行

```bash
# 開発環境でテスト
pnpm migrate:data --env=development

# 本番環境で実行
pnpm migrate:data --env=production
```

### Step 4: データ検証

```markdown
## データ検証チェックリスト

| テーブル | レガシー件数 | 新DB件数 | 差分 | 状態 |
|---------|------------|---------|------|------|
| users | 1,000 | 1,000 | 0 | ✅ |
| products | 500 | 500 | 0 | ✅ |
| orders | 2,000 | 1,998 | 2 | ⚠️ 要確認 |
```

### Step 5: パスワードリセット対応

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

### 完了条件

- [ ] マスタデータ移行完了
- [ ] ユーザーデータ移行完了
- [ ] トランザクションデータ移行完了
- [ ] データ件数検証OK
- [ ] サンプルデータの動作確認OK

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

## エラーハンドリング

### Phase別エラー対処

| Phase | エラー種別 | 対処 |
|-------|-----------|------|
| 解析 | ファイル読めない | ユーザーにパス確認依頼 |
| 解析 | 技術スタック不明 | ユーザーに技術情報を質問 |
| 構築 | 変換不可能な構文 | 手動変換が必要と記録、スキップ |
| 構築 | DBスキーマ変換失敗 | 差分を記録し、ユーザーに確認 |
| 比較 | 機能差分検出 | 差分レポートを生成し継続 |
| 評価 | テスト失敗 | Phase 6（修正）へ移行 |
| 評価 | ビルドエラー | エラー修正後に再評価 |

### 自動リカバリー

```
エラー検出 → 原因分析 → 自動修正可能？
    ↓                         ↓
   Yes                       No
    ↓                         ↓
  自動修正            ユーザーに報告・確認
    ↓                         ↓
  再実行              指示を受けて再開
```

### ブロッカー記録

解決できないエラーは進捗ファイルに記録:

```markdown
## ブロッカー

| ID | Phase | 機能 | エラー内容 | 状態 |
|----|-------|------|-----------|------|
| B-001 | 構築 | F-003 | 決済API変換不可 | 未解決 |
```

---

## 注意事項

- レガシーコードは読み取り専用（変更しない）
- 移行は機能単位で段階的に実施
- 各機能の移行完了後にテストを実行
- 不明点はユーザーに確認（AskUserQuestion）
