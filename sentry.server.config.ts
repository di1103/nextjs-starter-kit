import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // パフォーマンス監視のサンプルレート
  tracesSampleRate: 1.0,

  // 開発環境ではデバッグモードを有効化
  debug: process.env.NODE_ENV === "development",
});
