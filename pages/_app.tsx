import type { AppProps } from "next/app";
import NavBar from "../components/NavBar";
import "../styles/globals.css"; // keep/remove if you have it

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NavBar />
      <Component {...pageProps} />
    </>
  );
}
