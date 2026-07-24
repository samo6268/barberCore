import {
  Controller, Get, Post, Param, Body, Patch, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeaturedService } from './featured.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('featured')
@Controller('featured')
export class FeaturedController {
  constructor(private readonly featuredService: FeaturedService) {}

  @Get('zones')
  getZones() {
    return this.featuredService.getZones();
  }

  @Get('zones/:zone/availability')
  getAvailability(@Param('zone') zone: string) {
    return this.featuredService.getAvailability(zone);
  }

  @Get('zones/:zone/active')
  getActiveSalonsByZone(@Param('zone') zone: string) {
    return this.featuredService.getActiveSalonsByZone(zone);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SALON_OWNER', 'SUPER_ADMIN')
  @Post('slots')
  bookSlot(@Body() dto: { salonId: string; zone: string; months: number }) {
    return this.featuredService.bookSlot(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Patch('slots/:slotId/activate')
  activateSlot(@Param('slotId') slotId: string) {
    return this.featuredService.activateSlot(slotId);
  }
}
