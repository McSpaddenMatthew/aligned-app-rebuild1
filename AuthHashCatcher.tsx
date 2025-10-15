'use client';
import { useEffect } from 'react';

export default function AuthHashCatcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash || '';
    if (hash.includes('access_token=')) {
      // Preserve any ?query or hash parameters
      const search = window.location.search || '';
      const target = `/login${search}${hash}`;
      // Use replace so the back button doesn’t return to the hash page
      window.location.replace(target);
    }
  }, []);

  return null;
}
