# 技術マッピング

レガシー技術をスターターキット技術にマッピングする際の対応表。

---

## Node.js系

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

---

## Python系

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

---

## Ruby系

| レガシー | スターターキット |
|---------|-----------------|
| Rails Controllers | Server Actions |
| ActiveRecord | Drizzle ORM |
| ERB/Haml | React Server Components |
| Devise | Better Auth |

---

## PHP系

| レガシー | スターターキット |
|---------|-----------------|
| Laravel Controllers | Server Actions |
| Eloquent ORM | Drizzle ORM |
| Blade Templates | React Server Components |
| Laravel Auth | Better Auth |
| WordPress | 完全再構築推奨 |

---

## 共通

| レガシー | スターターキット |
|---------|-----------------|
| REST API | Server Actions + API Routes |
| GraphQL | Server Actions |
| MySQL | PostgreSQL (Supabase) |
| SQLite | PostgreSQL (Supabase) |
| Redis (セッション) | Better Auth (DB) |
| S3/ローカルストレージ | Supabase Storage |
