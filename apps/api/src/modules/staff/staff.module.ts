import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { StaffPortalController } from './staff-portal.controller';
import { StaffPortalService } from './staff-portal.service';

@Module({
  controllers: [StaffController, StaffPortalController],
  providers: [StaffService, StaffPortalService],
  exports: [StaffService, StaffPortalService],
})
export class StaffModule {}
