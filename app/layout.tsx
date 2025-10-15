import './globals.css';
import type { Metadata } from 'next';
import AuthHashCatcher from './AuthHashCatcher';

export const metadata: Metadata = {
  title: 'Aligned',
  description: 'Hiring decisions need evidence. Recruiters need trust.',
  icons: {
    icon: '/favicon.ico',
  },
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
          This small component runs on every route.
          It checks if the current URL contains a Supabase #access_token hash.
          If so, it instantly redirects the user to /login (where session setup happens).
        */}
        <AuthHashCatcher />

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}


