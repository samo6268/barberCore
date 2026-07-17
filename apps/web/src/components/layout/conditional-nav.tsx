'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

const HIDDEN_PATHS = ['/dashboard', '/login', '/salon-owner', '/instructor', '/role-selector'];

export function ConditionalNav() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;
  return <Navbar />;
}
