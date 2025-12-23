import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Sentry組織とプロジェクトの設定
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // ソースマップのアップロード（本番ビルド時のみ）
  silent: !process.env.CI,

  // パフォーマンス最適化
  widenClientFileUpload: true,
  disableLogger: true,

  // React Component名を保持（エラートレースの可読性向上）
  reactComponentAnnotation: {
    enabled: true,
  },

  // ツリーシェイキングでバンドルサイズ削減
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },
});
