/**
 * 管理者ユーザー作成スクリプト
 *
 * 使い方：
 *   pnpm db:seed:admin              # 開発環境
 *   pnpm db:seed:admin --production # 本番環境
 */

import { db, cleanup, isProduction } from './index';
import { users } from '../../lib/db/schemas';
import { eq } from 'drizzle-orm';

// better-authは直接インポートせず、DB操作のみ行う
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'password123';
  const name = process.env.SEED_ADMIN_NAME || '管理者';

  console.log(`👤 管理者ユーザー作成: ${email}`);

  // better-auth インスタンスを作成
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    emailAndPassword: {
      enabled: true,
    },
  });

  try {
    const ctx = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    // 管理者ロールに設定
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, ctx.user.id));

    console.log(`✅ 管理者ユーザー作成成功: ${ctx.user.email}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log(`⚠️  ユーザーは既に存在します: ${email}`);
      // 既存ユーザーを管理者に更新
      await db.update(users).set({ role: 'admin' }).where(eq(users.email, email));
      console.log(`✅ 管理者ロールに更新しました`);
    } else {
      console.error('❌ ユーザー作成失敗:', error);
      await cleanup();
      process.exit(1);
    }
  }

  await cleanup();
  console.log('');
  console.log(`🎉 完了！ ${isProduction ? '本番' : '開発'}環境に管理者を作成しました`);
  process.exit(0);
}

seedAdmin();
