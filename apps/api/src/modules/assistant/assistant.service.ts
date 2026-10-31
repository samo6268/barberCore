import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { AssistantChatDto } from './assistant.dto';
import { ASSISTANT_PROVIDER, type AssistantProvider } from './providers/assistant-provider';
import { AssistantBusinessService } from './assistant-business.service';
import { AssistantToolsService } from './assistant-tools.service';
import { AssistantSessionService } from './assistant-session.service';
import type { AssistantActor } from './assistant.types';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  constructor(
    @Inject(ASSISTANT_PROVIDER) private readonly provider: AssistantProvider,
    private readonly businesses: AssistantBusinessService,
    private readonly tools: AssistantToolsService,
    private readonly sessions: AssistantSessionService,
    private readonly prisma: PrismaService,
  ) {}
  status() {
    return {
      ready: this.provider.isReady(),
      provider: this.provider.name,
      mode: 'read-only',
      privateDataRequiresLogin: true,
      externalModel: false,
      requiresModelKey: false,
    };
  }
  getManifest(assistantId: string) {
    const business = this.businesses.get(assistantId);
    return {
      assistantId: business.assistantId,
      businessId: business.assistantId,
      name: `همراه ${business.name}`,
      characterName: 'میمو',
      locale: 'fa-IR',
      direction: 'rtl',
      greeting: 'سلام، من میمو هستم؛ چطور می‌توانم کمکتان کنم؟',
      inputPlaceholder: 'از میمو بپرسید…',
      disclosure:
        'پاسخ از دانش داخلی و داده‌های مجاز همین سامانه است؛ سرویس مدل خارجی استفاده نمی‌شود.',
      suggestions: [],
    };
  }
  async chat(dto: AssistantChatDto, verified?: JwtPayload) {
    const business = this.businesses.get(dto.assistantId);
    if (!this.provider.isReady())
      throw new ServiceUnavailableException('موتور راهنمای داخلی در دسترس نیست.');
    let actor: AssistantActor | undefined;
    if (verified) {
      const user = await this.prisma.user.findUnique({
        where: { id: verified.sub },
        select: { id: true, role: true, isActive: true },
      });
      if (!user?.isActive) throw new UnauthorizedException('نشست کاربری معتبر نیست.');
      actor = { id: user.id, role: user.role };
    }
    // identity supplied by the browser is deliberately ignored.
    const principal = this.sessions.principal(business.assistantId, actor, dto.sessionToken);
    let session: Awaited<ReturnType<AssistantSessionService['start']>>;
    try {
      session = await this.sessions.start(principal.scope, dto.conversationId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException(
        'حافظه گفتگوی میمو در دسترس نیست. اتصال Redis را بررسی کنید.',
      );
    }
    const started = Date.now();
    try {
      const history = [...session.history, { role: 'user' as const, content: dto.message }];
      const result = await this.provider.respond({
        instructions: '',
        businessId: business.assistantId,
        actor,
        page: { route: dto.context.route.split('?')[0], entityId: dto.context.entityId },
        state: session.state,
        history,
        tools: this.tools.definitions(business.assistantId, actor),
        executeTool: (name, input) => this.tools.execute(business.assistantId, actor, name, input),
      });
      await this.sessions.save(
        session.id,
        principal.scope,
        [
          ...history,
          {
            role: 'assistant',
            content:
              result.content +
              (result.citations?.length ? '\nمراجع پاسخ: ' + JSON.stringify(result.citations) : ''),
          },
        ],
        result.state,
      );
      this.logger.log({
        event: 'assistant_turn',
        assistantId: business.assistantId,
        durationMs: Date.now() - started,
        authenticated: !!actor,
      });
      return {
        conversationId: session.id,
        sessionToken: principal.sessionToken,
        message: {
          id: randomUUID(),
          role: 'assistant',
          content: result.content,
          createdAt: new Date().toISOString(),
          citations: result.citations ?? [],
        },
      };
    } finally {
      await this.sessions
        .release(session.id, session.lock)
        .catch(() => this.logger.warn({ event: 'assistant_unlock_failed' }));
    }
  }
  confirmAction(_actionId: string): never {
    throw new ForbiddenException(
      'میمو در حالت فقط‌خواندنی است و هیچ عملیات تغییردهنده‌ای اجرا نمی‌کند.',
    );
  }
}
