import { GetServerSideProps } from 'next';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

type Props = {
  userEmail: string | null;
};

export default function Dashboard({ userEmail }: Props) {
  if (!userEmail) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div>
          <h1>You’re not signed in</h1>
          <p>
            Go to <a href="/login">/login</a> to request a magic link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div>
        <h1>Aligned dashboard</h1>
        <p>Signed in as {userEmail}</p>
        <p>(This will become your “My summaries” screen.)</p>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return ctx.req.cookies[name];
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    props: {
      userEmail: user?.email ?? null,
    },
  };
};
