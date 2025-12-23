'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

/**
 * セッション認証を要求するヘルパー
 * 認証されていない場合はエラーをスロー
 */
export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  return session;
}

/**
 * 管理者権限を要求するヘルパー
 * 管理者でない場合はエラーをスロー
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, session.user.id));
  if (user?.role !== 'admin') throw new Error('Forbidden');
  return session;
}

/**
 * 現在のユーザー情報を取得
 */
export async function getCurrentUser() {
  const session = await requireAuth();
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  return user;
}
