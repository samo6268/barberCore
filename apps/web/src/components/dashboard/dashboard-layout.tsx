'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Scissors, Users, Settings, BarChart3, ArrowRight } from 'lucide-react';

const TABS = [
  { key: 'bookings',  label: 'رزروها',    icon: <Calendar className="w-4 h-4" /> },
  { key: 'services',  label: 'خدمات',     icon: <Scissors className="w-4 h-4" /> },
  { key: 'staff',     label: 'کارمندان',   icon: <Users className="w-4 h-4" /> },
  { key: 'settings',  label: 'تنظیمات',   icon: <Settings className="w-4 h-4" /> },
];

export function DashboardLayout({ salonId, children, activeTab }: { salonId: string; children: React.ReactNode; activeTab: string }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <header className="border-b px-6 py-4 flex items-center gap-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <Link href="/dashboard" className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--color-muted)' }}>
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>🪒 پرنگارین</h1>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-[calc(100vh-65px)] border-l p-4 space-y-1" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          {TABS.map(tab => (
            <Link key={tab.key} href={`/dashboard/salons/${salonId}/${tab.key}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'var(--color-text)',
              }}>
              {tab.icon} {tab.label}
            </Link>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
