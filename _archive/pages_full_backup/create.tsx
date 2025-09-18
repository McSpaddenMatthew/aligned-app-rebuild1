// pages/create.tsx
import { useEffect } from "react";
import type { GetServerSideProps } from "next";

/** Client safety: if this renders on the client, hop to /summary/new */
export default function CreateRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") window.location.replace("/summary/new");
  }, []);
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Opening new summary…</h1>
      <p>You should be redirected shortly.</p>
    </main>
  );
}

/** Force SSR redirect so Next never tries to pre-render this page. */
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/summary/new", permanent: false },
});
