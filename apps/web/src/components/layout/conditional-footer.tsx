'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './site-footer';

const HIDDEN_PATHS = ['/dashboard', '/login', '/salon-owner', '/instructor', '/role-selector'];

export function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;
  return <SiteFooter />;
}
