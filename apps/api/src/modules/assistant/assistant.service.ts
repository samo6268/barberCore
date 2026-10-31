import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AssistantChatDto } from './assistant.dto';
import { ASSISTANT_PROVIDER, type AssistantProvider } from './providers/assistant-provider';

@Injectable()
export class AssistantService {
  constructor(@Inject(ASSISTANT_PROVIDER) private readonly provider: AssistantProvider) {}

  getManifest(assistantId: string) {
    if (assistantId !== 'parnegarin') throw new NotFoundException('Assistant manifest not found');
    return {
      assistantId: 'parnegarin', businessId: 'parnegarin', name: 'همراه پرنگارین', characterName: 'میمو',
      locale: 'fa-IR', direction: 'rtl', greeting: 'سلام، من میمو هستم؛ چطور می‌توانم کمکتان کنم؟',
      inputPlaceholder: 'از میمو بپرسید…', disclosure: 'میمو یک دستیار هوشمند است؛ عملیات مهم فقط با تأیید شما انجام می‌شود.',
    };
  }

  async chat(dto: AssistantChatDto) {
    const result = await this.provider.respond(dto);
    return {
      conversationId: dto.conversationId || randomUUID(),
      message: { id: randomUUID(), role: 'assistant', content: result.content, createdAt: new Date().toISOString(), citations: result.citations },
    };
  }

  confirmAction(actionId: string) {
    return {
      conversationId: randomUUID(),
      message: { id: randomUUID(), role: 'assistant', content: `اقدام ${actionId} در نسخه فعلی اجرا نشد. ابزارهای تغییردهنده تا زمان تکمیل کنترل مجوز و ثبت رویداد، عمداً غیرفعال هستند.`, createdAt: new Date().toISOString() },
    };
  }
}
