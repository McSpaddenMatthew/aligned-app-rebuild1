'use client';
import { useEffect } from 'react';

export default function AuthHashCatcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    if (hash.includes('access_token=')) {
      const search = window.location.search || '';
      const target = `/login${search}${hash}`;
      window.location.replace(target);
    }
  }, []);
  return null;
}
