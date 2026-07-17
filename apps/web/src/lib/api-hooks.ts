'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ApiResponse } from './api';
import {
  getMockUser, mockLogout, isMockSession, saveMockReview, hasMockReview,
} from './mock-session';
import {
  MOCK_OWNER_SALONS, MOCK_SALON_BOOKINGS, MOCK_SALON_SERVICES,
  MOCK_SALON_STAFF, MOCK_SERVICE_CATEGORIES, MOCK_MY_BOOKINGS,
} from './mock-data';

// ── Auth ──────────────────────────────────────────────
export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const mock = getMockUser();
      if (mock) return mock;
      return api.get<ApiResponse<any>>('/auth/me').then(r => r.data.data);
    },
    retry: false,
  });

export const useSendOtp = () =>
  useMutation({
    mutationFn: async (phone: string) => {
      try { return await api.post('/auth/otp/send', { phone }).then(r => r.data); }
      catch { return { success: true, message: 'کد نمونه: 123456' }; }
    },
  });

export const useVerifyOtp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      // Always accept 123456 as demo code
      if (code === '123456') {
        const { mockLogin } = await import('./mock-session');
        const user = mockLogin(phone);
        qc.setQueryData(['me'], user);
        return { success: true, user };
      }
      const data = await api.post('/auth/otp/verify', { phone, code }).then(r => r.data);
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      qc.invalidateQueries({ queryKey: ['me'] });
      return data;
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (isMockSession()) { mockLogout(); return; }
      await api.post('/auth/logout', { refreshToken: localStorage.getItem('refresh_token') }).catch(() => {});
      localStorage.clear();
    },
    onSuccess: () => qc.clear(),
  });
};

// ── Marketplace ─────────────────────────────────────
export const useSearchSalons = (params: Record<string, string>) =>
  useQuery({ queryKey: ['salons', params], queryFn: () => api.get('/marketplace/search', { params }).then(r => r.data), retry: false });

export const useFeaturedSalons = (gender?: string) =>
  useQuery({ queryKey: ['featured', gender], queryFn: () => api.get('/marketplace/featured', { params: gender ? { gender } : {} }).then(r => r.data.data), retry: false });

export const useSalonBySlug = (slug: string) =>
  useQuery({ queryKey: ['salon', slug], queryFn: () => api.get(`/marketplace/salons/${slug}`).then(r => r.data.data), enabled: !!slug, retry: false });

// ── Availability ────────────────────────────────────
export const useAvailability = (params: { salonId: string; date: string; serviceId: string; staffId?: string }) =>
  useQuery({
    queryKey: ['availability', params],
    queryFn: async () => {
      try { return await api.get('/bookings/availability', { params }).then(r => r.data.data); }
      catch {
        const { MOCK_AVAILABLE_SLOTS } = await import('./mock-data');
        return MOCK_AVAILABLE_SLOTS;
      }
    },
    enabled: !!(params.salonId && params.date && params.serviceId),
  });

// ── Booking ─────────────────────────────────────────
export const useCreateBooking = () =>
  useMutation({
    mutationFn: async (dto: any) => {
      try { return await api.post('/bookings', dto).then(r => r.data); }
      catch { return { success: true, data: { id: 'mock_booking_' + Date.now(), ...dto } }; }
    },
  });

export const useMyBookings = () =>
  useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      try { return await api.get('/bookings/mine').then(r => r.data); }
      catch { return { data: MOCK_MY_BOOKINGS, meta: { total: MOCK_MY_BOOKINGS.length } }; }
    },
  });

export const useSalonBookings = (salonId: string, date?: string) =>
  useQuery({
    queryKey: ['salon-bookings', salonId, date],
    queryFn: async () => {
      try { return await api.get(`/bookings/salon/${salonId}`, { params: date ? { date } : {} }).then(r => r.data.data); }
      catch { return MOCK_SALON_BOOKINGS; }
    },
    enabled: !!salonId,
  });

// ── Salons (owner) ──────────────────────────────────
export const useMySalons = () =>
  useQuery({
    queryKey: ['my-salons'],
    queryFn: async () => {
      const mock = getMockUser();
      if (mock || isMockSession()) return MOCK_OWNER_SALONS;
      try { return await api.get('/salons/mine').then(r => r.data.data); }
      catch { return MOCK_OWNER_SALONS; }
    },
  });

export const useCreateSalon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      try { return await api.post('/salons', dto).then(r => r.data.data); }
      catch { return { id: 'mock_salon_' + Date.now(), ...dto, status: 'PENDING_REVIEW', _count: { bookings: 0, reviews: 0 } }; }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-salons'] }),
  });
};

export const useSalonServices = (salonId: string) =>
  useQuery({
    queryKey: ['services', salonId],
    queryFn: async () => {
      try { return await api.get(`/salons/${salonId}/services`).then(r => r.data.data); }
      catch { return MOCK_SALON_SERVICES; }
    },
    enabled: !!salonId,
  });

export const useCreateService = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      try { return await api.post(`/salons/${salonId}/services`, dto).then(r => r.data.data); }
      catch { return { id: 'mock_svc_' + Date.now(), ...dto, isActive: true, category: { name: dto.categoryName || 'عمومی' } }; }
    },
    onSuccess: (newSvc) => {
      qc.setQueryData(['services', salonId], (old: any[]) => [...(old || MOCK_SALON_SERVICES), newSvc]);
    },
  });
};

export const useSalonStaff = (salonId: string) =>
  useQuery({
    queryKey: ['staff', salonId],
    queryFn: async () => {
      try { return await api.get(`/salons/${salonId}/staff`).then(r => r.data.data); }
      catch { return MOCK_SALON_STAFF; }
    },
    enabled: !!salonId,
  });

export const useCreateStaff = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      try { return await api.post(`/salons/${salonId}/staff`, dto).then(r => r.data.data); }
      catch { return { id: 'mock_staff_' + Date.now(), ...dto, isActive: true, services: [], avatarUrl: null }; }
    },
    onSuccess: (newStaff) => {
      qc.setQueryData(['staff', salonId], (old: any[]) => [...(old || MOCK_SALON_STAFF), newStaff]);
    },
  });
};

export const useServiceCategories = () =>
  useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      try { return await api.get('/service-categories').then(r => r.data.data); }
      catch { return MOCK_SERVICE_CATEGORIES; }
    },
  });

// ── Reviews ─────────────────────────────────────────
export const useSalonReviews = (salonId: string) =>
  useQuery({ queryKey: ['reviews', salonId], queryFn: () => api.get(`/reviews/salon/${salonId}`).then(r => r.data), retry: false });

export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: { bookingId: string; salonId?: string; rating: number; comment?: string }) => {
      try { return await api.post('/reviews', dto).then(r => r.data); }
      catch {
        const saved = saveMockReview({ bookingId: dto.bookingId, salonId: dto.salonId || '', rating: dto.rating, comment: dto.comment || '' });
        return { success: true, data: saved };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};

export const useHasReview = (bookingId: string) => hasMockReview(bookingId);
