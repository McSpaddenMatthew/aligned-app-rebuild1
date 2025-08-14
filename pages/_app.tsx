import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import '../styles/globals.css';          // <-- this loads Tailwind
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  );
}
