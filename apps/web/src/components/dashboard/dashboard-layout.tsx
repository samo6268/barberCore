'use client';
import Link from 'next/link';
import { Calendar, Scissors, Users, Settings, BarChart3, ChevronRight, Zap, Star } from 'lucide-react';

const TABS = [
  { key: 'bookings', label: 'رزروها',   icon: Calendar,  href: 'bookings'  },
  { key: 'services', label: 'خدمات',    icon: Scissors,  href: 'services'  },
  { key: 'staff',    label: 'کارمندان', icon: Users,     href: 'staff'     },
  { key: 'settings', label: 'تنظیمات',  icon: Settings,  href: 'settings'  },
];

const PLAN_CONFIG: Record<string, { label: string; color: string; next?: string }> = {
  FREE:         { label: 'رایگان',      color: 'var(--ui-gray-400)',    next: 'STARTER'      },
  STARTER:      { label: 'استارتر',     color: 'var(--brand-navy-400)', next: 'PROFESSIONAL' },
  PROFESSIONAL: { label: 'حرفه‌ای',    color: 'var(--brand-plum-600)', next: 'ENTERPRISE'   },
  ENTERPRISE:   { label: 'اینترپرایز', color: 'var(--brand-gold-600)'                       },
};

interface DashboardLayoutProps {
  salonId: string;
  children: React.ReactNode;
  activeTab: string;
  salonName?: string;
  plan?: string;
}

export function DashboardLayout({
  salonId, children, activeTab, salonName = 'سالن من', plan = 'FREE',
}: DashboardLayoutProps) {
  const planCfg = PLAN_CONFIG[plan] ?? PLAN_CONFIG.FREE;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-ivory)' }}>

      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b sticky top-0 z-30"
        style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm"
            style={{ color: 'var(--ui-gray-400)' }}>
            <ChevronRight size={16} /> داشبورد
          </Link>
          <span style={{ color: 'var(--ui-gray-200)' }}>/</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--brand-navy-600)' }}>{salonName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${planCfg.color}18`, color: planCfg.color }}>
            {planCfg.label}
          </span>
          <Link href="/" className="text-xs" style={{ color: 'var(--ui-gray-400)' }}>
            بازگشت به سایت
          </Link>
        </div>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 border-l flex flex-col"
          style={{ background: 'white', borderColor: 'var(--ui-gray-200)' }}>
          <nav className="flex-1 py-4 px-3 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Link key={tab.key} href={`/dashboard/salons/${salonId}/${tab.href}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: isActive ? 'var(--brand-plum-50, #F5EBF4)' : 'transparent',
                    color: isActive ? 'var(--brand-plum-600)' : 'var(--brand-navy-600)',
                    borderRight: isActive ? '3px solid var(--brand-plum-600)' : '3px solid transparent',
                  }}>
                  <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Plan upgrade CTA */}
          {planCfg.next && (
            <div className="m-3 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, var(--brand-plum-50, #F5EBF4), var(--brand-gold-100, #F3E5B8))' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={14} style={{ color: 'var(--brand-gold-600)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--brand-plum-600)' }}>ارتقا به {PLAN_CONFIG[planCfg.next]?.label}</span>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--brand-navy-400)' }}>
                کمیسیون کمتر، امکانات بیشتر
              </p>
              <Link href="/dashboard/subscription"
                className="block text-center text-xs font-semibold py-2 rounded-xl"
                style={{ background: 'var(--brand-plum-600)', color: 'white' }}>
                مشاهده پلن‌ها
              </Link>
            </div>
          )}
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
