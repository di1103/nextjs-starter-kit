"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
