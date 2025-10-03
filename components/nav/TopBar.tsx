'use client';
import React from 'react';

type Props = { onToggleSidebar: () => void };

export default function TopBar({ onToggleSidebar }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 h-14">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl border border-slate-200 hover:shadow-sm"
          >
            <div className="w-5 h-0.5 bg-black mb-1" />
            <div className="w-5 h-0.5 bg-black mb-1" />
            <div className="w-5 h-0.5 bg-black" />
          </button>
          <span className="font-semibold tracking-tight">Aligned Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </div>
    </header>
  );
}

