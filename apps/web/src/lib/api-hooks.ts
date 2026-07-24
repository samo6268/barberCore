'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ApiResponse } from './api';

// ── Auth ──────────────────────────────────────────────
export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<ApiResponse<any>>('/auth/me').then((r) => r.data.data),
    retry: false,
  });

export const useSendOtp = () =>
  useMutation({
    mutationFn: (phone: string) => api.post('/auth/otp/send', { phone }).then((r) => r.data),
  });

const persistTokens = (data: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem('access_token', data.accessToken);
  localStorage.setItem('refresh_token', data.refreshToken);
};

export const useVerifyOtp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const response = await api.post('/auth/otp/verify', { phone, code }).then((r) => r.data);
      const data = response.data;
      persistTokens(data);
      qc.invalidateQueries({ queryKey: ['me'] });
      return data;
    },
  });
};

export const useLoginWithEmail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.post('/auth/login', { email, password }).then((r) => r.data);
      const data = response.data;
      persistTokens(data);
      await qc.invalidateQueries({ queryKey: ['me'] });
      return data;
    },
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { firstName?: string; lastName?: string; email?: string }) =>
      api.patch('/users/me', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
};

export const useApplyAsInstructor = () =>
  useMutation({
    mutationFn: (dto: { bio: string; expertise: string[] }) =>
      api.post('/education/instructor/apply', dto).then((r) => r.data.data),
  });

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
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
    queryFn: () => {
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
    mutationFn: ({ preview: _preview, ...dto }: CreateBookingInput) =>
      api.post('/bookings', dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};

export const useMyBookings = () =>
  useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/mine').then((r) => r.data),
  });

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch(`/bookings/${id}/cancel`, { reason }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};

export const useSalonBookings = (salonId: string, date?: string) =>
  useQuery({
    queryKey: ['salon-bookings', salonId, date],
    queryFn: () =>
      api
        .get(`/bookings/salon/${salonId}`, { params: date ? { date } : {} })
        .then((r) => r.data.data),
    enabled: !!salonId,
    retry: false,
  });

export const useUpdateBookingStatus = (salonId: string, date?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) =>
      api.patch(`/bookings/${bookingId}/status`, { status }).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-bookings', salonId, date] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
};

// ── Salons (owner) ──────────────────────────────────
export const useMySalons = () =>
  useQuery({
    queryKey: ['my-salons'],
    queryFn: () => api.get('/salons/mine').then((r) => r.data.data),
    retry: false,
  });

export const useSalonSubscription = (salonId: string) =>
  useQuery({
    queryKey: ['salon-subscription', salonId],
    queryFn: () => api.get(`/subscriptions/salon/${salonId}`).then((r) => r.data.data),
    enabled: !!salonId,
    retry: false,
  });

export const useCreateSalon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) => api.post('/salons', dto).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-salons'] }),
  });
};

export const useSalonServices = (salonId: string) =>
  useQuery({
    queryKey: ['services', salonId],
    queryFn: () => api.get(`/salons/${salonId}/services`).then((r) => r.data.data),
    enabled: !!salonId,
    retry: false,
  });

export const useCreateService = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) =>
      api.post(`/salons/${salonId}/services`, dto).then((r) => r.data.data),
    onSuccess: (newSvc) => {
      qc.setQueryData(['services', salonId], (old: any[]) => [...(old || []), newSvc]);
    },
  });
};

export const useSalonStaff = (salonId: string) =>
  useQuery({
    queryKey: ['staff', salonId],
    queryFn: () => api.get(`/salons/${salonId}/staff`).then((r) => r.data.data),
    enabled: !!salonId,
    retry: false,
  });

export const useSalonStaffManagement = (salonId: string) =>
  useQuery({
    queryKey: ['staff-management', salonId],
    queryFn: () =>
      api.get(`/salons/${salonId}/staff/management`).then((r) => r.data.data),
    enabled: !!salonId,
    retry: false,
  });

export const useCreateStaff = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) =>
      api.post(`/salons/${salonId}/staff`, dto).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', salonId] });
      qc.invalidateQueries({ queryKey: ['staff-management', salonId] });
    },
  });
};

export const useUpdateStaffCompensation = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, ...dto }: { staffId: string; [key: string]: any }) =>
      api
        .put(`/salons/${salonId}/staff/${staffId}/compensation`, dto)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', salonId] });
      qc.invalidateQueries({ queryKey: ['staff-management', salonId] });
    },
  });
};

// ── Staff settlements & financial reports ───────────
export const useSettlements = (
  salonId: string,
  filters: { staffId?: string; status?: string } = {},
) =>
  useQuery({
    queryKey: ['settlements', salonId, filters],
    queryFn: () =>
      api
        .get(`/salons/${salonId}/settlements`, { params: filters })
        .then((r) => r.data.data),
    enabled: !!salonId,
    retry: false,
  });

export const useSettlementPreview = (
  salonId: string,
  params: { staffId: string; from: string; to: string },
  enabled = true,
) =>
  useQuery({
    queryKey: ['settlement-preview', salonId, params],
    queryFn: () =>
      api
        .get(`/salons/${salonId}/settlements/preview`, { params })
        .then((r) => r.data.data),
    enabled: enabled && !!(salonId && params.staffId && params.from && params.to),
    retry: false,
  });

export const useCreateSettlement = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: any) =>
      api.post(`/salons/${salonId}/settlements`, dto).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', salonId] });
      qc.invalidateQueries({ queryKey: ['settlement-preview', salonId] });
      qc.invalidateQueries({ queryKey: ['financial-report', salonId] });
    },
  });
};

export const useUpdateSettlementStatus = (salonId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      settlementId,
      ...dto
    }: {
      settlementId: string;
      status: string;
      paymentMethod?: string;
      paymentReference?: string;
      note?: string;
    }) =>
      api
        .patch(`/salons/${salonId}/settlements/${settlementId}/status`, dto)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', salonId] });
      qc.invalidateQueries({ queryKey: ['settlement-preview', salonId] });
      qc.invalidateQueries({ queryKey: ['financial-report', salonId] });
    },
  });
};

export const useFinancialReport = (
  salonId: string,
  params: { from: string; to: string },
) =>
  useQuery({
    queryKey: ['financial-report', salonId, params],
    queryFn: () =>
      api
        .get(`/salons/${salonId}/settlements/reports/financial`, { params })
        .then((r) => r.data.data),
    enabled: !!(salonId && params.from && params.to),
    retry: false,
  });

export const useServiceCategories = () =>
  useQuery({
    queryKey: ['service-categories'],
    queryFn: () => api.get('/service-categories').then((r) => r.data.data),
    retry: false,
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
    mutationFn: (dto: {
      bookingId: string;
      salonId?: string;
      rating: number;
      comment?: string;
    }) => {
      const { bookingId, rating, comment } = dto;
      return api.post('/reviews', { bookingId, rating, comment }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bookings'] }),
  });
};
