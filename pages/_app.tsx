import type { AppProps } from "next/app";
// If you don't have this file, delete the import line.

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
