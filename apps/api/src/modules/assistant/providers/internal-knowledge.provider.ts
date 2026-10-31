import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { AssistantBusinessService, type KnowledgeArticle } from '../assistant-business.service';
import { IRAN_CITY_NAMES } from '../iran-city-names';
import { hasPhrase, meaningfulWords, normalizePersian } from '../persian-text';
import type { LocalAssistantState, ModelRequest, AssistantSource } from '../assistant.types';
import type { AssistantProvider, ProviderResult } from './assistant-provider';

interface Money {
  amountToman: number;
  unit: string;
}
interface SalonChoice {
  id: string;
  slug?: string;
  name: string;
}
interface PublicSalon extends SalonChoice {
  city?: string;
  rating?: number;
  reviewCount?: number;
  minPrice?: Money;
}
interface ServiceChoice {
  id: string;
  name: string;
  durationMinutes?: number;
  price?: Money;
}
interface Details extends PublicSalon {
  services: ServiceChoice[];
  staff?: Array<{ name: string }>;
  address?: string;
  reviews?: Array<{ rating: number; comment?: string }>;
}
interface CalendarDay {
  daysFromToday: number;
  gregorian: string;
  persian: string;
  persianDate?: string;
}
const cityNames = IRAN_CITY_NAMES.map((name) => ({ name, normalized: normalizePersian(name) }));
const services = [
  { query: 'فیشال', words: ['فیشال'] },
  { query: 'ژلیش', words: ['ژلیش'] },
  { query: 'پاکسازی', words: ['پاکسازی', 'پاک سازی'] },
  { query: 'کوتاهی', words: ['کوتاهی مو', 'کوتاه کردن مو', 'کوتاهی', 'haircut'] },
  { query: 'رنگ', words: ['رنگ مو', 'رنگ و لایت', 'رنگ و مش', 'لایت', 'هایلایت', 'رنگ'] },
  { query: 'ناخن', words: ['کاشت ناخن', 'ژلیش', 'مانیکور', 'پدیکور', 'ناخن'] },
  { query: 'پوست', words: ['مراقبت پوست', 'پاکسازی', 'پاک سازی', 'فیشال', 'پوست'] },
  { query: 'اصلاح', words: ['اصلاح ریش', 'اصلاح صورت', 'ریش', 'اصلاح'] },
  { query: 'میکاپ', words: ['میکاپ', 'میکاپ عروس', 'آرایش عروس', 'ارایش عروس'] },
  { query: 'ماساژ', words: ['ماساژ', 'massage'] },
  { query: 'اسپا', words: ['اسپا', 'spa'] },
];
const ordinals = [
  ['اول', 'اولی', 'اولین'],
  ['دوم', 'دومی', 'دومین'],
  ['سوم', 'سومی', 'سومین'],
  ['چهارم', 'چهارمی'],
  ['پنجم', 'پنجمی'],
];
function selectedIndex(message: string) {
  if (/اولین وقت|اولین زمان|نزدیک ترین وقت/.test(message)) return undefined;
  const exact = message.match(/^(?:(?:گزینه|سالن|خدمت|شماره)\s*)?([1-5])$/);
  if (exact) return Number(exact[1]) - 1;
  for (let n = 0; n < ordinals.length; n++)
    if (ordinals[n].some((word) => hasPhrase(message, word))) return n;
  return undefined;
}
function price(value?: Money) {
  return value ? `${value.amountToman.toLocaleString('fa-IR')} تومان` : 'قیمت ثبت نشده';
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('fa-IR', {
        timeZone: 'Asia/Tehran',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}
const statusNames: Record<string, string> = {
  PENDING: 'در انتظار',
  CONFIRMED: 'تأییدشده',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل‌شده',
  CANCELLED: 'لغوشده',
  NO_SHOW: 'عدم مراجعه',
};

@Injectable()
export class InternalKnowledgeProvider implements AssistantProvider {
  readonly name = 'internal-knowledge';
  constructor(private readonly businesses: AssistantBusinessService) {}
  isReady() {
    return true;
  }

  async respond(request: ModelRequest): Promise<ProviderResult> {
    const businessId = request.businessId || 'parnegarin';
    const business = this.businesses.get(businessId);
    const original =
      request.history.filter((message) => message.role === 'user').at(-1)?.content || '';
    const message = normalizePersian(original);
    const state: LocalAssistantState = { ...request.state };
    const sources: AssistantSource[] = [];
    const answer = (content: string): ProviderResult => ({ content, state, citations: sources });
    const run = async <T>(name: string, input: Record<string, unknown>): Promise<T> => {
      const result = await request.executeTool(name, input);
      for (const source of result.sources ?? [])
        if (!sources.some((s) => s.url === source.url && s.title === source.title))
          sources.push(source);
      return result.data as T;
    };
    const fromArticle = (article: KnowledgeArticle) => {
      sources.push({ title: article.title, url: article.path });
      return answer(`${article.title}\n${article.text}`);
    };
    const unknown = () =>
      answer(
        `برای این سؤال پاسخ مطمئنی در دانش «${business.name}» پیدا نکردم. می‌توانید موضوع را کوتاه‌تر بپرسید یا بگویید در کدام صفحه هستید. من راهنمای داخلی سامانه‌ام و گفتگوی آزاد یا تشخیص پزشکی انجام نمی‌دهم.`,
      );
    try {
      if (!message || /^(سلام|درود|سلام خوبی|سلام خوبی میمو|خوبی|هی|hello|hi)$/.test(message)) {
        return answer(
          `سلام! من میمو، راهنمای داخلی ${business.name} هستم. می‌توانم امکانات این صفحه را توضیح بدهم${business.parnegarinTools ? '، سالن پیدا کنم و اطلاعات مجاز نوبت‌ها را نشان بدهم' : ''}. چه کمکی لازم دارید؟`,
        );
      }
      if (/^(ممنون|مرسی|متشکرم|سپاس|خداحافظ|خدانگهدار)$/.test(message))
        return answer('خواهش می‌کنم؛ هر زمان برای کار با سامانه کمک خواستید اینجا هستم.');
      const isGuide =
        /چطور|چگونه|راهنما|از کجا|چیست|چیه|یعنی چه|نحوه|چه جوری|کجاست|کجا ببین|ببینم/.test(message);
      const pageHelp = /این صفحه|همین صفحه|در این بخش|امکانات صفحه|چه کارهایی/.test(message);
      if (pageHelp) {
        const route = request.page?.route || '/';
        const topic = route.startsWith('/staff/settlements')
          ? 'settlements'
          : route.startsWith('/staff')
            ? 'staff'
            : route.includes('/reports')
              ? 'reports'
              : route.includes('/services') && route.startsWith('/dashboard')
                ? 'services'
                : route.includes('/settlements')
                  ? 'settlements'
                  : route.startsWith('/dashboard')
                    ? 'salon-owner'
                    : route.startsWith('/academy')
                      ? 'academy'
                      : route.startsWith('/profile')
                        ? 'account'
                        : route.includes('/book')
                          ? 'booking'
                          : route.startsWith('/salons')
                            ? 'search'
                            : 'intro';
        const article = business.parnegarinTools
          ? business.knowledge.find((a) => a.id === topic)
          : (business.knowledge
              .filter(
                (a) =>
                  a.path && (route === a.path || route.startsWith(a.path.replace(/\/$/, '') + '/')),
              )
              .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0] ??
            this.businesses.rank(businessId, original)[0]?.article);
        return article ? fromArticle(article) : unknown();
      }
      if (
        /(?:لغو|کنسل|حذف|ثبت|رزرو|تغییر|ویرایش|پرداخت|تسویه).*(?:کن|بده|بزن|انجام)/.test(message) &&
        !isGuide
      ) {
        const topic = /لغو|کنسل|حذف|تغییر نوبت/.test(message)
          ? 'cancellation'
          : /پرداخت|تسویه/.test(message)
            ? 'settlements'
            : 'booking';
        const article = business.knowledge.find((a) => a.id === topic);
        return article
          ? fromArticle(article)
          : answer(
              'این دستیار فقط اطلاعات را می‌خواند و راهنمایی می‌کند؛ ثبت یا تغییر را از صفحه مربوط انجام دهید.',
            );
      }
      if (isGuide) {
        const match = this.businesses.rank(businessId, original)[0];
        if (match && (match.coverage >= 0.45 || match.score >= 10))
          return fromArticle(match.article);
        return unknown();
      }
      if (!business.parnegarinTools) {
        const match = this.businesses.rank(businessId, original)[0];
        return match && match.coverage >= 0.5 ? fromArticle(match.article) : unknown();
      }

      const city = cityNames.find((item) => hasPhrase(message, item.normalized))?.name;
      const service = services.find((item) =>
        item.words.some((word) => hasPhrase(message, word)),
      )?.query;
      const gender = /بانوان|زنانه/.test(message)
        ? 'FEMALE'
        : /آقایان|اقایان|مردانه/.test(message)
          ? 'MALE'
          : undefined;
      const index = selectedIndex(message);
      const publicSlug = request.page?.route.match(/^\/salons\/([^/]+)/)?.[1];
      const choosingService =
        state.pending === 'service' ||
        (state.intent === 'details' &&
          !!state.serviceChoices?.length &&
          index !== undefined &&
          !/سالن/.test(message));
      const serviceFollowUp =
        !!state.selected &&
        !city &&
        ((!!service && !/قیمت|هزینه|خدمات|جزئیات|نظر|امتیاز/.test(message)) || choosingService);
      const wantsSlots =
        serviceFollowUp ||
        /وقت خالی|زمان خالی|زمان آزاد|وقت آزاد|زمان های آزاد|نوبت خالی|اولین وقت|اولین زمان|زودترین|نزدیک ترین وقت|چه ساعت|چه زمان/.test(
          message,
        ) ||
        state.pending === 'date' ||
        state.pending === 'service';
      const wantsDetails =
        /قیمت|خدمات|جزئیات|متخصص|مقایسه|نظر|امتیاز|آدرس/.test(message) ||
        (index !== undefined && state.intent === 'search');
      const wantsOwner = /درآمد|گزارش|عملکرد|وضعیت امروز|خلاصه.*امروز|فروش|سالن های من/.test(
        message,
      );
      const wantsStaff =
        /برنامه امروز|برنامه روزانه|نوبت بعدی|نوبت های امروز/.test(message) &&
        (request.actor?.role === 'STAFF' || request.page?.route.startsWith('/staff'));
      const wantsMine = /نوبت های من|نوبت هام|نوبتهام|رزروهای من|رزروهام|رزرو های من/.test(message);
      const namedChoice = state.choices?.find((choice) => hasPhrase(message, choice.name));
      if (!choosingService && (index !== undefined || namedChoice)) {
        const choice = namedChoice ?? state.choices?.[index!];
        if (!choice)
          return answer(
            'این گزینه در فهرست فعلی نیست. شماره یا نام یکی از گزینه‌هایی را که نشان دادم بفرستید.',
          );
        if (state.selected?.id !== choice.id) {
          state.serviceIds = undefined;
          state.serviceChoices = undefined;
          state.date = undefined;
        }
        state.selected = choice;
        state.pending = undefined;
      }
      if (wantsMine) {
        if (!request.actor) {
          sources.push({ title: 'ورود به حساب', url: '/login?returnTo=/profile/bookings' });
          return answer(
            'برای مشاهده نوبت‌های شخصی ابتدا وارد حساب شوید؛ پس از ورود دوباره «نوبت‌های من» را بپرسید.',
          );
        }
        const result = await run<{
          total: number;
          bookings: Array<{
            status: string;
            startsAt: string;
            salon: string;
            services: string[];
            price: Money;
          }>;
        }>('my_bookings', {});
        if (!result.bookings.length)
          return answer('در حساب شما نوبتی ثبت نشده است. برای رزرو، از فهرست سالن‌ها شروع کنید.');
        return answer(
          `از ${result.total.toLocaleString('fa-IR')} نوبت ثبت‌شده، ${result.bookings.length.toLocaleString('fa-IR')} نوبت اخیر شما:\n` +
            result.bookings
              .map(
                (b, i) =>
                  `${i + 1}. ${b.salon} — ${b.services.join('، ')}\n${dateLabel(b.startsAt)} | ${statusNames[b.status] ?? b.status} | ${price(b.price)}`,
              )
              .join('\n'),
        );
      }
      if (
        wantsStaff ||
        (state.intent === 'staff' && state.pending !== 'service' && index !== undefined)
      ) {
        if (!request.actor || request.actor.role !== 'STAFF')
          return answer('برای مشاهده برنامه متخصص، با حساب متخصص وارد شوید.');
        if (state.intent !== 'staff') {
          state.selected = undefined;
          state.choices = undefined;
        }
        state.intent = 'staff';
        if (!state.selected || !state.choices?.length) {
          const memberships = await run<
            Array<{ salonId: string; salonName: string; slug?: string }>
          >('my_memberships', {});
          state.choices = memberships.map((s) => ({
            id: s.salonId,
            name: s.salonName,
            slug: s.slug,
          }));
          if (!state.choices.length)
            return answer('عضویت قابل دسترسی در سالن برای حساب شما پیدا نشد.');
          if (state.choices.length === 1) state.selected = state.choices[0];
        }
        if (!state.selected) {
          state.pending = 'salon';
          return answer(
            'برنامه کدام سالن را می‌خواهید؟\n' +
              state.choices!.map((s, i) => `${i + 1}. ${s.name}`).join('\n'),
          );
        }
        const date = await this.resolveDate(message, run);
        const result = await run<{
          date: string;
          summary: { total: number; completed: number; estimatedCommission: Money };
          bookings: Array<{ id: string; status: string; startsAt: string; services: string[] }>;
          nextBookingId?: string;
        }>('my_staff_day', { salonId: state.selected.id, date: date ?? null });
        const next = result.bookings.find((b) => b.id === result.nextBookingId);
        return answer(
          `برنامه ${state.selected.name} در ${result.date}:\n${result.summary.total} نوبت؛ ${result.summary.completed} نوبت تکمیل‌شده.\nپورسانت برآوردی: ${price(result.summary.estimatedCommission)}؛ این مبلغ به معنی پرداخت قطعی نیست.\n` +
            (next
              ? `نوبت بعدی: ${dateLabel(next.startsAt)} — ${next.services.join('، ')}`
              : 'در فهرست دریافتی نوبت بعدی مشخصی نیست.'),
        );
      }
      if (wantsOwner || (state.intent === 'owner' && index !== undefined)) {
        if (!request.actor || request.actor.role !== 'SALON_OWNER')
          return answer(
            'خلاصه عملکرد سالن فقط با حساب مالک و برای سالن‌های تحت مدیریت او قابل مشاهده است. برای راهنمای استفاده بپرسید «گزارش را کجا ببینم؟».',
          );
        if (state.intent !== 'owner') {
          state.choices = undefined;
          state.selected = undefined;
        }
        state.intent = 'owner';
        if (!state.choices) {
          state.choices = await run<SalonChoice[]>('my_salons', {});
          const routeId = request.page?.route.match(/^\/dashboard\/salons\/([^/]+)/)?.[1];
          state.selected =
            state.choices.find((s) => s.id === routeId) ||
            (state.choices.length === 1 ? state.choices[0] : undefined);
        }
        if (!state.choices.length) return answer('سالنی تحت مدیریت این حساب پیدا نشد.');
        if (!state.selected) {
          state.pending = 'salon';
          return answer(
            'گزارش کدام سالن را می‌خواهید؟\n' +
              state.choices.map((s, i) => `${i + 1}. ${s.name}`).join('\n'),
          );
        }
        const date = await this.resolveDate(message, run);
        const result = await run<{
          salon: string;
          date: string;
          today: { total: number; revenue: Money; statusCounts: Record<string, number> };
          note: string;
        }>('salon_overview', { salonId: state.selected.id, date: date ?? null });
        return answer(
          `خلاصه ${result.salon} — ${result.date}\nتعداد نوبت‌ها: ${result.today.total}\nدرآمد نوبت‌های تکمیل‌شده: ${price(result.today.revenue)}\n` +
            Object.entries(result.today.statusCounts)
              .filter(([, count]) => count > 0)
              .map(([status, count]) => `${statusNames[status] ?? status}: ${count}`)
              .join(' | ') +
            '\nاین درآمد ثبت‌شده است؛ سود خالص یا وصول قطعی نیست.',
        );
      }
      if (
        publicSlug &&
        publicSlug !== 'new' &&
        !city &&
        !/سالن دیگر|سالن دیگه/.test(message) &&
        (wantsDetails || wantsSlots || /این سالن/.test(message))
      ) {
        if (state.selected?.slug !== publicSlug) {
          state.serviceIds = undefined;
          state.serviceChoices = undefined;
        }
        state.selected = { id: '', slug: decodeURIComponent(publicSlug), name: 'سالن این صفحه' };
      }
      if ((wantsSlots || wantsDetails) && state.selected?.slug) {
        const details = await run<Details>('salon_details', { slug: state.selected.slug });
        state.selected = { id: details.id, slug: details.slug, name: details.name };
        state.serviceChoices = details.services.map((s) => ({ id: s.id, name: s.name }));
        if (!wantsSlots) {
          state.intent = 'details';
          return answer(
            `${details.name}${details.city ? ` — ${details.city}` : ''}\n${details.address ? `آدرس: ${details.address}\n` : ''}${details.reviewCount ? `امتیاز ${details.rating} از ${details.reviewCount} نظر\n` : 'هنوز نظری ثبت نشده است.\n'}` +
              (details.services.length
                ? details.services
                    .slice(0, 10)
                    .map(
                      (s, i) =>
                        `${i + 1}. ${s.name} — ${price(s.price)}${s.durationMinutes ? ` — ${s.durationMinutes} دقیقه` : ''}`,
                    )
                    .join('\n')
                : 'خدمت آنلاین فعالی برای این سالن پیدا نشد.') +
              '\nبرای استعلام وقت، نام خدمت و روز موردنظرتان را بگویید.',
          );
        }
        state.intent = 'availability';
        let selectedService =
          choosingService && index !== undefined ? details.services[index] : undefined;
        if (!selectedService)
          selectedService =
            details.services.find((s) => hasPhrase(message, s.name)) ||
            (service
              ? details.services.find((s) => normalizePersian(s.name).includes(service))
              : undefined);
        if (selectedService) state.serviceIds = [selectedService.id];
        if (!state.serviceIds?.length && details.services.length === 1)
          state.serviceIds = [details.services[0].id];
        if (!state.serviceIds?.length) {
          state.pending = 'service';
          return answer(
            'برای کدام خدمت وقت آزاد را ببینم؟\n' +
              details.services
                .slice(0, 10)
                .map((s, i) => `${i + 1}. ${s.name}`)
                .join('\n'),
          );
        }
        const parsedDate = await this.resolveDate(message, run);
        if (parsedDate) state.date = parsedDate;
        const nearest = /اولین وقت|اولین زمان|زودترین|نزدیک ترین وقت/.test(message);
        if (!state.date && !nearest) {
          state.pending = 'date';
          return answer('برای چه روزی؟ می‌توانید بگویید «امروز»، «فردا» یا تاریخ دقیق YYYY-MM-DD.');
        }
        const days =
          nearest && !state.date
            ? (await run<{ days: CalendarDay[] }>('calendar_dates', {})).days.slice(0, 7)
            : [{ gregorian: state.date!, persian: state.date! }];
        for (const day of days) {
          const result = await run<{ slots: Array<{ time: string }>; notice: string }>(
            'available_slots',
            {
              salonId: details.id,
              date: day.gregorian,
              serviceIds: state.serviceIds,
              staffId: null,
            },
          );
          if (result.slots.length) {
            state.date = day.gregorian;
            state.pending = undefined;
            return answer(
              `${details.name} — ${day.persian}\nزمان‌های آزاد: ${result.slots.map((s) => s.time).join('، ')}\n${result.notice}\nبرای نهایی‌کردن، صفحه رزرو را باز کنید.`,
            );
          }
        }
        state.pending = 'date';
        state.date = undefined;
        return answer(
          nearest
            ? 'در هفت روز آینده و برای خدمت انتخاب‌شده، وقت آزادی پیدا نشد. روز دیگری را مشخص کنید.'
            : 'برای این روز و خدمت، وقت آزادی پیدا نشد. روز دیگری را مشخص کنید.',
        );
      }
      const wantsSearch =
        /سالن|آرایشگاه|ارایشگاه|مرکز|پیدا|پیشنهاد|جستجو|جست وجو/.test(message) ||
        !!service ||
        state.pending === 'city' ||
        (!!city && state.intent === 'search');
      if (wantsSearch && (!wantsDetails || !state.selected)) {
        if (state.intent !== 'search') {
          state.city = undefined;
          state.service = undefined;
        }
        state.intent = 'search';
        state.selected = undefined;
        state.serviceIds = undefined;
        state.date = undefined;
        state.serviceChoices = undefined;
        if (city) state.city = city;
        if (service) state.service = service;
        if (gender) state.gender = gender;
        if (!state.city) {
          state.pending = 'city';
          return answer(
            'کدام شهر را در نظر دارید؟ مثلاً تهران، کرج یا سمنان. نوع خدمت را هم می‌توانید در همان پیام بگویید.',
          );
        }
        const result = await run<{ total: number; salons: PublicSalon[] }>('search_salons', {
          city: state.city,
          service: state.service ?? null,
          query: null,
          gender: state.gender ?? null,
        });
        state.choices = result.salons.map((s) => ({ id: s.id, slug: s.slug, name: s.name }));
        state.pending = undefined;
        if (!result.salons.length)
          return answer(
            `برای ${state.service ? `خدمت «${state.service}» در ` : ''}${state.city} سالنی با شرایط فعلی پیدا نشد. می‌توانید شهر یا نوع خدمت را تغییر دهید؛ اطلاعاتی را حدس نمی‌زنم.`,
          );
        return answer(
          `این گزینه‌ها از اطلاعات فعلی سامانه در ${state.city} هستند:\n` +
            result.salons
              .map(
                (s, i) =>
                  `${i + 1}. ${s.name} — ${price(s.minPrice)}${s.reviewCount ? ` | امتیاز ${s.rating} از ${s.reviewCount} نظر` : ' | هنوز نظری ثبت نشده'}`,
              )
              .join('\n') +
            '\nبرای دیدن خدمات و قیمت‌ها بگویید «گزینه اول» یا نام سالن را بنویسید.',
        );
      }
      if (wantsSlots || wantsDetails)
        return answer(
          'اول سالن را مشخص کنیم. شهر و خدمت را بگویید، یا از صفحه سالن موردنظرتان با من گفتگو کنید.',
        );
      const match = this.businesses.rank(businessId, original)[0];
      return match && match.coverage >= 0.5 ? fromArticle(match.article) : unknown();
    } catch (error) {
      if (error instanceof BadRequestException)
        return answer(
          'تاریخ یا انتخاب موردنظر قابل پردازش نیست. یک تاریخ روزانه معتبر به شکل YYYY-MM-DD و یکی از گزینه‌های فهرست را مشخص کنید؛ گزارش بازه‌ای در این نسخه فعال نیست.',
        );
      if (error instanceof HttpException && error.getStatus() === 403)
        return answer(
          'به این اطلاعات دسترسی ندارید. فقط اطلاعات مجاز حساب و سالن خودتان قابل مشاهده است.',
        );
      return answer(
        'استعلام اطلاعات این بخش انجام نشد. چیزی را حدس نمی‌زنم؛ لطفاً کمی بعد دوباره تلاش کنید یا صفحه مربوط را باز کنید.',
      );
    }
  }

  private async resolveDate(
    message: string,
    run: <T>(name: string, input: Record<string, unknown>) => Promise<T>,
  ): Promise<string | undefined> {
    if (/هفته قبل|هفته گذشته|ماه قبل|ماه گذشته|سال قبل|سال گذشته/.test(message))
      throw new BadRequestException(
        'گزارش بازه‌ای در این نسخه فعال نیست؛ یک تاریخ روزانه مشخص کنید.',
      );
    if (/دیروز|پریروز/.test(message)) {
      const day = new Date(Date.now() - (/پریروز/.test(message) ? 2 : 1) * 86400000);
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(day);
      const part = (type: string) => parts.find((p) => p.type === type)!.value;
      return `${part('year')}-${part('month')}-${part('day')}`;
    }
    const explicit = message.match(/\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/);
    if (explicit && Number(explicit[1]) > 1700)
      return `${explicit[1]}-${explicit[2].padStart(2, '0')}-${explicit[3].padStart(2, '0')}`;
    if (!explicit && !/امروز|فردا|شنبه|یکشنبه|دوشنبه|سه شنبه|چهارشنبه|پنجشنبه|جمعه/.test(message))
      return undefined;
    const calendar = await run<{ days: CalendarDay[] }>('calendar_dates', {});
    if (explicit) {
      const normalized = `${explicit[1]}/${Number(explicit[2])}/${Number(explicit[3])}`;
      const match = calendar.days.find((d) => d.persianDate === normalized);
      if (!match)
        throw new BadRequestException(
          'این تاریخ شمسی در تقویم ۳۰ روزه دستیار نیست؛ معادل میلادی دقیق YYYY-MM-DD را وارد کنید.',
        );
      return match.gregorian;
    }
    const offset = /پس فردا/.test(message)
      ? 2
      : /فردا/.test(message)
        ? 1
        : /امروز/.test(message)
          ? 0
          : undefined;
    if (offset !== undefined) return calendar.days[offset]?.gregorian;
    const weekday = ['چهارشنبه', 'پنجشنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'جمعه', 'شنبه'].find(
      (day) => hasPhrase(message, day),
    );
    return weekday
      ? calendar.days.find((d) => normalizePersian(d.persian).startsWith(weekday + ' '))?.gregorian
      : undefined;
  }
}
