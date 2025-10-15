import './globals.css';
import type { Metadata } from 'next';
import AuthHashCatcher from './AuthHashCatcher';

export const metadata: Metadata = {
  title: 'Aligned',
  description: 'Hiring decisions need evidence. Recruiters need trust.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {/* 
          Runs on every route. If the URL contains a Supabase #access_token hash,
          it forwards to /login where the session is set.
        */}
        <AuthHashCatcher />

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}


