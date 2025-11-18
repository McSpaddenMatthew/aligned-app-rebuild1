import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Aligned | Evidence-first hiring reports",
  description: "Aligned turns messy hiring inputs into decision-ready reports for managers.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-white">
      <body className={`${inter.className} bg-white text-primaryBlack`}>{children}</body>
    </html>
  );
}
