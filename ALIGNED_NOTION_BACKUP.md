# Aligned — MVP Code (Drop A + Basic Pages)

This page is **Notion-ready**. Paste it into Notion to keep a clean backup of your starter code and file tree.
It includes: project tree, each file's purpose, and full source for copy/paste.

---

## What this contains
- **Stable Next.js (Pages Router) + Tailwind**
- **Supabase JS v2** client wired (env-based)
- **Loom-like** base layout + Landing, Login (magic link UI), Dashboard
- Placeholder pages for Submit, History, Settings, and Summary Detail

> Works on Vercel. No experimental features. You just need to set your `.env.local`.

---

## File Tree
```
aligned-app/
├─ package.json
├─ next.config.js
├─ postcss.config.js
├─ tailwind.config.js
├─ styles/
│  └─ globals.css
├─ lib/
│  └─ supabaseClient.ts
├─ components/
│  └─ Layout.tsx
├─ pages/
│  ├─ _app.tsx
│  ├─ _document.tsx
│  ├─ index.tsx           # Page 0 — Landing (“what you’re buying”)
│  ├─ login.tsx           # Page 1 — Magic link auth
│  ├─ dashboard.tsx       # Page 2 — Hub
│  ├─ submit.tsx          # Page 3 — Inputs (placeholder for now)
│  ├─ history.tsx         # Page 5 — History (placeholder)
│  ├─ settings.tsx        # Page 6 — Settings (placeholder)
│  └─ summary/
│     └─ [id].tsx         # Page 4 — Summary detail (placeholder)
```

---

## How to run (copy this into your repo)
1. Create a file named **`.env.local`** in your project root with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```
Get these from **Supabase → Project Settings → API**.

2. Install & run:
```
npm install
npm run dev
```
Open **http://localhost:3000**

> Login will send a magic link email; set your **Site URL** in **Supabase → Auth → URL Configuration** to your local dev (e.g., http://localhost:3000) and production domain later.

---

## Files & Code

### `package.json`
```json
{
  "name": "aligned-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "autoprefixer": "^10.4.19",
    "next": "^14.2.5",
    "postcss": "^8.4.38",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.7"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.14.2",
    "@types/react": "^18.2.79",
    "@types/react-dom": "^18.2.25"
  }
}
```

### `next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};
module.exports = nextConfig;
```

### `postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0B1D26",
        accent: "#2979FF",
        soft: "#F4F6F8"
      }
    },
  },
  plugins: [],
};
```

### `styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global page background and text color */
html, body, #__next {
  height: 100%;
}
body {
  background: #F4F6F8; /* soft gray */
  color: #0B1D26; /* deep navy for text */
}

/* Simple container utility */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.25rem;
}
```

### `lib/supabaseClient.ts`
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // This will show clearly in local dev/console
  // (Don't crash the page render; just warn.)
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
```

### `components/Layout.tsx`
```tsx
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isLanding = router.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {/* Simple text logo for now */}
            <div className="rounded-md bg-navy text-white px-2 py-1 text-sm">Aligned</div>
            <span className="text-sm text-gray-600 hidden sm:block">Built for recruiters. Trusted by hiring managers.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:underline">Home</Link>
            <Link href="/login" className="text-sm hover:underline">Login</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="container py-6 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>© {new Date().getFullYear()} Aligned</div>
          <div className="flex gap-4">
            <a href="mailto:mason@weldrecruiting.co" className="hover:underline">Contact</a>
            <Link href="/login" className="hover:underline">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

### `pages/_app.tsx`
```tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import Layout from '../components/Layout';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
        <title>Aligned</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
```

### `pages/_document.tsx`
```tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### `pages/index.tsx` (Landing / Page 0)
```tsx
import Link from 'next/link';

export default function Landing() {
  return (
    <div className="container">
      <section className="mt-10 mb-12 bg-white rounded-xl shadow p-8">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">On this page you will…</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">See exactly what you’re buying</h1>
        <p className="text-lg text-gray-700">
          Aligned turns job inputs into a <strong>trust-first candidate summary</strong> your hiring managers will actually use.
          No fluff. Clear risks. Instant sharing.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="mailto:mason@weldrecruiting.co" className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold">Join the Waitlist</a>
          <Link href="/login" className="border border-accent text-accent rounded-lg px-4 py-2 text-sm font-semibold">Login</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {[
          { step: '1', title: 'Add your inputs', desc: 'Paste the JD, add recruiter/HM notes, upload a resume, and optional market notes.' },
          { step: '2', title: 'Aligned formats it', desc: 'A standardized, trust-first summary—risks + mitigations, outcomes, quotes.' },
          { step: '3', title: 'Share instantly', desc: 'Send a link your hiring manager can read in minutes. Clear, simple, consistent.' }
        ].map((s) => (
          <div key={s.step} className="bg-white rounded-xl shadow p-6">
            <div className="text-accent font-bold text-sm mb-1">Step {s.step}</div>
            <div className="text-xl font-semibold mb-2">{s.title}</div>
            <p className="text-gray-700">{s.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-semibold mb-3">What you’re buying</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Trust-first format with <em>Known Risks &amp; Mitigations</em> front-and-center.</li>
          <li>Timestamped quote table: <em>What You Shared – What the Candidate Brings</em>.</li>
          <li>Simple share link, easy to read on desktop or phone.</li>
          <li>History to find and re-share past summaries.</li>
          <li>Consistent quality—no guesswork for your hiring managers.</li>
        </ul>
      </section>
    </div>
  );
}
```

