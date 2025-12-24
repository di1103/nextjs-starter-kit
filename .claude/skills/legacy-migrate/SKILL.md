---
name: legacy-migrate
description: 既存プロジェクトを解析し、このスターターキットに移行・適合させるスキル。解析→構築→比較→評価→修正→記録のループで段階的に移行。「レガシー移行を開始して」「既存プロジェクトを移行して」などの指示で起動。
---

# レガシー移行スキル

既存プロジェクトを解析し、このスターターキットに移行・適合させるスキルです。

---

## 全体フロー

```
Phase 1: 解析 → Phase 2: 移行計画
    → [ループ開始]
    → Phase 3: 構築 → Phase 4: 比較 → Phase 5: 評価
    → Phase 5.5: セキュリティ診断
    → (NG) Phase 6: 修正 → Phase 4へ戻る
    → (OK) Phase 7: 進捗記録 → 次の機能へ
    → [全機能完了]
    → Phase 8: 完了報告 → Phase 9: データ移行
```

---

## Phase 1: 解析 (Analyze)

```
Task(subagent_type="Explore")
├── docs/customer/legacy_project/ を探索
├── 技術スタック特定（package.json, requirements.txt等）
├── 機能一覧・DB構造・API一覧を抽出
└── docs/progress/legacy-analysis.md に保存
```

**出力**: 機能一覧テーブル

| ID | 機能名 | 説明 | 優先度 | 移行難易度 |
|----|--------|------|--------|-----------|
| F-001 | ユーザー認証 | ログイン/ログアウト | 高 | 低 |

---

## Phase 2: 移行計画 (Plan)

1. 技術マッピング → [references/tech-mapping.md](references/tech-mapping.md)
2. 移行優先順位を決定（認証→マスタ→主要機能→UI）
3. `docs/progress/legacy-migration.md` を生成

---

## Phase 3: 構築 (Build)

進捗ファイルから「未着手」機能を1つ選択し実装:

1. DBスキーマ変換 → Drizzle形式に
2. Server Actions作成 → 認証・バリデーション付き
3. UI変換 → React + shadcn/ui
4. テスト作成

変換例 → [references/conversion-examples.md](references/conversion-examples.md)

---

## Phase 4: 比較 (Compare)

| 項目 | レガシー | 新実装 | 状態 |
|------|---------|--------|------|
| データ構造 | users(10列) | users(8列) | ⚠️ 差分あり |
| API数 | 5 | 5 | ✅ 一致 |
| 機能 | CRUD | CRUD | ✅ 一致 |

差分があれば差分レポートを生成。

---

## Phase 5: 評価 (Evaluate)

| 基準 | 条件 | 重み |
|------|------|------|
| 機能完全性 | 全機能が動作する | 必須 |
| データ整合性 | データが正しく保存・取得できる | 必須 |
| 認証/認可 | 権限チェックが正しく動作する | 必須 |

```bash
pnpm test:run
pnpm build
pnpm tsc --noEmit
```

---

## Phase 5.5: セキュリティ診断

`.claude/skills/security-audit/SKILL.md` に従って診断。
Critical/High は Phase 6 で即時修正。

---

## Phase 6: 修正 (Fix)

評価NGの場合:
```
問題特定 → 原因分析 → 修正実装 → Phase 4へ戻る
```

---

## Phase 7: 進捗記録 (Record)

1. 進捗ファイルを更新（機能を「完了」に）
2. 次の「未着手」機能を選択
3. Phase 3 へ戻る

---

## Phase 8: 完了報告

全機能完了後、完了レポートを出力。
フォーマット → [references/progress-formats.md](references/progress-formats.md)

---

## Phase 9: データ移行

スキーマ移行完了後、本番データを移行。
詳細手順 → [references/data-migration.md](references/data-migration.md)

---

## 中断・再開

### 再開時の手順
1. `docs/progress/legacy-migration.md` を確認
2. 「進行中」の機能があれば、そのPhaseから再開
3. なければ「未着手」から選択してPhase 3へ

---

## エラーハンドリング

| Phase | エラー種別 | 対処 |
|-------|-----------|------|
| 解析 | ファイル読めない | ユーザーにパス確認依頼 |
| 解析 | 技術スタック不明 | ユーザーに技術情報を質問 |
| 構築 | 変換不可能な構文 | 手動変換が必要と記録、スキップ |
| 評価 | テスト失敗 | Phase 6（修正）へ移行 |

---

## 注意事項

- レガシーコードは読み取り専用（変更しない）
- 移行は機能単位で段階的に実施
- 各機能の移行完了後にテストを実行
- 不明点はユーザーに確認（AskUserQuestion）
