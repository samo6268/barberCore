import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenderType } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get('search')
  @ApiOperation({ summary: 'جستجوی سالن‌ها' })
  search(
    @Query()
    query: {
      q?: string;
      city?: string;
      gender?: GenderType;
      service?: string;
      sort?: 'rating' | 'reviews';
      page?: number;
      limit?: number;
    },
  ) {
    return this.service.searchSalons(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'سالن‌های ویژه' })
  featured(@Query('gender') gender?: GenderType) {
    return this.service.getFeaturedSalons(gender);
  }

  @Get('salons/:slug')
  @ApiOperation({ summary: 'صفحه سالن' })
  getSalon(@Param('slug') slug: string) {
    return this.service.getSalonBySlug(slug);
  }

  @Post('favorites/:salonId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'افزودن/حذف از علاقه‌مندی‌ها' })
  toggleFavorite(@Param('salonId') salonId: string, @CurrentUser() u: JwtPayload) {
    return this.service.toggleFavorite(u.sub, salonId);
  }

  @Get('favorites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'علاقه‌مندی‌های من' })
  getMyFavorites(@CurrentUser() u: JwtPayload) {
    return this.service.getMyFavorites(u.sub);
  }
}
