'use client';

import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface AdminShellProps {
  title: string;
  children: React.ReactNode;
}

export function AdminShell({ title, children }: AdminShellProps) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--admin-content-bg)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col mr-64">
        <Topbar title={title} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
