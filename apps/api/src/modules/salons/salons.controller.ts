import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SalonsService } from './salons.service';
import { CreateSalonDto, UpdateSalonDto, WorkingHourDto } from './dto/salon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Salons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('salons')
export class SalonsController {
  constructor(private readonly service: SalonsService) {}

  @Post()
  @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'ایجاد سالن جدید' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSalonDto) {
    return this.service.create(user.sub, dto);
  }

  @Get('mine')
  @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'سالن‌های من' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.service.findMine(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جزئیات سالن' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'ویرایش سالن' })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: UpdateSalonDto) {
    return this.service.update(id, user.sub, dto);
  }

  @Put(':id/working-hours')
  @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'تنظیم ساعات کاری' })
  updateWorkingHours(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() hours: WorkingHourDto[]) {
    return this.service.updateWorkingHours(id, user.sub, hours);
  }

  @Patch(':id/onboarding/:step')
  @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'بروزرسانی مرحله راه‌اندازی' })
  onboardingStep(@Param('id') id: string, @Param('step') step: number, @CurrentUser() user: JwtPayload) {
    return this.service.updateOnboardingStep(id, user.sub, Number(step));
  }
}
