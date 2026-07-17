'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Store, FileText, Image, MessageSquare,
  Star, TrendingUp, Shield, Megaphone, ChevronDown, Settings, LogOut, GraduationCap,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
  roles?: string[];
}

const NAV: NavItem[] = [
  { label: 'داشبورد', href: '/dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
  {
    label: 'محتوا', icon: <FileText size={18} strokeWidth={1.5} />,
    children: [
      { label: 'صفحات',    href: '/content/pages' },
      { label: 'وبلاگ',    href: '/content/blog' },
      { label: 'رسانه',    href: '/media' },
      { label: 'قالب‌ها',  href: '/templates' },
      { label: 'صفحه اصلی', href: '/content/homepage' },
    ],
  },
  {
    label: 'کاربران', icon: <Users size={18} strokeWidth={1.5} />,
    children: [
      { label: 'مدیریت کاربران',    href: '/users' },
      { label: 'مدیریت مشتریان',    href: '/customers' },
    ],
  },
  { label: 'سالن‌ها', href: '/salons',  icon: <Store size={18} strokeWidth={1.5} /> },
  { label: 'دوره‌ها', href: '/courses', icon: <GraduationCap size={18} strokeWidth={1.5} /> },
  {
    label: 'تبلیغات', icon: <Megaphone size={18} strokeWidth={1.5} />,
    children: [
      { label: 'بررسی آگهی‌ها',     href: '/moderation/ads' },
    ],
  },
  { label: 'مالی',      href: '/financial',  icon: <TrendingUp size={18} strokeWidth={1.5} /> },
  { label: 'نظرات',    href: '/reviews',    icon: <Star size={18} strokeWidth={1.5} /> },
  { label: 'تنظیمات',  href: '/settings',   icon: <Settings size={18} strokeWidth={1.5} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed inset-y-0 right-0 w-64 flex flex-col z-40"
      style={{ background: 'var(--admin-sidebar-bg)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--brand-gold-600)', color: 'var(--brand-plum-900)' }}>
            B
          </div>
          <span className="font-semibold text-base" style={{ color: 'var(--admin-sidebar-text)' }}>
            BarberCore
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--admin-sidebar-muted)' }}>
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3">
        {NAV.map((item, i) => (
          <NavGroup key={i} item={item} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{ color: 'var(--admin-sidebar-muted)' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--admin-sidebar-hover)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={16} strokeWidth={1.5} />
          خروج
        </button>
      </div>
    </aside>
  );
}

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some(c => pathname.startsWith(c.href)) ?? false;

  if (!item.children) {
    return (
      <Link
        href={item.href!}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-all"
        style={{
          color: isActive ? 'var(--admin-sidebar-active)' : 'var(--admin-sidebar-text)',
          background: isActive ? 'rgba(216,183,106,0.1)' : 'transparent',
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {item.icon}
        {item.label}
        {isActive && <div className="mr-auto w-1 h-1 rounded-full" style={{ background: 'var(--admin-sidebar-active)' }} />}
      </Link>
    );
  }

  return (
    <div className="mb-1">
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-default"
        style={{ color: 'var(--admin-sidebar-muted)' }}
      >
        {item.icon}
        {item.label}
        <ChevronDown size={14} className="mr-auto" />
      </div>
      <div className="mr-2 pr-4 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {item.children.map(child => {
          const childActive = pathname.startsWith(child.href);
          return (
            <Link
              key={child.href}
              href={child.href}
              className="block px-3 py-2 rounded-lg text-sm mb-0.5 transition-all"
              style={{
                color: childActive ? 'var(--admin-sidebar-active)' : 'var(--admin-sidebar-muted)',
                background: childActive ? 'rgba(216,183,106,0.1)' : 'transparent',
                fontWeight: childActive ? 600 : 400,
              }}
            >
              {child.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
