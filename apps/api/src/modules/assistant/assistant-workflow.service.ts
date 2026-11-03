import { Injectable, Optional } from '@nestjs/common';
import { AssistantBusinessService } from './assistant-business.service';
import { ASSISTANT_WORKFLOWS, WORKFLOW_ISSUES, type WorkflowDefinition } from './assistant-workflows';
import { normalizePersian } from './persian-text';
import type { ModelRequest } from './assistant.types';
import type { ProviderResult } from './providers/assistant-provider';

@Injectable()
export class AssistantWorkflowService {
  constructor(@Optional() private readonly businesses?: AssistantBusinessService) {}
  private definitions(businessId: string): WorkflowDefinition[] {
    if (businessId === 'parnegarin') return ASSISTANT_WORKFLOWS;
    return (this.businesses?.get(businessId).workflows || []).map(flow => ({
      ...flow,
      routes: flow.paths.map(path => {
        const prefix = path.endsWith('/*');
        const escaped = (prefix ? path.slice(0, -1) : path).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp('^' + escaped + (prefix ? '.*$' : '/?$'));
      }),
    }));
  }
  catalog(businessId: string) {
    return this.definitions(businessId).map(({ id, title }) => ({ id, title }));
  }

  respond(request: ModelRequest, forcedId?: string): ProviderResult | undefined {
    const definitions = this.definitions(request.businessId || 'parnegarin');
    const original = request.history.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    const message = normalizePersian(original);
    const route = (request.page?.route || '/').split(/[?#]/)[0];
    const active = definitions.find(flow => flow.routes.some(pattern => pattern.test(route)));
    const help = /این صفحه|این بخش|قدم|مرحله|بعدش|^(?:بعدی|قبلی|توضیح بده|راهنمایی کن)$|حالا چی|الان چی|الان چه|چه کار کنم|چیکار|گیر کردم|متوجه نشدم|نمی فهمم|غیرفعال|ذخیره نمی|ارور می|دکمه.*(?:کار نمی|فعال نیست)|ادامه بدم|ادامه بدهم|چرا.*(?:نمیشه|نمی شه|نمی رود|خطا)|از کجا شروع/.test(message);
    const explicit = /چطور|چگونه|نحوه|راهنما|می خوام|میخوام/.test(message)
      ? /ثبت سالن|افزودن سالن|سالن جدید/.test(message) ? 'salon-create'
        : /ثبت خدمت|افزودن خدمت|تغییر قیمت/.test(message) ? 'services'
          : /رزرو کنم|نوبت بگیرم|وقت بگیرم/.test(message) ? 'booking'
            : undefined
      : undefined;
    const completionQuestion = !!active && ['booking', 'salon-create', 'salon-onboarding', 'salon-settings', 'services', 'staff-schedule'].includes(active.id)
      && /(?:ثبت|ذخیره|ارسال).*(?:شد|شده|موفق)/.test(message);
    if (!forcedId && !help && !explicit && !completionQuestion) return undefined;
    const definition = definitions.find(flow => flow.id === (forcedId || explicit)) || active;
    if (!definition) return undefined;
    // The client can report progress only for the workflow registered for this route.
    const hints = active?.id === definition.id && request.page?.workflow?.id === definition.id
      ? request.page.workflow : undefined;
    const stepFromPage = hints?.stepId ? definition.steps.findIndex(s => s.id === hints.stepId) : -1;
    const saved = request.state?.guide;
    let index = stepFromPage >= 0 ? stepFromPage
      : saved?.id === definition.id && saved.route === route ? saved.step : 0;
    const next = /بعدش|بعدی|مرحله بعد|قدم بعد|ادامه/.test(message);
    const previous = /مرحله قبل|قدم قبل|قبلی/.test(message);
    // Navigation through explanations never advances the actual form or claims it is saved.
    if (!hints && next) index++;
    if (!hints && previous) index--;
    if (/از اول|شروع کن/.test(message)) index = 0;
    index = Math.max(0, Math.min(definition.steps.length - 1, index));
    const current = definition.steps[index];
    const issues = [...new Set(hints?.issues || [])].filter(code => WORKFLOW_ISSUES[code]);
    const requiredRole = definition.roles?.length && !definition.roles.includes(request.actor?.role || '')
      ? '\nبرای اجرای این مراحل به حساب با نقش مناسب و مجوز همان سالن نیاز دارید.' : '';
    const sourceNote = hints ? 'طبق وضعیت همین فرم،' : 'در راهنمای این فرایند،';
    const blocked = /چرا|خطا|ارور|غیرفعال|گیر کردم|نمی شه|نمیشه|نمی کند/.test(message);
    const explanation = issues.length
      ? 'مواردی که در همین صفحه نیاز به بررسی دارند:\n' + issues.map(code => '• ' + WORKFLOW_ISSUES[code]).join('\n') + '\n\n'
      : blocked ? 'از اطلاعات فعلی صفحه علت قطعی مشخص نیست. متن خطای قابل مشاهده و نام مرحله را بگویید؛ اطلاعات شخصی، رمز یا کد ورود را نفرستید.\n\n' : '';
    const destination = this.destination(definition, route);
    return {
      content: `${completionQuestion ? 'از وضعیت فرم به‌تنهایی نمی‌توانم ذخیره قطعی را تأیید کنم؛ پیام موفقیت و رکورد ثبت‌شده در صفحه مربوط را بررسی کنید.\n\n' : ''}${explanation}${sourceNote} مرحله ${index + 1} از ${definition.steps.length}: ${current.title}\n${current.instruction}` +
        (hints && next ? '\nپیشرفت واقعی از خود صفحه انجام می‌شود؛ میمو فرم را جلو نمی‌برد.' : '') +
        (definition.note ? '\n\n' + definition.note : '') + requiredRole,
      state: { ...request.state, guide: { id: definition.id, step: index, route } },
      citations: [{ title: definition.title, url: destination }],
      guide: {
        id: definition.id, title: definition.title, currentStep: index + 1,
        totalSteps: definition.steps.length, source: hints ? 'page-state' : 'guide',
        href: destination === route ? undefined : destination,
        steps: definition.steps.map((s, i) => ({ id: s.id, title: s.title, current: i === index })),
      },
      suggestions: [
        { id: 'flow-explain', label: 'توضیح این مرحله', prompt: 'این مرحله را بیشتر توضیح بده' },
        ...(hints ? [] : [{ id: 'flow-next', label: 'مرحله بعدی', prompt: 'مرحله بعدی چیست؟' }]),
        { id: 'flow-blocked', label: 'چرا نمی‌توانم ادامه بدهم؟', prompt: 'چرا این مرحله ادامه پیدا نمی‌کند؟' },
      ],
    };
  }

  private destination(flow: WorkflowDefinition, route: string) {
    if (flow.id === 'salon-onboarding') return '/dashboard/salons/new';
    return flow.routes.some(pattern => pattern.test(route)) && /^\/(?![\/\\])[^\\\u0000-\u0020]*$/.test(route)
      ? route : flow.path;
  }
}
