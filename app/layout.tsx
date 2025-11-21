import "./globals.css";

export const metadata = {
  title: "Aligned",
  description: "Aligned recruiting app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
