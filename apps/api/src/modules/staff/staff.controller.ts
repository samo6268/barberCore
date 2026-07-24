import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  StaffService,
  CreateStaffDto,
  UpdateStaffDto,
  UpdateStaffCompensationDto,
} from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Staff')
@Controller('salons/:salonId/staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get('management')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  findManagement(@Param('salonId') salonId: string, @CurrentUser() u: JwtPayload) {
    return this.service.findManagementBySalon(salonId, u.sub);
  }

  @Get() findAll(@Param('salonId') salonId: string) { return this.service.findBySalon(salonId); }

  @Post() @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  create(@Param('salonId') sid: string, @CurrentUser() u: JwtPayload, @Body() dto: CreateStaffDto) {
    return this.service.create(sid, u.sub, dto);
  }

  @Patch(':id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  update(@Param('salonId') sid: string, @Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() dto: UpdateStaffDto) {
    return this.service.update(id, sid, u.sub, dto);
  }

  @Put(':id/services') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  assignServices(@Param('salonId') sid: string, @Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() body: { serviceIds: string[] }) {
    return this.service.assignServices(id, sid, u.sub, body.serviceIds);
  }

  @Delete(':id') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  remove(@Param('salonId') sid: string, @Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return this.service.remove(id, sid, u.sub);
  }

  @Put(':id/compensation')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALON_OWNER, UserRole.SUPER_ADMIN)
  updateCompensation(
    @Param('salonId') sid: string,
    @Param('id') id: string,
    @CurrentUser() u: JwtPayload,
    @Body() dto: UpdateStaffCompensationDto,
  ) {
    return this.service.updateCompensation(id, sid, u.sub, dto);
  }
}
