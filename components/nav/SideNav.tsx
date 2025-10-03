'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/summaries', label: 'Candidate Summaries' },
  { href: '/dashboard/new', label: 'New Summary' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function SideNav({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex fixed top-14 left-0 h-[calc(100vh-56px)]
      border-r border-slate-200 bg-white transition-all duration-200 ease-out
      ${isOpen ? 'w-64' : 'w-20'}`}
    >
      <nav className="w-full p-3">
        {nav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 mb-1
                hover:bg-slate-100 transition
                ${active ? 'bg-slate-100 font-medium' : ''}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className={`${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
