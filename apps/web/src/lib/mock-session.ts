const KEY_USER = 'mock_user';
const KEY_REVIEWS = 'mock_reviews';

export interface MockUser {
  id: string; firstName: string; lastName: string;
  phone: string; email?: string; role: string; avatarUrl?: string;
}

export const DEMO_USERS: Record<string, MockUser> = {
  default: { id: 'u1', firstName: 'محمد', lastName: 'رضایی', phone: '09123456789', role: 'SALON_OWNER' },
  customer: { id: 'u2', firstName: 'سارا', lastName: 'احمدی', phone: '09987654321', role: 'CUSTOMER' },
};

export function mockLogin(phone: string): MockUser {
  const user = phone.endsWith('1') ? DEMO_USERS.customer : DEMO_USERS.default;
  const u = { ...user, phone };
  localStorage.setItem(KEY_USER, JSON.stringify(u));
  localStorage.setItem('access_token', 'mock_token_' + Date.now());
  return u;
}

export function mockLogout() {
  localStorage.removeItem(KEY_USER);
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getMockUser(): MockUser | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEY_USER) || 'null'); } catch { return null; }
}

export function isMockSession(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('access_token');
  return !!token && token.startsWith('mock_token_');
}

export interface MockReview { id: string; bookingId: string; salonId: string; rating: number; comment: string; createdAt: string; }

export function saveMockReview(r: Omit<MockReview, 'id' | 'createdAt'>) {
  const all = getMockReviews();
  const next: MockReview = { ...r, id: 'rev_' + Date.now(), createdAt: new Date().toISOString() };
  all.push(next);
  localStorage.setItem(KEY_REVIEWS, JSON.stringify(all));
  return next;
}

export function getMockReviews(): MockReview[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY_REVIEWS) || '[]'); } catch { return []; }
}

export function hasMockReview(bookingId: string): boolean {
  return getMockReviews().some(r => r.bookingId === bookingId);
}