### `pages/login.tsx` (Page 1 — Magic link auth UI)
```tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + '/dashboard' : undefined,
        }
      });
      if (error) throw error;
      setMessage('Check your email for the login link.');
    } catch (err: any) {
      setMessage(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow p-8 mt-10">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">On this page you will…</p>
        <h1 className="text-2xl font-bold mb-4">Log in with your email</h1>
        <p className="text-gray-700 mb-6">We use a magic link for passwordless login. Enter your email and check your inbox.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white rounded-lg px-4 py-2 font-semibold"
          >
            {loading ? 'Sending link…' : 'Send magic link'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
```

### `pages/dashboard.tsx` (Page 2)
```tsx
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="container">
      <div className="bg-white rounded-xl shadow p-8 mt-10">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">On this page you will…</p>
        <h1 className="text-2xl font-bold mb-4">Choose your next action</h1>
        <p className="text-gray-700 mb-6">Start a new candidate summary, view your history, or update settings.</p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/submit" className="bg-accent text-white rounded-lg px-4 py-6 text-center font-semibold">New Summary</Link>
          <Link href="/history" className="bg-white border border-accent text-accent rounded-lg px-4 py-6 text-center font-semibold">History</Link>
          <Link href="/settings" className="bg-white border border-accent text-accent rounded-lg px-4 py-6 text-center font-semibold">Settings</Link>
        </div>
      </div>
    </div>
  );
}
```

### `pages/submit.tsx` (Page 3 — placeholder UI)
```tsx
export default function Submit() {
  return (
    <div className="container">
      <div className="bg-white rounded-xl shadow p-8 mt-10">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">On this page you will…</p>
        <h1 className="text-2xl font-bold mb-4">Provide job + candidate inputs</h1>
        <p className="text-gray-700">
          Paste the JD, add recruiter/HM notes, upload a resume, and optional market notes.
          (Form wiring to Supabase will come next.)
        </p>
      </div>
    </div>
  );
}
```

### `pages/history.tsx` (Page 5 — placeholder UI)
```tsx
export default function History() {
  return (
    <div className="container">
      <div className="bg-white rounded-xl shadow p-8 mt-10">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">On this page you will…</p>
        <h1 className="text-2xl font-bold mb-4">See your past summaries</h1>
        <p className="text-gray-700">We will list previous summaries here with search and quick share.</p>
      </div>
    </div>
  );
}
```

### `pages/settings.tsx` (Page 6 — placeholder UI)
```tsx
export default function Settings() {
  return (
    <div className="container">
      <div className="bg-white rounded-xl shadow p-8 mt-10">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">On this page you will…</p>
        <h1 className="text-2xl font-bold mb-4">Update your profile and preferences</h1>
        <p className="text-gray-700">Logo upload, notifications, and billing will appear here.</p>
      </div>
    </div>
  );
}
```

### `pages/summary/[id].tsx` (Page 4 — placeholder UI)
```tsx
import { useRouter } from 'next/router';

export default function SummaryDetail() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="container">
      <div className="bg-white rounded-xl shadow p-8 mt-10">
        <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">On this page you will…</p>
        <h1 className="text-2xl font-bold mb-4">View a candidate summary</h1>
        <p className="text-gray-700">Summary ID: <span className="font-mono">{id as string || '(none)'}</span></p>
        <div className="mt-4 text-gray-700">
          <p><strong>Sections coming next:</strong></p>
          <ul className="list-disc pl-6">
            <li>What You Shared – What the Candidate Brings (timestamped quotes)</li>
            <li>Known Risks &amp; Mitigations</li>
            <li>Outcomes Delivered</li>
            <li>How [Candidate Name] Frames Data for Leadership Decisions</li>
            <li>Resume note + scheduling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## Next steps I’ll walk you through after you paste this into Notion
1. **Safety Backup** in your repo (git branch + tag)
2. **Replace code** in your existing repo with this starter
3. **Add your `.env.local`**
4. **Run locally**, verify Landing + Login UI
5. **Push to Vercel** and test preview
6. Wire **Submit form → Supabase** (tables + RLS) and **History/Detail** pages

Paste this whole page into Notion so you always have the code backed up.
