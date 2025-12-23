import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('better-auth.session_token');
  const { pathname } = request.nextUrl;

  // 公開パス（認証不要）
  const publicPaths = ['/api/auth', '/login'];

  // 公開パスはスキップ
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 保護されたAPIパス
  const protectedApiPaths = ['/api'];
  if (protectedApiPaths.some((path) => pathname.startsWith(path)) && !sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
