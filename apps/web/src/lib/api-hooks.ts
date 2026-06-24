'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { ApiResponse } from './api';

// ── Auth ──────────────────────────────────────────────
export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: () => api.get<ApiResponse<any>>('/auth/me').then(r => r.data.data), retry: false });

export const useSendOtp = () =>
  useMutation({ mutationFn: (phone: string) => api.post('/auth/otp/send', { phone }).then(r => r.data) });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      api.post('/auth/otp/verify', { phone, code }).then(r => r.data),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    },
  });

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout', { refreshToken: localStorage.getItem('refresh_token') }),
    onSuccess: () => { localStorage.clear(); qc.clear(); },
  });
};

// ── Marketplace ─────────────────────────────────────
export const useSearchSalons = (params: Record<string, string>) =>
  useQuery({ queryKey: ['salons', params], queryFn: () => api.get('/marketplace/search', { params }).then(r => r.data) });

export const useFeaturedSalons = (gender?: string) =>
  useQuery({ queryKey: ['featured', gender], queryFn: () => api.get('/marketplace/featured', { params: gender ? { gender } : {} }).then(r => r.data.data) });

export const useSalonBySlug = (slug: string) =>
  useQuery({ queryKey: ['salon', slug], queryFn: () => api.get(`/marketplace/salons/${slug}`).then(r => r.data.data), enabled: !!slug });

// ── Availability ────────────────────────────────────
export const useAvailability = (params: { salonId: string; date: string; serviceId: string; staffId?: string }) =>
  useQuery({
    queryKey: ['availability', params],
    queryFn: () => api.get('/bookings/availability', { params }).then(r => r.data.data),
    enabled: !!(params.salonId && params.date && params.serviceId),
  });

// ── Booking ─────────────────────────────────────────
export const useCreateBooking = () =>
  useMutation({ mutationFn: (dto: any) => api.post('/bookings', dto).then(r => r.data) });

export const useMyBookings = () =>
  useQuery({ queryKey: ['my-bookings'], queryFn: () => api.get('/bookings/mine').then(r => r.data) });

export const useSalonBookings = (salonId: string, date?: string) =>
  useQuery({
    queryKey: ['salon-bookings', salonId, date],
    queryFn: () => api.get(`/bookings/salon/${salonId}`, { params: date ? { date } : {} }).then(r => r.data.data),
    enabled: !!salonId,
  });

// ── Salons (owner) ──────────────────────────────────
export const useMySalons = () =>
  useQuery({ queryKey: ['my-salons'], queryFn: () => api.get('/salons/mine').then(r => r.data.data) });

export const useCreateSalon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/salons', dto).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-salons'] }),
  });
};

export const useSalonServices = (salonId: string) =>
  useQuery({ queryKey: ['services', salonId], queryFn: () => api.get(`/salons/${salonId}/services`).then(r => r.data.data), enabled: !!salonId });

export const useCreateService = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post(`/salons/${salonId}/services`, dto).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services', salonId] }),
  });
};

export const useSalonStaff = (salonId: string) =>
  useQuery({ queryKey: ['staff', salonId], queryFn: () => api.get(`/salons/${salonId}/staff`).then(r => r.data.data), enabled: !!salonId });

export const useCreateStaff = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post(`/salons/${salonId}/staff`, dto).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff', salonId] }),
  });
};

export const useServiceCategories = () =>
  useQuery({ queryKey: ['service-categories'], queryFn: () => api.get('/service-categories').then(r => r.data.data) });

// ── Reviews ─────────────────────────────────────────
export const useSalonReviews = (salonId: string) =>
  useQuery({ queryKey: ['reviews', salonId], queryFn: () => api.get(`/reviews/salon/${salonId}`).then(r => r.data) });

export const useSubmitReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { bookingId: string; rating: number; comment?: string }) =>
      api.post('/reviews', dto).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};
