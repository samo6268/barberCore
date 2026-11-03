import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { AssistantChatDto } from './assistant.dto';
import { AssistantService } from './assistant.service';
import { AssistantAuthGuard } from './assistant-auth.guard';

@ApiTags('Assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly service: AssistantService) {}
  @Get('status') status() {
    return this.service.status();
  }
  @Get('manifests/:assistantId') manifest(@Param('assistantId') assistantId: string) {
    return this.service.getManifest(assistantId);
  }
  @Post('chat')
  @UseGuards(ThrottlerGuard, AssistantAuthGuard)
  @Throttle({
    short: { limit: 2, ttl: 1000 },
    medium: { limit: 5, ttl: 10000 },
    long: { limit: 20, ttl: 60000 },
  })
  @ApiOperation({ summary: 'راهنمای زمینه‌مند و پاسخ مستند با ابزارهای مجاز و مدل محلی اختیاری' })
  chat(@Body() dto: AssistantChatDto, @CurrentUser() user?: JwtPayload) {
    return this.service.chat(dto, user);
  }
  @Post('actions/:actionId/confirm')
  @UseGuards(AssistantAuthGuard)
  confirm(@Param('actionId') actionId: string) {
    return this.service.confirmAction(actionId);
  }
}
