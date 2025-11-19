import type { Metadata } from "next";
import "./globals.css";
import { Space_Grotesk } from "next/font/google";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Aligned | Private Equity Hiring Intelligence",
  description:
    "Aligned is the trust layer between recruiters and private equity operating partners. Upload transcripts, resumes, and role intel to produce hiring-manager-ready briefs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={grotesk.className}>{children}</body>
    </html>
  );
}
