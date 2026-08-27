import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateStaffTimeOffDto,
  StaffBookingQueryDto,
  StaffBookingStatusDto,
  StaffContextDto,
  StaffDayQueryDto,
  UpdateStaffProfileDto,
  UpdateStaffScheduleDto,
} from './staff-portal.dto';
import { StaffPortalService } from './staff-portal.service';

@ApiTags('Staff Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('staff-portal')
export class StaffPortalController {
  constructor(private readonly service: StaffPortalService) {}

  @Get('memberships')
  @ApiOperation({ summary: 'سالن‌های قابل دسترس برای کاربر جاری' })
  memberships(@CurrentUser() user: JwtPayload) {
    return this.service.memberships(user.sub);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'خلاصه عملیات روزانه کارمند' })
  dashboard(@CurrentUser() user: JwtPayload, @Query() query: StaffDayQueryDto) {
    return this.service.dashboard(user.sub, query.salonId, query.date);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'تقویم رزروهای منتسب به کارمند' })
  bookings(@CurrentUser() user: JwtPayload, @Query() query: StaffBookingQueryDto) {
    return this.service.bookings(user.sub, query);
  }

  @Patch('bookings/:bookingId/status')
  @ApiOperation({ summary: 'تغییر کنترل‌شده وضعیت رزرو توسط کارمند' })
  updateBookingStatus(
    @CurrentUser() user: JwtPayload,
    @Param('bookingId') bookingId: string,
    @Body() dto: StaffBookingStatusDto,
  ) {
    return this.service.updateBookingStatus(user.sub, bookingId, dto);
  }

  @Get('schedule')
  @ApiOperation({ summary: 'برنامه هفتگی و زمان‌های مسدود کارمند' })
  schedule(@CurrentUser() user: JwtPayload, @Query() query: StaffContextDto) {
    return this.service.schedule(user.sub, query.salonId);
  }

  @Put('schedule')
  @ApiOperation({ summary: 'ویرایش برنامه هفتگی شخصی' })
  updateSchedule(@CurrentUser() user: JwtPayload, @Body() dto: UpdateStaffScheduleDto) {
    return this.service.updateSchedule(user.sub, dto);
  }

  @Post('time-off')
  @ApiOperation({ summary: 'ثبت مرخصی یا زمان مسدود شخصی' })
  createTimeOff(@CurrentUser() user: JwtPayload, @Body() dto: CreateStaffTimeOffDto) {
    return this.service.createTimeOff(user.sub, dto);
  }

  @Delete('time-off/:timeOffId')
  @ApiOperation({ summary: 'حذف زمان مسدود آینده' })
  deleteTimeOff(
    @CurrentUser() user: JwtPayload,
    @Param('timeOffId') timeOffId: string,
    @Query() query: StaffContextDto,
  ) {
    return this.service.deleteTimeOff(user.sub, query.salonId, timeOffId);
  }

  @Get('settlements')
  @ApiOperation({ summary: 'تسویه‌های شخصی به‌صورت فقط خواندنی' })
  settlements(@CurrentUser() user: JwtPayload, @Query() query: StaffContextDto) {
    return this.service.settlements(user.sub, query.salonId);
  }

  @Get('settlements/:settlementId')
  @ApiOperation({ summary: 'جزئیات یک تسویه شخصی' })
  settlement(
    @CurrentUser() user: JwtPayload,
    @Param('settlementId') settlementId: string,
    @Query() query: StaffContextDto,
  ) {
    return this.service.settlement(user.sub, query.salonId, settlementId);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'اعلان‌های شخصی کارمند' })
  notifications(@CurrentUser() user: JwtPayload, @Query() query: StaffContextDto) {
    return this.service.notifications(user.sub, query.salonId);
  }

  @Patch('notifications/read-all')
  @ApiOperation({ summary: 'خوانده‌شدن همه اعلان‌های سالن' })
  readAllNotifications(@CurrentUser() user: JwtPayload, @Body() dto: StaffContextDto) {
    return this.service.readAllNotifications(user.sub, dto.salonId);
  }

  @Patch('notifications/:notificationId/read')
  @ApiOperation({ summary: 'خوانده‌شدن یک اعلان' })
  readNotification(
    @CurrentUser() user: JwtPayload,
    @Param('notificationId') notificationId: string,
    @Body() dto: StaffContextDto,
  ) {
    return this.service.readNotification(user.sub, dto.salonId, notificationId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'پروفایل حرفه‌ای کارمند و خدمات منتسب' })
  profile(@CurrentUser() user: JwtPayload, @Query() query: StaffContextDto) {
    return this.service.profile(user.sub, query.salonId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'ویرایش اطلاعات عمومی پروفایل شخصی' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateStaffProfileDto) {
    return this.service.updateProfile(user.sub, dto);
  }
}
