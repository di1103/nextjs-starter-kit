---
name: implement
description: 設計書に基づいて実装を行うスキル。DBスキーマ、バリデーション、Server Actions、UI、テストを設計書を正として段階的に実装。「実装して」「設計書を実装して」「実装フェーズを開始して」などの指示で起動。
---

# 実装スキル

設計書に基づいて実装を行うスキルです。設計書を正として、差分があれば自動修正します。

---

## 全体フロー

```
Phase 1: 実装準備 (Explore) → Phase 2: 実装計画 (Plan)
    → Phase 3: 段階的実装（Step 1-6）
    → Phase 4: セキュリティ診断
    → Phase 5: 進捗更新 → 次の設計書へ
```

---

## Phase 1: 実装準備 (Explore)

```
Task(subagent_type="Explore")
├── docs/progress/design-docs-list.md から「設計完了」の設計書を抽出
├── references/design-system.md を読み込み
├── references/development.md を読み込み
├── 既存コードのパターンを把握（lib/db/schemas/, lib/actions/）
└── 実装対象の設計書一覧を出力
```

---

## Phase 2: 実装計画 (Plan)

```
Task(subagent_type="Plan")
├── 設計書間の依存関係を分析
├── 実装順序を決定（依存される側から先に）
└── 作成するファイル一覧を確定
```

### 実装順序の基本原則

1. 認証・ユーザー関連
2. マスタデータ（他から参照されるテーブル）
3. トランザクションデータ
4. 関連・中間テーブル
5. UIコンポーネント（親→子）

---

## Phase 3: 段階的実装

### Step 1: DBスキーマ

1. 設計書の「データベース設計」を参照
2. `lib/db/schemas/[name].ts` を作成
3. `lib/db/schemas/index.ts` にエクスポート追加
4. ユーザーに `pnpm db:push` 実行を依頼

### Step 1.5: シードデータ（必要な場合）

| 種別 | 配置 | 実行タイミング |
|------|------|---------------|
| マスタデータ | `scripts/seed/master/` | 本番・開発両方 |
| 開発用データ | `scripts/seed/dev/` | 開発環境のみ |
| 管理者作成 | `scripts/seed/admin.ts` | 初回セットアップ |

`onConflictDoNothing()` で冪等性を担保。

### Step 2: バリデーション

1. 設計書の「バリデーション」を参照
2. `lib/validations/[name].ts` を作成
3. `lib/validations/index.ts` にエクスポート追加

### Step 3: Server Actions

1. 設計書の「API / Server Actions」を参照
2. `lib/actions/[name].ts` を作成
3. 認証・権限チェック（requireAuth/requireAdmin）を実装

### Step 4: UI実装

1. UI設計書と `references/design-system.md` を参照
2. ページ: `app/[route]/page.tsx`
3. コンポーネント: `app/[route]/components/[Name].tsx`（コロケーション）
4. shadcn/ui コンポーネントを使用

### Step 5: テスト作成

1. 設計書の「テスト観点」を参照
2. `references/test-viewpoints.md` で観点の詳細を確認
3. テストファイルを作成:
   - バリデーション: `lib/validations/[name].test.ts`
   - Actions: `lib/actions/[name].test.ts`
4. `pnpm test:run` で実行

### Step 6: 動作確認

1. `pnpm dev` で起動
2. 正常系・異常系を確認
3. 問題があれば該当Stepに戻って修正

コード例 → [references/code-examples.md](references/code-examples.md)

---

## Phase 4: セキュリティ診断

`.claude/skills/security-audit/SKILL.md` に従って診断。
Critical/High は実装完了前に修正。

---

## Phase 5: 進捗更新

1. 設計書の「実装チェックリスト」を `[x]` に更新
2. `design-docs-list.md` の状態を「実装完了」に更新
3. 次の設計書へ

---

## 3段階評価方式

詳細 → [references/evaluation.md](references/evaluation.md)

| Level | 対象 | タイミング |
|-------|------|-----------|
| Level 1 | 各項目（DB/Actions/UI） | 各Step完了後 |
| Level 2 | 設計書ファイル全体 | 1設計書の実装完了後 |
| Level 3 | 設計書全体 | 全設計書の実装完了後 |

**差分あり**: 設計書を正として実装を自動修正

---

## 中断・再開

### 状態の流れ

```
未着手 → 設計中 → 設計完了 → 実装中 → 実装完了
```

### 再開時の手順

1. `design-docs-list.md` を確認
2. 「実装中」があればその設計書から再開
3. なければ「設計完了」から順次実装

---

## エラー時の対処

詳細 → [references/error-handling.md](references/error-handling.md)

| エラー種別 | 対処 |
|-----------|------|
| ビルドエラー | エラーメッセージを読み自動修正 |
| DBエラー | 中断してユーザーに報告 |
| 設計書不備 | 中断してユーザーに報告 |

---

## 注意事項

- 設計書を常に正とする（差分があれば実装を修正）
- DBスキーマ変更後は `pnpm db:push` が必要（ユーザー手動）
- 認証・認可は設計書の「権限」に従う
- モバイル最適化（タップターゲット44px、余白）
