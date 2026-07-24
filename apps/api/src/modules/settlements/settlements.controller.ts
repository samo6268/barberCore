import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  CreateSettlementDto,
  PreviewSettlementDto,
  SettlementListDto,
  SettlementPeriodDto,
  UpdateSettlementStatusDto,
} from './settlement.dto';
import { SettlementsService } from './settlements.service';

@ApiTags('Staff Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
@Controller('salons/:salonId/settlements')
export class SettlementsController {
  constructor(private readonly service: SettlementsService) {}

  @Get()
  @ApiOperation({ summary: 'فهرست تسویه‌های کارکنان' })
  list(
    @Param('salonId') salonId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: SettlementListDto,
  ) {
    return this.service.list(salonId, user, query);
  }

  @Get('preview')
  @ApiOperation({ summary: 'پیش‌نمایش صورتحساب تسویه' })
  preview(
    @Param('salonId') salonId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: PreviewSettlementDto,
  ) {
    return this.service.preview(salonId, user, query);
  }

  @Get('reports/financial')
  @ApiOperation({ summary: 'گزارش مالی و عملکرد سالن' })
  report(
    @Param('salonId') salonId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: SettlementPeriodDto,
  ) {
    return this.service.financialReport(salonId, user, query);
  }

  @Post()
  @ApiOperation({ summary: 'ایجاد صورتحساب تسویه' })
  create(
    @Param('salonId') salonId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSettlementDto,
  ) {
    return this.service.create(salonId, user, dto);
  }

  @Get(':settlementId')
  @ApiOperation({ summary: 'جزئیات صورتحساب تسویه' })
  findOne(
    @Param('salonId') salonId: string,
    @Param('settlementId') settlementId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.findOne(salonId, settlementId, user);
  }

  @Patch(':settlementId/status')
  @ApiOperation({ summary: 'تأیید، پرداخت یا لغو تسویه' })
  updateStatus(
    @Param('salonId') salonId: string,
    @Param('settlementId') settlementId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSettlementStatusDto,
  ) {
    return this.service.updateStatus(salonId, settlementId, user, dto);
  }
}
