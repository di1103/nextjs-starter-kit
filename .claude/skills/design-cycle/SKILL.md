---
name: design-cycle
description: 要件定義駆動開発を実行するスキル。顧客情報から設計書作成、実装、テスト、セキュリティ診断、デプロイまで一気通貫で実行。「要件定義駆動開発を開始して」「全設計書を作成して」「設計を完走して」などの指示で起動。
---

# 要件定義駆動開発スキル

顧客要件から**設計→実装→テスト→デプロイまで一気に実行**するスキルです。

---

## 全体フロー

```
Phase 0: Supabase作成（スキップ可）
    → Phase 1: 顧客情報探索 → Phase 2: 設計計画
    → Phase 3: 設計書一括作成 → Phase 4: 設計完了検証
    → Phase 5: 実装 → Phase 6: テスト実行
    → Phase 7: セキュリティ診断 → Phase 8: 完了報告
    → Phase 9: Vercelデプロイ（スキップ可）
```

---

## Phase 0: Supabaseプロジェクト作成

詳細手順 → [references/supabase-setup.md](references/supabase-setup.md)

**スキップ条件**: `.env` に `DATABASE_URL` が既に設定済み

---

## Phase 1: 顧客情報探索

```
Task(subagent_type="Explore")
├── docs/customer/requirements/ の全ファイルを探索
├── docs/customer/meeting-notes/ の全ファイルを探索
└── 要件・決定事項・制約を抽出
```

**出力**: 顧客情報の要約リスト

---

## Phase 2: 設計計画

```
Task(subagent_type="Plan")
├── 要件をID採番（REQ-XXX-NNN形式）
├── 設計書一覧を決定（DOC-XXX-NNN形式）
└── 作成順序を決定（依存関係考慮）
```

**生成ファイル**: `docs/progress/` 配下
- requirements-list.md
- design-docs-list.md
- traceability-matrix.md
- cycle-status.md

フォーマット → [references/progress-formats.md](references/progress-formats.md)

---

## Phase 3: 設計書一括作成

design-docs-list.md に記載された全設計書を順に作成:

1. 機能設計書: `docs/design/features/xxx.md`
2. UI設計書: `docs/design/ui/xxx.md`
3. `docs/design/index.md` に追加
4. 進捗ファイルを更新

---

## Phase 4: 設計完了検証

| 条件 | 基準 |
|------|------|
| 要件カバー率 | 100% |
| 設計書完了率 | 100% |
| トレーサビリティ | 孤児なし |

設計完了レポートを出力。

---

## Phase 5: 実装

`.claude/skills/implement/SKILL.md` に従って全設計書を実装。

```
各設計書に対して:
├── Step 1: DBスキーマ作成
├── Step 2: バリデーション作成
├── Step 3: Server Actions作成
├── Step 4: UI実装
├── Step 5: テスト作成
└── Step 6: 動作確認
```

**DBスキーマ変更時**: ユーザーに `pnpm db:push` 実行を依頼

---

## Phase 6: テスト実行

```bash
pnpm test:run
```

失敗があれば修正して再実行。全パスするまで繰り返し。

---

## Phase 7: セキュリティ診断

`.claude/skills/security-audit/SKILL.md` に従って診断。

- Critical/High 項目を自動修正
- 修正後、Phase 6 に戻って再確認
- 診断レポートを `docs/progress/security-audit/` に保存

---

## Phase 8: 完了報告

```markdown
## 要件定義駆動開発 完了レポート

### サマリー
- 要件数: XX件
- 設計書数: XX件
- 実装ファイル数: XX件
- テスト: 全パス ✅
- セキュリティ: Critical/High 0件 ✅

### 作成されたファイル
[ファイル一覧]

→ Phase 9: Vercelデプロイに進みます
```

---

## Phase 9: Vercelデプロイ

詳細手順 → [references/vercel-deploy.md](references/vercel-deploy.md)

**スキップ条件**: ユーザーが「デプロイは後で」と回答

---

## 注意事項

### Claude Code用の最適化
1. **1ファイル = 1機能**: 設計書は機能ごとに分割
2. **具体的なファイルパス**: 実装先を明記
3. **型定義を含める**: TypeScriptスキーマを記載
4. **チェックリスト形式**: 実装完了を追跡可能に

### 依存関係の明示
- 他の機能への依存を設計書に記載
- 実装順序の推奨を含める
