/**
 * Seed共通ユーティリティ
 *
 * 使い方：
 *   pnpm db:seed:admin              # 開発環境
 *   pnpm db:seed:admin --production # 本番環境
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../lib/db/schemas';

// --production フラグの確認
export const isProduction = process.argv.includes('--production');

// 環境に応じた.envファイルを読み込む
const envFile = isProduction ? '.env.production' : '.env';

// 環境変数の読み込み確認
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(`❌ DATABASE_URL が設定されていません`);
  console.error(`   ${envFile} ファイルを確認してください`);
  process.exit(1);
}

// 環境表示
console.log(`🌍 環境: ${isProduction ? '本番' : '開発'}`);
console.log(`📁 使用ファイル: ${envFile}`);
console.log('');

// DB接続
const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });

// 終了処理
export async function cleanup() {
  await client.end();
}
