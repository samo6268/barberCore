import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenderType, SalonStatus } from '@prisma/client';
import { paginate } from '../../common/dto/pagination.dto';

export interface SearchQuery {
  q?: string;
  city?: string;
  gender?: GenderType;
  service?: string;
  sort?: 'rating' | 'reviews';
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
}

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async searchSalons(query: SearchQuery) {
    const { q, city, gender, service, sort = 'rating' } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: SalonStatus.ACTIVE, deletedAt: null };
    if (city) where['city'] = { contains: city, mode: 'insensitive' };
    if (gender) where['genderType'] = { in: [gender, GenderType.UNISEX] };
    if (service) {
      where['services'] = {
        some: {
          name: { contains: service, mode: 'insensitive' },
          isActive: true,
          isOnlineBookable: true,
        },
      };
    }
    if (q)
      where['OR'] = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
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
        skip,
        take: limit,
      }),
      this.prisma.salon.count({ where }),
    ]);

    const salons = data.map(({ advertisements, services, ...salon }) => ({
      ...salon,
      services,
      featured: advertisements.length > 0,
      minPrice: services.length
        ? Math.min(...services.map((item) => item.discountPrice ?? item.price))
        : null,
    }));

    return paginate(salons, total, Number(page), Number(limit));
  }

  async getSalonBySlug(slug: string) {
    return this.prisma.salon.findUnique({
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
