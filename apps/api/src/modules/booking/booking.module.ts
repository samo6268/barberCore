import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { AvailabilityService } from './availability.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, AvailabilityService],
  exports: [BookingService],
})
export class BookingModule {}
