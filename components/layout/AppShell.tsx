'use client';
import React, { useState, PropsWithChildren } from 'react';

function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-14 px-4 md:px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl border border-slate-200 hover:shadow-sm md:hidden"
          >
            <div className="w-5 h-0.5 bg-black mb-1" />
            <div className="w-5 h-0.5 bg-black mb-1" />
            <div className="w-5 h-0.5 bg-black" />
          </button>
          <div className="size-6 rounded-xl" style={{ background: 'linear-gradient(135deg,#FF6B35,#FF9A35)' }} />
          <span className="font-semibold tracking-tight">Aligned Dashboard</span>
        </div>
        <div className="size-8 rounded-full bg-[var(--slate-200)]" />
      </div>
    </header>
  );
}

export default function AppShell({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      <TopBar onToggleSidebar={() => setOpen(!open)} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 pt-6">
        {/* Sidebar */}
        <aside className={`md:opacity-100 ${open ? 'opacity-100' : 'opacity-0 md:opacity-100'} transition-opacity`}>
          <div className="card p-4 sticky top-20">
            <div className="text-sm font-semibold mb-2">Navigation</div>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="/dashboard" className="hover:underline">Overview</a>
              <a href="/dashboard/summaries" className="hover:underline">Candidate Summaries</a>
              <a href="/dashboard/new" className="hover:underline">New Summary</a>
              <a href="/dashboard/settings" className="hover:underline">Settings</a>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="pb-12">{children}</main>
      </div>
    </div>
  );
}

