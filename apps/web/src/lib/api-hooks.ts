'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ApiResponse } from './api';
import {
  getMockUser,
  mockLogout,
  isMockSession,
  saveMockReview,
  hasMockReview,
} from './mock-session';
import {
  MOCK_OWNER_SALONS,
  MOCK_SALON_BOOKINGS,
  MOCK_SALON_SERVICES,
  MOCK_SALON_STAFF,
  MOCK_SERVICE_CATEGORIES,
  MOCK_MY_BOOKINGS,
} from './mock-data';

// ── Auth ──────────────────────────────────────────────
export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const mock = getMockUser();
      if (mock) return mock;
      return api.get<ApiResponse<any>>('/auth/me').then((r) => r.data.data);
    },
    retry: false,
  });

export const useSendOtp = () =>
  useMutation({
    mutationFn: (phone: string) => api.post('/auth/otp/send', { phone }).then((r) => r.data),
  });

export const useVerifyOtp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phone,
      code,
      demo = false,
    }: {
      phone: string;
      code: string;
      demo?: boolean;
    }) => {
      if (demo) {
        const { mockLogin } = await import('./mock-session');
        const user = mockLogin(phone);
        qc.setQueryData(['me'], user);
        return { success: true, user };
      }
      const response = await api.post('/auth/otp/verify', { phone, code }).then((r) => r.data);
      const data = response.data;
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
      if (isMockSession()) {
        mockLogout();
        return;
      }
      await api
        .post('/auth/logout', { refreshToken: localStorage.getItem('refresh_token') })
        .catch(() => {});
      localStorage.clear();
    },
    onSuccess: () => qc.clear(),
  });
};

// ── Marketplace ─────────────────────────────────────
export const useSearchSalons = (params: Record<string, string>) =>
  useQuery({
    queryKey: ['salons', params],
    queryFn: () => api.get('/marketplace/search', { params }).then((r) => r.data),
    retry: false,
  });

export const useFeaturedSalons = (gender?: string) =>
  useQuery({
    queryKey: ['featured', gender],
    queryFn: () =>
      api
        .get('/marketplace/featured', { params: gender ? { gender } : {} })
        .then((r) => r.data.data),
    retry: false,
  });

export const useSalonBySlug = (slug: string) =>
  useQuery({
    queryKey: ['salon', slug],
    queryFn: () => api.get(`/marketplace/salons/${slug}`).then((r) => r.data.data),
    enabled: !!slug,
    retry: false,
  });

// ── Availability ────────────────────────────────────
export const useAvailability = (params: {
  salonId: string;
  date: string;
  serviceIds: string[];
  staffId?: string;
}) =>
  useQuery({
    queryKey: ['availability', params],
    queryFn: async () => {
      if (isMockSession()) {
        const { MOCK_AVAILABLE_SLOTS } = await import('./mock-data');
        return MOCK_AVAILABLE_SLOTS;
      }
      const { serviceIds, ...rest } = params;
      return api
        .get('/bookings/availability', {
          params: { ...rest, serviceIds: serviceIds.join(',') },
        })
        .then((r) => r.data.data);
    },
    enabled: !!(params.salonId && params.date && params.serviceIds.length),
  });

// ── Booking ─────────────────────────────────────────
type CreateBookingInput = {
  salonId: string;
  serviceIds: string[];
  staffId?: string;
  date: string;
  time: string;
  notes?: string;
  preview?: {
    salonName: string;
    services: Array<{ id: string; name: string; price: number }>;
    totalPrice: number;
  };
};

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ preview, ...dto }: CreateBookingInput) => {
      if (isMockSession()) {
        return {
          success: true,
          data: {
            id: `mock_booking_${Date.now()}`,
            ...dto,
            startsAt: `${dto.date}T${dto.time}:00.000Z`,
            status: 'CONFIRMED',
            totalPrice: preview?.totalPrice ?? 0,
            salon: { name: preview?.salonName ?? 'سالن نمونه', logoUrl: null },
            items: (preview?.services ?? []).map((service) => ({
              id: `mock_item_${service.id}`,
              service,
            })),
          },
        };
      }
      return api.post('/bookings', dto).then((r) => r.data);
    },
    onSuccess: (result) => {
      if (!isMockSession()) {
        qc.invalidateQueries({ queryKey: ['my-bookings'] });
        return;
      }
      qc.setQueryData(['my-bookings'], (current: any) => {
        const previous = current?.data ?? MOCK_MY_BOOKINGS;
        return {
          data: [result.data, ...previous],
          meta: { total: previous.length + 1 },
        };
      });
    },
  });
};

