'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Search, User, Heart, Calendar, LogOut, LayoutDashboard } from 'lucide-react';
import { useMe, useLogout } from '@/lib/api-hooks';
import { cn } from '@/lib/utils';

export function Navbar({ gender }: { gender?: 'male' | 'female' }) {
  const { data: user } = useMe();
  const logout = useLogout();
  const router = useRouter();

  const base = gender === 'female' ? '/female' : '/male';

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: 'var(--color-primary)' }}>
          <Scissors className="w-6 h-6" />
          پرنگارین
        </Link>

        {/* Search */}
        <Link href={`${base}/search`} className="flex-1 max-w-md">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
            <Search className="w-4 h-4" />
            <span>جستجوی سالن در شهر...</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <NavBtn href="/profile/bookings" icon={<Calendar className="w-4 h-4" />} label="رزروها" />
              <NavBtn href="/profile/favorites" icon={<Heart className="w-4 h-4" />} label="علاقه‌مندی‌ها" />
              {(user.role === 'SALON_OWNER' || user.role === 'SUPER_ADMIN') && (
                <NavBtn href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="داشبورد" />
              )}
              <NavBtn href="/profile" icon={<User className="w-4 h-4" />} label={user.firstName} />
              <button onClick={() => { logout.mutate(); router.push('/'); }}
                className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--color-muted)' }}>
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}>
              ورود
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavBtn({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--color-text)' }}>
      {icon} <span className="hidden md:block">{label}</span>
    </Link>
  );
}
