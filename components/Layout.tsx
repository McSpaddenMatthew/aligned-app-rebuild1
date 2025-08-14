// components/Layout.tsx
import type { PropsWithChildren } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}


