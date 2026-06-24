// BarberCore Shared Types

export type UserRole = 'SUPER_ADMIN' | 'SALON_OWNER' | 'STAFF' | 'CUSTOMER';
export type GenderType = 'MALE' | 'FEMALE' | 'UNISEX';
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'WAITLISTED';
export type SubscriptionTier = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type SalonStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Salon {
  id: string;
  slug: string;
  name: string;
  description?: string;
  genderType: GenderType;
  status: SalonStatus;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  logoUrl?: string;
  coverImageUrl?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface StaffProfile {
  id: string;
  userId: string;
  salonId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  specialties: string[];
}

export interface Booking {
  id: string;
  salonId: string;
  customerId: string;
  staffId?: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  totalPrice: number;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
