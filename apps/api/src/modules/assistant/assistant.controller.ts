import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssistantChatDto } from './assistant.dto';
import { AssistantService } from './assistant.service';

@ApiTags('Assistant')
@Controller('assistant')
export class AssistantController {
  constructor(private readonly service: AssistantService) {}

  @Get('manifests/:assistantId')
  @ApiOperation({ summary: 'دریافت تنظیمات عمومی دستیار' })
  manifest(@Param('assistantId') assistantId: string) { return this.service.getManifest(assistantId); }

  @Post('chat')
  @ApiOperation({ summary: 'ارسال پیام به دستیار زمینه‌آگاه' })
  chat(@Body() dto: AssistantChatDto) { return this.service.chat(dto); }

  @Post('actions/:actionId/confirm')
  @ApiOperation({ summary: 'تأیید صریح یک اقدام آماده‌شده' })
  confirm(@Param('actionId') actionId: string) { return this.service.confirmAction(actionId); }
}
