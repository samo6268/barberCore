import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { BookingService, CreateBookingDto } from './booking.service';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Booking')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get('availability')
  @ApiOperation({ summary: 'زمان‌های آزاد رزرو' })
  @ApiQuery({ name: 'salonId', required: true })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'serviceIds', required: true, description: 'شناسه خدمات، جداشده با ویرگول' })
  @ApiQuery({ name: 'serviceId', required: false, deprecated: true })
  @ApiQuery({ name: 'staffId', required: false })
  getAvailability(
    @Query('salonId') salonId: string,
    @Query('date') date: string,
    @Query('serviceIds') serviceIdsParam?: string,
    @Query('serviceId') legacyServiceId?: string,
    @Query('staffId') staffId?: string,
  ) {
    const serviceIds = (serviceIdsParam ?? legacyServiceId ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return this.availabilityService.getAvailableSlots(salonId, date, serviceIds, staffId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'ایجاد رزرو جدید' })
  create(@CurrentUser() u: JwtPayload, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(u.sub, dto);
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'رزروهای من' })
  findMine(@CurrentUser() u: JwtPayload, @Query() pagination: PaginationDto) {
    return this.bookingService.findMyBookings(u.sub, pagination);
  }

  @Get('salon/:salonId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'رزروهای سالن (برای مالک)' })
  @ApiQuery({ name: 'date', required: false })
  findSalon(
    @Param('salonId') salonId: string,
    @CurrentUser() u: JwtPayload,
    @Query('date') date?: string,
  ) {
    return this.bookingService.findSalonBookings(salonId, u.sub, date);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'لغو رزرو' })
  cancel(@Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() body: { reason?: string }) {
    return this.bookingService.cancel(id, u.sub, body.reason);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'تغییر وضعیت رزرو (مالک سالن)' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() u: JwtPayload,
    @Body() body: { status: BookingStatus },
  ) {
    return this.bookingService.updateStatus(id, u.sub, body.status);
  }
}