export const useMyBookings = () =>
  useQuery({
    queryKey: ['my-bookings'],
    queryFn: () =>
      isMockSession()
        ? Promise.resolve({ data: MOCK_MY_BOOKINGS, meta: { total: MOCK_MY_BOOKINGS.length } })
        : api.get('/bookings/mine').then((r) => r.data),
  });

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      if (isMockSession()) return { id, status: 'CANCELLED', cancellationReason: reason };
      return api.patch(`/bookings/${id}/cancel`, { reason }).then((r) => r.data.data);
    },
    onSuccess: (cancelled) => {
      if (!isMockSession()) {
        qc.invalidateQueries({ queryKey: ['my-bookings'] });
        return;
      }
      qc.setQueryData(['my-bookings'], (current: any) => ({
        ...current,
        data: (current?.data ?? []).map((booking: any) =>
          booking.id === cancelled.id ? { ...booking, ...cancelled } : booking,
        ),
      }));
    },
  });
};

export const useSalonBookings = (salonId: string, date?: string) =>
  useQuery({
    queryKey: ['salon-bookings', salonId, date],
    queryFn: async () => {
      try {
        return await api
          .get(`/bookings/salon/${salonId}`, { params: date ? { date } : {} })
          .then((r) => r.data.data);
      } catch {
        return MOCK_SALON_BOOKINGS;
      }
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
      try {
        return await api.get('/salons/mine').then((r) => r.data.data);
      } catch {
        return MOCK_OWNER_SALONS;
      }
    },
  });

export const useCreateSalon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      try {
        return await api.post('/salons', dto).then((r) => r.data.data);
      } catch {
        return {
          id: 'mock_salon_' + Date.now(),
          ...dto,
          status: 'PENDING_REVIEW',
          _count: { bookings: 0, reviews: 0 },
        };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-salons'] }),
  });
};

export const useSalonServices = (salonId: string) =>
  useQuery({
    queryKey: ['services', salonId],
    queryFn: async () => {
      try {
        return await api.get(`/salons/${salonId}/services`).then((r) => r.data.data);
      } catch {
        return MOCK_SALON_SERVICES;
      }
    },
    enabled: !!salonId,
  });

export const useCreateService = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      try {
        return await api.post(`/salons/${salonId}/services`, dto).then((r) => r.data.data);
      } catch {
        return {
          id: 'mock_svc_' + Date.now(),
          ...dto,
          isActive: true,
          category: { name: dto.categoryName || 'عمومی' },
        };
      }
    },
    onSuccess: (newSvc) => {
      qc.setQueryData(['services', salonId], (old: any[]) => [
        ...(old || MOCK_SALON_SERVICES),
        newSvc,
      ]);
    },
  });
};

export const useSalonStaff = (salonId: string) =>
  useQuery({
    queryKey: ['staff', salonId],
    queryFn: async () => {
      try {
        return await api.get(`/salons/${salonId}/staff`).then((r) => r.data.data);
      } catch {
        return MOCK_SALON_STAFF;
      }
    },
    enabled: !!salonId,
  });

export const useCreateStaff = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: any) => {
      try {
        return await api.post(`/salons/${salonId}/staff`, dto).then((r) => r.data.data);
      } catch {
        return {
          id: 'mock_staff_' + Date.now(),
          ...dto,
          isActive: true,
          services: [],
          avatarUrl: null,
        };
      }
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
      try {
        return await api.get('/service-categories').then((r) => r.data.data);
      } catch {
        return MOCK_SERVICE_CATEGORIES;
      }
    },
  });

// ── Reviews ─────────────────────────────────────────
export const useSalonReviews = (salonId: string) =>
  useQuery({
    queryKey: ['reviews', salonId],
    queryFn: () => api.get(`/reviews/salon/${salonId}`).then((r) => r.data),
    retry: false,
  });

export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: {
      bookingId: string;
      salonId?: string;
      rating: number;
      comment?: string;
    }) => {
      try {
        return await api.post('/reviews', dto).then((r) => r.data);
      } catch {
        const saved = saveMockReview({
          bookingId: dto.bookingId,
          salonId: dto.salonId || '',
          rating: dto.rating,
          comment: dto.comment || '',
        });
        return { success: true, data: saved };
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};

export const useHasReview = (bookingId: string) => hasMockReview(bookingId);
