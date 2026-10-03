import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenderType, SalonStatus } from '@prisma/client';
import { paginate } from '../../common/dto/pagination.dto';

export interface SearchQuery {
  q?: string;
  province?: string;
  city?: string;
  neighborhood?: string;
  gender?: GenderType;
  service?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: 'rating' | 'reviews';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async searchSalons(query: SearchQuery) {
    const { q, province, city, neighborhood, gender, service, minPrice, maxPrice, minRating, sort = 'rating' } = query;
    const lat = query.lat == null ? undefined : Number(query.lat);
    const lng = query.lng == null ? undefined : Number(query.lng);
    const radiusKm = Math.min(50, Math.max(0.5, Number(query.radiusKm) || 5));
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: SalonStatus.ACTIVE, deletedAt: null };
    if (province) where['province'] = { contains: province, mode: 'insensitive' };
    if (city) where['city'] = { contains: city, mode: 'insensitive' };
    if (gender) where['genderType'] = { in: [gender, GenderType.UNISEX] };
    if (neighborhood) where['address'] = { contains: neighborhood, mode: 'insensitive' };
    if (minRating) where['rating'] = { gte: Number(minRating) };
    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      const latitudeDelta = radiusKm / 111;
      const longitudeDelta = radiusKm / (111 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
      where['latitude'] = { gte: lat - latitudeDelta, lte: lat + latitudeDelta };
      where['longitude'] = { gte: lng - longitudeDelta, lte: lng + longitudeDelta };
    }
    if (service || minPrice || maxPrice) {
      const serviceWhere: Record<string, unknown> = { isActive: true, isOnlineBookable: true };
      if (service) serviceWhere.name = { contains: service, mode: 'insensitive' };
      if (minPrice || maxPrice) {
        serviceWhere.price = {
          ...(minPrice ? { gte: Number(minPrice) } : {}),
          ...(maxPrice ? { lte: Number(maxPrice) } : {}),
        };
      }
      where['services'] = { some: serviceWhere };
    }
    if (q)
      where['OR'] = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];

    const [data, total] = await Promise.all([
      this.prisma.salon.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          genderType: true,
          city: true,
          address: true,
          logoUrl: true,
          coverImageUrl: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          latitude: true,
          longitude: true,
          services: {
            where: { isActive: true, isOnlineBookable: true },
            select: { id: true, name: true, price: true, discountPrice: true },
            take: 3,
            orderBy: { price: 'asc' },
          },
          advertisements: {
            where: {
              type: 'FEATURED',
              status: 'ACTIVE',
              startsAt: { lte: new Date() },
              endsAt: { gte: new Date() },
            },
            select: { id: true },
          },
        },
        orderBy:
          sort === 'reviews'
            ? [{ reviewCount: 'desc' }, { rating: 'desc' }]
            : [{ rating: 'desc' }, { reviewCount: 'desc' }],
        skip: lat != null && lng != null ? 0 : skip,
        take: lat != null && lng != null ? 500 : limit,
      }),
      this.prisma.salon.count({ where }),
    ]);

    const salons = data
      .map(({ advertisements, services, ...salon }) => {
        const distanceKm = lat != null && lng != null && salon.latitude != null && salon.longitude != null
          ? this.distanceInKm(lat, lng, salon.latitude, salon.longitude)
          : null;
        return {
          ...salon,
          services,
          featured: advertisements.length > 0,
          distanceKm: distanceKm == null ? null : Number(distanceKm.toFixed(1)),
          minPrice: services.length
            ? Math.min(...services.map((item) => item.discountPrice ?? item.price))
            : null,
        };
      })
      .filter((salon) => salon.distanceKm == null || salon.distanceKm <= radiusKm);

    if (lat != null && lng != null) salons.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    const filteredTotal = lat != null && lng != null ? salons.length : total;
    return paginate(salons, filteredTotal, Number(page), Number(limit));
  }

  private distanceInKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const earthRadius = 6371;
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async getSalonBySlug(slug: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { slug, status: SalonStatus.ACTIVE },
      include: {
        services: {
          where: { isActive: true, isOnlineBookable: true },
          include: { category: true },
          orderBy: { sortOrder: 'asc' },
        },
        staffProfiles: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            specialties: true,
            services: { select: { serviceId: true } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isVisible: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { customer: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        _count: { select: { reviews: true, bookings: true } },
      },
    });
    if (!salon) throw new NotFoundException('سالن یافت نشد');
    return salon;
  }

  async getFeaturedSalons(gender?: GenderType) {
    const where: Record<string, unknown> = {
      status: SalonStatus.ACTIVE,
      deletedAt: null,
      advertisements: {
        some: {
          type: 'FEATURED',
          status: 'ACTIVE',
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() },
        },
      },
    };
    if (gender) where['genderType'] = { in: [gender, GenderType.UNISEX] };

    return this.prisma.salon.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        logoUrl: true,
        coverImageUrl: true,
        rating: true,
        genderType: true,
      },
      take: 8,
      orderBy: { rating: 'desc' },
    });
  }

  async toggleFavorite(userId: string, salonId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_salonId: { userId, salonId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { userId_salonId: { userId, salonId } } });
      return { favorited: false };
    }
    await this.prisma.favorite.create({ data: { userId, salonId } });
    return { favorited: true };
  }

  async getMyFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        salon: {
          select: {
            id: true,
            slug: true,
            name: true,
            city: true,
            logoUrl: true,
            rating: true,
            genderType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
