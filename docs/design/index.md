# プロジェクト設計書

## 概要

[プロジェクトの目的・背景を記載]

---

## 機能一覧

| 機能 | 設計書 | 状態 |
|------|--------|------|
| 認証 | [features/auth.md](features/auth.md) | ✅ 実装済み |
| （機能名） | [features/xxx.md](features/xxx.md) | ⬜ 未着手 |

---

## UI一覧

| 画面 | 設計書 | 状態 |
|------|--------|------|
| ログイン | [ui/login.md](ui/login.md) | ✅ 実装済み |
| （画面名） | [ui/xxx.md](ui/xxx.md) | ⬜ 未着手 |

---

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **認証**: better-auth
- **ORM**: Drizzle ORM
- **データベース**: PostgreSQL (Supabase)
- **ストレージ**: Supabase Storage
- **UI**: shadcn/ui + Tailwind CSS 4
- **バリデーション**: Zod

---

## データベース設計

### テーブル一覧

| テーブル | 説明 | スキーマ |
|---------|------|---------|
| users | ユーザー | `lib/db/schemas/auth-schema.ts` |
| sessions | セッション | `lib/db/schemas/auth-schema.ts` |
| accounts | アカウント | `lib/db/schemas/auth-schema.ts` |
| verifications | 検証トークン | `lib/db/schemas/auth-schema.ts` |

---

## 参考資料

- [顧客要件](../customer/requirements/)
- [打ち合わせメモ](../customer/meeting-notes/)
