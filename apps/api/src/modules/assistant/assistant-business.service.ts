import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface KnowledgeArticle {
  id: string;
  title: string;
  text: string;
  path?: string;
}
export interface AssistantBusiness {
  assistantId: string;
  name: string;
  description: string;
  knowledge: KnowledgeArticle[];
  parnegarinTools: boolean;
}

const articles: KnowledgeArticle[] = [
  {
    id: 'intro',
    title: 'معرفی پرنگارین',
    path: '/',
    text: 'پرنگارین بستری برای کشف و مقایسه سالن‌ها، آرایشگاه‌های زنانه و مردانه، مراکز زیبایی و خدمات اسپا است. ارائه واقعی هر خدمت در هر شهر باید از داده زنده بررسی شود. وجود دسته‌بندی، تضمین وجود ارائه‌دهنده فعال نیست.',
  },
  {
    id: 'booking',
    title: 'راهنمای رزرو',
    path: '/salons',
    text: 'ابتدا سالن، خدمات و متخصص را انتخاب کنید، روز و زمان آزاد را ببینید و پس از ورود، رزرو را نهایی کنید. زمان آزاد ممکن است پیش از نهایی‌شدن رزرو توسط فرد دیگری گرفته شود. دستیار فقط گزینه‌ها را پیدا می‌کند؛ خودش رزرو، پرداخت یا لغو انجام نمی‌دهد.',
  },
  {
    id: 'search',
    title: 'جست‌وجوی محدوده',
    path: '/salons',
    text: 'در فهرست سالن‌ها ابتدا استان و سپس شهر انتخاب می‌شود. می‌توان با نقشه و تعیین محدوده، نتایج نزدیک‌تر را دید. داده فاصله فقط در صورت داشتن مختصات معتبر قابل محاسبه است. موقعیت کاربر را حدس نزنید.',
  },
  {
    id: 'account',
    title: 'حساب کاربری و نوبت‌ها',
    path: '/profile/bookings',
    text: 'ورود مشتری از مسیر ورود و با شماره موبایل و کد تأیید انجام می‌شود. نوبت‌ها در پروفایل قابل مشاهده‌اند. دستیار هیچ رمز، کد پیامکی، کلید API یا اطلاعات کارت بانکی درخواست نمی‌کند.',
  },
  {
    id: 'cancellation',
    title: 'لغو و تغییر رزرو',
    path: '/profile/bookings',
    text: 'برای بررسی لغو به جزئیات نوبت در بخش نوبت‌های من مراجعه کنید. شرایط بازپرداخت و مهلت لغو را فقط از سیاست منتشرشده و داده همان نوبت بیان کنید؛ مهلت ثابت یا بازپرداخت تضمینی اعلام نکنید. عملیات لغو در دستیار فعال نیست.',
  },
  {
    id: 'salon-owner',
    title: 'مدیریت سالن',
    path: '/dashboard',
    text: 'مدیر سالن می‌تواند خدمات، کارکنان، نوبت‌ها، گزارش‌ها و تنظیمات سالن خود را مدیریت کند. برای ثبت سالن، اطلاعات تماس، استان و شهر و موقعیت تقریبی روی نقشه تکمیل می‌شود. آمار درآمد، فروش خالص و تسویه با هم یکسان نیستند؛ شاخص‌ها را با تعریف دقیق ارائه کنید.',
  },
  {
    id: 'staff',
    title: 'پنل متخصص',
    path: '/staff',
    text: 'پنل متخصص شامل برنامه روزانه، تقویم نوبت‌ها، ساعات کاری، مرخصی، اعلان‌ها، پروفایل و مشاهده سوابق تسویه است. متخصص فقط اطلاعات مجاز مربوط به خود را می‌بیند. مبلغ پورسانت برآوردشده به معنی پرداخت قطعی نیست.',
  },
  {
    id: 'reviews',
    title: 'نظرها و امتیازها',
    path: '/salons',
    text: 'امتیاز و تعداد نظر را از داده واقعی بخوانید. صفر نظر به معنی نارضایتی نیست. امتیاز بالا تضمین نتیجه خدمت نیست. نظر ساختگی، نشان تأیید یا تجربه شخصی اختراع نکنید.',
  },
  {
    id: 'academy',
    title: 'آکادمی',
    path: '/academy',
    text: 'آکادمی برای معرفی و مشاهده دوره‌ها و مسیر مدرس‌شدن است. درباره موجودی دوره، قیمت، مدرک، زمان برگزاری یا اعتبار آموزشی بدون منبع زنده ادعای قطعی نکنید.',
  },
  {
    id: 'safety',
    title: 'انتخاب خدمت زیبایی و اسپا',
    path: '/salons',
    text: 'برای پیشنهاد، نوع خدمت، شهر، بودجه و ترجیح زمانی را بپرسید. درباره تفاوت عمومی خدمات توضیح بدهید، اما بیماری تشخیص ندهید و درمان پزشکی، ایمنی قطعی خدمات یا نتیجه تضمینی پیشنهاد نکنید. برای حساسیت، بیماری پوستی، بارداری یا منع پزشکی به متخصص واجد صلاحیت ارجاع دهید.',
  },
];

@Injectable()
export class AssistantBusinessService {
  private readonly businesses = new Map<string, AssistantBusiness>();
  constructor(config: ConfigService) {
    this.businesses.set('parnegarin', {
      assistantId: 'parnegarin',
      name: 'پرنگارین',
      description: 'بازار خدمات زیبایی، آرایشگری و اسپا و مدیریت سالن',
      knowledge: articles,
      parnegarinTools: true,
    });
    const extra = config.get<string>('ASSISTANT_BUSINESSES_JSON');
    if (extra) {
      const businesses: unknown = JSON.parse(extra);
      if (!Array.isArray(businesses) || businesses.length > 20)
        throw new Error('ASSISTANT_BUSINESSES_JSON must be an array of at most 20 businesses');
      for (const item of businesses) {
        if (
          !item ||
          typeof item.assistantId !== 'string' ||
          !/^[a-z0-9-]{1,64}$/.test(item.assistantId) ||
          item.assistantId === 'parnegarin' ||
          typeof item.name !== 'string' ||
          !Array.isArray(item.knowledge) ||
          item.knowledge.length > 100 ||
          item.knowledge.some(
            (a: KnowledgeArticle) =>
              !a ||
              typeof a.id !== 'string' ||
              typeof a.title !== 'string' ||
              typeof a.text !== 'string' ||
              a.text.length > 6000,
          )
        ) {
          throw new Error('Invalid assistant business configuration');
        }
        this.businesses.set(item.assistantId, { ...item, parnegarinTools: false });
      }
    }
  }
  get(id: string): AssistantBusiness {
    const business = this.businesses.get(id);
    if (!business) throw new NotFoundException('دستیار این کسب‌وکار تعریف نشده است.');
    return business;
  }
  search(businessId: string, query: string) {
    const words = query
      .normalize('NFKC')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .split(/\s+/)
      .filter((word) => word.length > 2);
    return this.get(businessId)
      .knowledge.map((article) => ({
        article,
        score: words.reduce(
          (score, word) => score + (`${article.title} ${article.text}`.includes(word) ? 1 : 0),
          0,
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ article }) => article);
  }
}
