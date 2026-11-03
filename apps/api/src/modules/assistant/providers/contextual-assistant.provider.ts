import { Injectable } from '@nestjs/common';
import { AssistantBusinessService } from '../assistant-business.service';
import { AssistantWorkflowService } from '../assistant-workflow.service';
import { AssistantUnderstandingService, type UnderstandingPlan } from '../assistant-understanding.service';
import { hasPhrase, normalizePersian } from '../persian-text';
import { groundAssistantSlots, isExplicitSalonDiscovery } from '../assistant-grounding';
import type { ModelRequest } from '../assistant.types';
import { InternalKnowledgeProvider } from './internal-knowledge.provider';
import type { AssistantProvider, ProviderResult } from './assistant-provider';

@Injectable()
export class ContextualAssistantProvider implements AssistantProvider {
  // Keep the public provider identifier compatible with deployed health checks.
  readonly name = 'internal-knowledge';
  constructor(
    private readonly internal: InternalKnowledgeProvider,
    private readonly workflows: AssistantWorkflowService,
    private readonly understanding: AssistantUnderstandingService,
    private readonly businesses: AssistantBusinessService,
  ) {}
  isReady() { return true; }
  capabilities() {
    return { workflowGuidance: true, ...this.understanding.status() };
  }
  async respond(request: ModelRequest): Promise<ProviderResult> {
    const guide = this.workflows.respond(request);
    if (guide) return guide;
    const business = this.businesses.get(request.businessId || 'parnegarin');
    const message = request.history.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    if (business.parnegarinTools && /(?:لغو|کنسل|تغییر).*(?:نوبت|رزرو)|(?:نوبت|رزرو).*(?:لغو|کنسل)/.test(normalizePersian(message))) {
      const article = business.knowledge.find(article => article.id === 'cancellation');
      if (article) return { content: `${article.title}\n${article.text}`,
        citations: [{ title: article.title, url: article.path }], state: request.state };
    }
    if (business.parnegarinTools && /مقایسه|کدوم.*(?:بهتر|ارزون|ارزان)|فرق.*(?:سالن|گزینه)/.test(normalizePersian(message)))
      return this.compare(request);
    if (/^(سلام|درود|ممنون|مرسی|خداحافظ)$/.test(normalizePersian(message))) return this.internal.respond(request);
    if (business.parnegarinTools && isExplicitSalonDiscovery(request)) {
      const { ambiguous, ...slots } = groundAssistantSlots(request);
      if (ambiguous) return { content: 'برای جست‌وجوی دقیق، یک شهر و یک خدمت مشخص کنید. اگر انتخاب قبلی را نمی‌خواهید، جایگزین موردنظرتان را صریح بگویید.', state: request.state };
      if (slots.city && slots.service) {
        const canonical = this.command({ action: 'search', articleIds: [], workflowId: '', ...slots }, message)!;
        const history = [...request.history];
        for (let i = history.length - 1; i >= 0; i--) if (history[i].role === 'user') { history[i] = { role: 'user', content: canonical }; break; }
        return this.internal.respond({ ...request, history,
          state: slots.gender === 'ALL' ? { ...request.state, gender: undefined } : request.state });
      }
    }
    const plan = await this.understanding.plan(request, business.knowledge.map(({ id, title }) => ({ id, title })), this.workflows.catalog(business.assistantId));
    if (!plan) return this.internal.respond(request);
    if (plan.action === 'compare' && business.parnegarinTools) return this.compare(request);
    if (plan.action === 'workflow') {
      const result = this.workflows.respond(request, plan.workflowId);
      if (result) return result;
    }
    if (plan.action === 'knowledge') {
      const articles = business.knowledge.filter(article => plan.articleIds.includes(article.id));
      return {
        content: articles.map(article => `${article.title}\n${article.text}`).join('\n\n'),
        citations: articles.map(article => ({ title: article.title, url: article.path })),
        state: request.state,
      };
    }
    if (plan.action === 'clarify' || plan.action === 'unrelated') return {
      content: plan.action === 'clarify'
        ? 'برای پاسخ دقیق‌تر، منظورتان راهنمای کار با همین صفحه است یا اطلاعات یک مرکز و نوبت؟ می‌توانید «راهنمای این صفحه» را بزنید یا شهر و خدمت موردنظر را بگویید.'
        : `من برای راهنمایی در ${business.name} و اطلاعات مجاز همان سامانه آماده‌ام. برای موضوعی بیرون از دانش آن پاسخ قابل اتکا ندارم.`,
      state: request.state,
      suggestions: [{ id: 'clarify-page', label: 'راهنمای این صفحه', prompt: 'در این صفحه چه کار کنم؟' }],
    };
    if (!business.parnegarinTools) return this.internal.respond(request);
    const canonical = this.command(plan, message);
    if (!canonical) return this.internal.respond(request);
    const history = [...request.history];
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') { history[i] = { role: 'user', content: canonical }; break; }
    }
    // Only the existing domain tools execute queries and check ownership/roles.
    return this.internal.respond({ ...request, history,
      state: plan.gender === 'ALL' ? { ...request.state, gender: undefined } : request.state,
    });
  }

  private async compare(request: ModelRequest): Promise<ProviderResult> {
    const choices = request.state?.choices?.filter(choice => choice.slug) || [];
    if (choices.length < 2) return {
      content: 'برای مقایسه باید حداقل دو مرکز از نتیجه واقعی سامانه داشته باشیم. شهر و خدمت را بگویید تا گزینه‌ها را پیدا کنیم؛ بعد می‌توانید بگویید «گزینه اول و دوم را مقایسه کن». فاصله بدون موقعیت معتبر شما محاسبه نمی‌شود.',
      state: request.state,
    };
    const message = normalizePersian(request.history.filter(m => m.role === 'user').slice(-1)[0]?.content || '');
    const indexes = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم'].map((word, i) =>
      hasPhrase(message, word) || new RegExp(`(?:^|\\s)${i + 1}(?:\\s|$)`).test(message) ? i : -1).filter(i => i >= 0);
    const selected = indexes.length ? indexes.map(i => choices[i]).filter(Boolean).slice(0, 3) : choices.slice(0, 3);
    if (selected.length < 2) return { content: 'دو گزینه معتبر از فهرست فعلی را برای مقایسه مشخص کنید.', state: request.state };
    const citations: Array<{ title: string; url?: string }> = [];
    const rows: string[] = [];
    try {
      for (const choice of selected) {
        const result = await request.executeTool('salon_details', { slug: choice.slug });
        const detail = result.data as {
          name: string; rating?: number; reviewCount?: number;
          services?: Array<{ name: string; durationMinutes?: number; price?: { amountToman: number } }>;
        };
        const services = (detail.services || []).filter(service => !request.state?.service ||
          normalizePersian(service.name).includes(normalizePersian(request.state.service))).slice(0, 3);
        const prices = services.map(service => `${service.name}: ${typeof service.price?.amountToman === 'number'
          ? service.price.amountToman.toLocaleString('fa-IR') + ' تومان' : 'قیمت ثبت نشده'}` +
          (service.durationMinutes ? `، ${service.durationMinutes} دقیقه` : ''));
        rows.push(`${detail.name}\n${detail.reviewCount ? `امتیاز ${detail.rating} از ${detail.reviewCount} نظر` : 'هنوز نظری ثبت نشده'}\n` +
          (prices.length ? prices.join('\n') : 'خدمت مطابق انتخاب فعلی در جزئیات دریافتی نیست.'));
        citations.push(...(result.sources || []));
      }
      return {
        content: rows.join('\n\n') + '\n\nقیمت‌ها را فقط برای خدمت و مدت مشابه مقایسه کنید. فاصله و کیفیت تضمینی از این داده‌ها قابل نتیجه‌گیری نیست؛ برای فاصله از محدوده نقشه استفاده کنید.',
        citations, state: request.state,
      };
    } catch {
      return { content: 'دریافت جزئیات مقایسه کامل نشد؛ برای جلوگیری از نتیجه گمراه‌کننده رتبه‌بندی نمی‌کنم. دوباره تلاش کنید یا صفحه مراکز را باز کنید.', state: request.state };
    }
  }

  private command(plan: UnderstandingPlan, original: string): string | undefined {
    const verbs: Partial<Record<UnderstandingPlan['action'], string>> = {
      search: 'سالن پیدا کن', details: 'قیمت و خدمات', availability: 'وقت خالی',
      mine: 'نوبت های من', owner: 'خلاصه وضعیت امروز', staff: 'برنامه امروز',
    };
    const verb = verbs[plan.action];
    if (!verb) return undefined;
    const normalized = normalizePersian(original);
    const literalDate = normalized.match(/\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/)?.[0];
    const temporal = ['هفته قبل', 'هفته گذشته', 'ماه قبل', 'ماه گذشته', 'سال قبل', 'سال گذشته', 'پس فردا', 'پریروز', 'دیروز', 'فردا', 'امروز', 'چهارشنبه', 'پنجشنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'جمعه', 'شنبه'].find(day => hasPhrase(normalized, day));
    const date = literalDate || temporal || ({ today: 'امروز', tomorrow: 'فردا', nearest: 'اولین وقت' } as Record<string, string>)[plan.date] || plan.date;
    return [verb, plan.city, plan.service, plan.gender === 'FEMALE' ? 'بانوان' : plan.gender === 'MALE' ? 'آقایان' : plan.gender === 'UNISEX' ? 'عمومی' : '',
      plan.choice ? `گزینه ${['اول', 'دوم', 'سوم', 'چهارم', 'پنجم'][plan.choice - 1]}` : '', date].filter(Boolean).join(' ');
  }
}
