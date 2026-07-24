import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto, UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me') @ApiOperation({ summary: 'پروفایل من' })
  getMe(@CurrentUser() u: JwtPayload) { return this.service.getProfile(u.sub); }

  @Patch('me') @ApiOperation({ summary: 'ویرایش پروفایل' })
  updateMe(@CurrentUser() u: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.service.updateProfile(u.sub, dto);
  }

  @Post('become-owner') @ApiOperation({ summary: 'ثبت به عنوان مالک سالن' })
  becomeOwner(@CurrentUser() u: JwtPayload) { return this.service.becomeSalonOwner(u.sub); }
}
