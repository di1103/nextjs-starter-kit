import { createAuthClient } from 'better-auth/react';

const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  // ローカル
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  // 本番 (Vercel)
  if (/\.vercel\.app$/.test(window.location.hostname)) {
    return window.location.origin;
  }
  return window.location.origin;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, useSession } = authClient;
