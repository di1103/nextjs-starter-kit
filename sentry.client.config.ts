import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // パフォーマンス監視のサンプルレート（本番環境では調整推奨）
  tracesSampleRate: 1.0,

  // 開発環境ではデバッグモードを有効化
  debug: process.env.NODE_ENV === "development",

  // リプレイ機能（エラー発生時のセッション再現）
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
