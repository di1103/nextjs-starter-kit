# コード変換例

レガシーコードをスターターキット形式に変換する際の例。

---

## DBスキーマ変換

### Sequelize → Drizzle

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

### Prisma → Drizzle

```typescript
// レガシー (Prisma)
model Product {
  id        String   @id @default(cuid())
  name      String
  price     Int
  createdAt DateTime @default(now())
}

// スターターキット (Drizzle)
export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## API → Server Actions変換

### Express → Server Actions

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

### Django → Server Actions

```python
# レガシー (Django)
@login_required
def create_product(request):
    form = ProductForm(request.POST)
    if form.is_valid():
        product = form.save()
        return JsonResponse({'id': product.id})
```

```typescript
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

---

## UI変換

### EJS → React

```html
<!-- レガシー (EJS) -->
<form action="/products" method="POST">
  <input name="name" />
  <button type="submit">保存</button>
</form>
```

```tsx
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

---

## 認証変換

### JWT → Better Auth

```typescript
// レガシー (JWT)
const token = jwt.sign({ userId: user.id }, SECRET);
res.cookie('token', token);

// スターターキット (Better Auth)
// Better Authが自動で処理
// セッション取得は以下で可能
const session = await auth.api.getSession({ headers });
```

### Passport → Better Auth

```typescript
// レガシー (Passport)
passport.authenticate('local', (err, user) => {
  req.login(user, () => res.redirect('/dashboard'));
});

// スターターキット (Better Auth)
const result = await authClient.signIn.email({
  email,
  password,
});
if (result.data) {
  redirect('/dashboard');
}
```
