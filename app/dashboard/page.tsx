// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not logged in → send back to login
  if (!session) {
    redirect('/login');
  }

  const email = session.user.email ?? 'user';

  return (
    <main style={{ padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Dashboard</h1>
      <p style={{ marginTop: '1rem' }}>Signed in as {email}</p>
      <p style={{ marginTop: '0.5rem' }}>
        (MVP check: if you see this after clicking the magic link, routing is working.)
      </p>
    </main>
  );
}
