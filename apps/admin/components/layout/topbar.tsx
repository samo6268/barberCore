'use client';

import { Bell, Search } from 'lucide-react';

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b sticky top-0 z-30"
      style={{ background: 'var(--admin-card-bg)', borderColor: 'var(--admin-border)' }}
    >
      <h1 className="font-semibold text-base" style={{ color: 'var(--admin-text)' }}>{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ background: 'var(--bg-ivory)', border: '1px solid var(--admin-border)', color: 'var(--admin-muted)' }}
        >
          <Search size={14} strokeWidth={1.5} />
          <span>جستجو...</span>
          <span className="mr-4 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--ui-gray-100)' }}>⌘K</span>
        </div>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--admin-muted)' }}
        >
          <Bell size={18} strokeWidth={1.5} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--brand-plum-600)' }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer"
          style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}
        >
          A
        </div>
      </div>
    </header>
  );
}
