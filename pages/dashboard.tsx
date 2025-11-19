import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

type DashboardProps = {
  user: User;
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async (ctx) => {
  const supabase = createPagesServerClient(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Not logged in → bounce back to login
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const user = session.user;

  // OPTIONAL: load a profile row if you have a "profiles" table
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('*')
  //   .eq('id', user.id)
  //   .single();

  return {
    props: {
      user,
    },
  };
};

export default function DashboardPage({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '3rem 1.5rem',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: '#f3f4f6',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: '2.5rem',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
        }}
      >
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Welcome to your Aligned dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>
            Signed in as <strong>{user.email}</strong>
          </p>
        </header>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Your summaries</h2>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            This is where you’ll see candidate summaries tied to your account. Next step is wiring
            up a “Create summary” flow and listing them here.
          </p>
          <div
            style={{
              borderRadius: 12,
              border: '1px dashed #d1d5db',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            No summaries yet. Once you create your first candidate summary, it will appear here.
          </div>
        </section>

        <footer style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#9ca3af', fontSize: 14 }}>
            Evidence for every executive hire.
          </span>
          <form method="post" action="/api/logout">
            {/* You can later replace this with a proper logout route/button */}
            <button
              type="submit"
              style={{
                borderRadius: 9999,
                border: '1px solid #d1d5db',
                padding: '0.4rem 0.9rem',
                fontSize: 14,
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              Log out
            </button>
          </form>
        </footer>
      </div>
    </main>
  );
}
