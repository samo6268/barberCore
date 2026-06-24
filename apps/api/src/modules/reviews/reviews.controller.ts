import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Get('salon/:salonId')
  @ApiOperation({ summary: 'نظرات سالن' })
  findBySalon(@Param('salonId') salonId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.findBySalon(salonId, +page, +limit);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'ثبت نظر' })
  create(@CurrentUser() u: JwtPayload, @Body() dto: { bookingId: string; rating: number; comment?: string }) {
    return this.service.create(u.sub, dto);
  }

  @Post(':id/reply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'پاسخ مالک به نظر' })
  reply(@Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() body: { replyText: string }) {
    return this.service.reply(id, u.sub, body.replyText);
  }
}
