import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ServicesService, CreateServiceDto } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Services')
@Controller('salons/:salonId/services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Get() @ApiOperation({ summary: 'لیست خدمات سالن' })
  findAll(@Param('salonId') salonId: string) { return this.service.findBySalon(salonId); }

  @Post() @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  create(@Param('salonId') salonId: string, @CurrentUser() u: JwtPayload, @Body() dto: CreateServiceDto) {
    return this.service.create(salonId, u.sub, dto);
  }

  @Patch(':id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  update(@Param('salonId') salonId: string, @Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() dto: Partial<CreateServiceDto>) {
    return this.service.update(id, salonId, u.sub, dto);
  }

  @Delete(':id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  remove(@Param('salonId') salonId: string, @Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return this.service.remove(id, salonId, u.sub);
  }
}

// Separate categories endpoint
import { Controller as Ctrl } from '@nestjs/common';
@ApiTags('Services')
@Ctrl('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly service: ServicesService) {}
  @Get() getCategories() { return this.service.getCategories(); }
}
