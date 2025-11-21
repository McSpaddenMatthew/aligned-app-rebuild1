import type { GetServerSideProps } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);

  // Supabase sends ?code=... to this page after the magic link is clicked
  const code = ctx.query.code as string | undefined;

  if (!code) {
    // No code = something went wrong with the magic link
    return {
      redirect: {
        destination: '/login?error=missing_code',
        permanent: false,
      },
    };
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error exchanging code for session:', error.message);
    return {
      redirect: {
        destination: '/login?error=callback_failed',
        permanent: false,
      },
    };
  }

  // We now have a valid Supabase session attached to cookies.
  // Send the user to their dashboard.
  return {
    redirect: {
      destination: '/dashboard',
      permanent: false,
    },
  };
};

export default function AuthCallbackPage() {
  // Users should almost never actually see this; it's mostly SSR.
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Signing you in…</h1>
        <p style={{ color: '#6b7280' }}>Please wait a moment while we complete your login.</p>
      </div>
    </main>
  );
}
