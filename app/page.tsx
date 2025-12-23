import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { Login } from './components/Login';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return <Login />;
  }

  // ユーザー情報を取得
  const [user] = await db
    .select({ name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ようこそ、{user?.name}さん</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-sm text-gray-500">ロール: {user?.role}</p>
          <form action="/api/auth/sign-out" method="POST">
            <Button type="submit" variant="outline" className="w-full">
              ログアウト
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
