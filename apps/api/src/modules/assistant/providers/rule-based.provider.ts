import { Injectable } from '@nestjs/common';
import type { AssistantChatDto } from '../assistant.dto';
import type { AssistantProvider, ProviderResult } from './assistant-provider';

@Injectable()
export class RuleBasedAssistantProvider implements AssistantProvider {
  readonly name = 'rule-based-mvp';

  async respond(request: AssistantChatDto): Promise<ProviderResult> {
    const message = request.message.toLocaleLowerCase('fa-IR');
    const route = request.context.route || '/';

    if (message.includes('وقت') || message.includes('نوبت') || message.includes('رزرو')) {
      return { content: route.includes('/dashboard') || route.includes('/staff')
        ? 'می‌توانم برنامه نوبت‌ها، بازه‌های خالی و وضعیت مراجعه‌ها را برایتان خلاصه کنم. در نسخه فعلی فقط اطلاعات را توضیح می‌دهم و هیچ تغییری بدون پیش‌نمایش و تأیید شما انجام نمی‌شود.'
        : 'برای پیدا کردن وقت مناسب، خدمت، شهر یا محدوده و زمان ترجیحی‌تان را بگویید. سپس می‌توانیم سالن‌ها و نزدیک‌ترین زمان‌های آزاد را مقایسه کنیم.' };
    }

    if (message.includes('گزارش') || message.includes('درآمد') || message.includes('فروش')) {
      return { content: 'این درخواست به گزارش‌های کسب‌وکار مربوط است. پس از اتصال ابزار گزارش، پاسخ با کارت شاخص‌ها، روند زمانی و پیشنهاد اقدام نمایش داده می‌شود. دسترسی هر گزارش بر اساس نقش و سالن کاربر کنترل خواهد شد.' };
    }

    if (message.includes('این صفحه') || message.includes('راهنما')) {
      return { content: this.pageHelp(route) };
    }

    if (message.includes('سلام')) {
      return { content: `سلام${request.identity?.displayName ? ` ${request.identity.displayName}` : ''}! من میمو هستم. صفحه‌ای را که در آن هستید می‌شناسم و می‌توانم برای پیدا کردن خدمت، رزرو، مدیریت نوبت‌ها و توضیح گزارش‌ها همراهتان باشم.` };
    }

    return { content: `درخواست شما را درباره «${request.message}» دریافت کردم. هسته میمو و Context این صفحه فعال است؛ اتصال مدل زبانی و ابزارهای عملیاتی در مرحله بعدی انجام می‌شود تا پاسخ دقیق و قابل اقدام ارائه کنم.` };
  }

  private pageHelp(route: string): string {
    if (route === '/') return 'در صفحه اصلی می‌توانم برای انتخاب خدمت، شهر، محدوده و پیدا کردن سالن مناسب کمک کنم.';
    if (route.startsWith('/salons/') && route.includes('/book')) return 'در این مرحله می‌توانم خدمات انتخاب‌شده، متخصص و زمان رزرو را مرور کنم و پیش از ثبت، خلاصه نهایی نشان بدهم.';
    if (route.startsWith('/salons/')) return 'در صفحه سالن می‌توانم خدمات، متخصصان، قیمت، امتیاز و اولین زمان آزاد را با هم مقایسه کنم.';
    if (route.startsWith('/salons')) return 'در نتایج جست‌وجو می‌توانم فیلتر شهر، محدوده، قیمت، امتیاز و زمان آزاد را بر اساس نیاز شما تنظیم کنم.';
    if (route.startsWith('/dashboard')) return 'در پنل مدیریت می‌توانم نوبت‌ها، بازه‌های خالی، عملکرد کارکنان و شاخص‌های سالن را توضیح بدهم.';
    if (route.startsWith('/staff')) return 'در پنل متخصص می‌توانم برنامه امروز، مشتری بعدی، وضعیت نوبت و سوابق تسویه را خلاصه کنم.';
    return 'می‌توانم امکانات همین صفحه را توضیح بدهم و کار بعدی مناسب را پیشنهاد کنم.';
  }
}
