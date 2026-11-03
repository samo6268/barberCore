import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { meaningfulWords, normalizePersian, hasPhrase } from './persian-text';

export interface KnowledgeArticle {
  id: string;
  title: string;
  text: string;
  path?: string;
  keywords?: string[];
}
export interface AssistantBusiness {
  assistantId: string;
  name: string;
  description: string;
  knowledge: KnowledgeArticle[];
  parnegarinTools: boolean;
  workflows?: BusinessWorkflow[];
}
export interface BusinessWorkflow {
  id: string;
  title: string;
  path: string;
  paths: string[];
  note?: string;
  steps: Array<{ id: string; title: string; instruction: string }>;
}

const articles: KnowledgeArticle[] = [
  {
    id: 'no-availability', title: 'چرا وقت آزاد پیدا نمی‌کنم؟', path: '/salons',
    keywords: ['وقت نیست', 'وقت خالی نیست', 'زمان آزاد ندارم', 'هیچ ساعتی', 'وقت نمایش داده نمی شود'],
    text: 'اول پیام صفحه را بررسی کنید: خطای دریافت اطلاعات با نبود وقت آزاد متفاوت است. سپس خدمت، روز و متخصص را دوباره بررسی کنید. اگر مدیر سالن هستید، فعال‌بودن خدمت، خدمات قابل ارائه متخصص، ساعات کاری، استراحت، مرخصی و تداخل نوبت‌ها را در پنل بررسی کنید. برای اطمینان از وضعیت واقعی، زمان‌های آزاد را دوباره دریافت کنید؛ میمو علت قطعی را بدون داده معتبر اعلام نمی‌کند.',
  },
  {
    id: 'calendar', title: 'انتخاب تاریخ و ساعت رزرو', path: '/salons',
    keywords: ['تقویم', 'تاریخ شمسی', 'تاریخ فارسی', 'انتخاب ساعت', 'روز رزرو'],
    text: 'روز را از تقویم فارسی همان صفحه انتخاب کنید و بعد ساعت آزاد را بزنید. برای استعلام در گفتگو می‌توانید «امروز»، «فردا» یا تاریخ میلادی YYYY-MM-DD بگویید. تاریخ نمایش‌داده‌شده فارسی با مقدار تاریخ ارسالی به سرویس یک قالب ندارد؛ عدد ماه شمسی را به‌جای ماه میلادی وارد نکنید. تغییر خدمت، متخصص یا روز نیازمند بررسی دوباره ساعت آزاد است.',
  },
  {
    id: 'intro',
    title: 'پرنگارین چیست؟',
    path: '/',
    keywords: ['پرنگارین چیست', 'درباره پرنگارین', 'معرفی سامانه'],
    text: 'پرنگارین برای پیدا کردن و مقایسه سالن‌ها، آرایشگاه‌های بانوان و آقایان و مراکز خدمات زیبایی و اسپا ساخته شده است. می‌توانید خدمات، قیمت‌های ثبت‌شده و زمان‌های آزاد را ببینید و وارد فرایند رزرو شوید. موجودبودن هر خدمت در هر شهر به مراکز فعال بستگی دارد.',
  },
  {
    id: 'booking',
    title: 'چطور نوبت رزرو کنم؟',
    path: '/salons',
    keywords: ['رزرو', 'نوبت گرفتن', 'وقت گرفتن', 'ثبت نوبت', 'نوبت بگیرم'],
    text: '۱. شهر و خدمت موردنظرتان را انتخاب کنید.\n۲. وارد صفحه سالن شوید و خدمات و متخصص را انتخاب کنید.\n۳. روز و زمان آزاد را مشخص کنید.\n۴. وارد حساب شوید و رزرو را در صفحه مربوط نهایی کنید.\nمیمو فقط راهنمایی و استعلام می‌کند؛ خودش رزرو یا پرداخت انجام نمی‌دهد. وقت آزاد تا پیش از ثبت نهایی تضمین‌شده نیست.',
  },
  {
    id: 'search',
    title: 'پیداکردن سالن در محدوده شهر',
    path: '/salons',
    keywords: ['نقشه', 'محدوده', 'استان', 'محله', 'نزدیک من', 'شهر'],
    text: 'در جست‌وجوی سالن‌ها ابتدا استان و سپس شهر را انتخاب کنید. با تعیین محدوده روی نقشه می‌توانید نتایج نزدیک‌تر را ببینید. برای مقایسه، خدمت، نوع سالن، قیمت و امتیاز را بررسی کنید. اگر مختصات مرکز ثبت نشده باشد، فاصله دقیق آن قابل نمایش نیست.',
  },
  {
    id: 'account',
    title: 'ورود و مشاهده نوبت‌های من',
    path: '/profile/bookings',
    keywords: [
      'ورود',
      'حساب کاربری',
      'پروفایل',
      'کد تایید',
      'کد پیامکی',
      'نوبت های من',
      'شماره موبایل',
    ],
    text: 'برای ورود مشتری، شماره موبایل را در صفحه ورود ثبت و کد پیامکی را در همان صفحه وارد کنید. بعد از ورود، نوبت‌ها را در بخش «نوبت‌های من» ببینید. کد ورود را در گفتگو با میمو ارسال نکنید. اگر پیامک نرسید، شماره را بررسی کنید و مطابق زمان‌بندی صفحه دوباره درخواست دهید.',
  },
  {
    id: 'cancellation',
    title: 'لغو یا تغییر نوبت',
    path: '/profile/bookings',
    keywords: ['لغو', 'کنسل', 'بازپرداخت', 'تغییر نوبت', 'جابه جایی نوبت'],
    text: 'از «نوبت‌های من» وارد جزئیات نوبت شوید و گزینه‌های مجاز همان نوبت را بررسی کنید. شرایط لغو و بازپرداخت به سیاست منتشرشده و وضعیت نوبت بستگی دارد؛ مهلت ثابت یا بازپرداخت تضمینی اعلام نمی‌کنم. برای تغییر زمان، ابتدا شرایط نوبت و زمان آزاد جدید را بررسی کنید. لغو و تغییر از داخل میمو اجرا نمی‌شود.',
  },
  {
    id: 'salon-owner',
    title: 'پنل مدیریت سالن',
    path: '/dashboard',
    keywords: ['مدیر سالن', 'مدیریت سالن', 'ثبت سالن', 'افزودن سالن', 'سالن جدید', 'صاحب سالن'],
    text: 'در پنل مدیر، سالن خود را انتخاب کنید تا به خدمات، کارکنان، نوبت‌ها، گزارش‌ها و تنظیمات برسید. برای افزودن سالن، اطلاعات تماس، استان، شهر و موقعیت تقریبی روی نقشه را تکمیل کنید. فقط اطلاعات سالن‌هایی در دسترس است که مجوز مدیریت آن‌ها را دارید.',
  },
  {
    id: 'services',
    title: 'افزودن یا ویرایش خدمت',
    path: '/dashboard',
    keywords: ['خدمات سالن', 'افزودن خدمت', 'ثبت خدمت', 'ویرایش خدمت', 'قیمت گذاری', 'تغییر قیمت'],
    text: 'در پنل مدیریت، سالن را انتخاب و بخش «خدمات» را باز کنید. نام، دسته‌بندی، مدت و قیمت خدمت را وارد و وضعیت فعال‌بودن و امکان رزرو آنلاین را بررسی کنید. دسترسی متخصص به همان خدمت هم باید درست تنظیم شود. میمو قیمت یا خدمت را ویرایش نمی‌کند.',
  },
  {
    id: 'staff',
    title: 'پنل متخصص و برنامه کاری',
    path: '/staff',
    keywords: ['پنل متخصص', 'کارمند', 'کارکنان', 'مرخصی', 'استراحت', 'ساعات کاری', 'برنامه کاری'],
    text: 'پنل متخصص شامل برنامه روزانه، تقویم نوبت‌ها، ساعات کاری، استراحت، مرخصی، اعلان‌ها و پروفایل است. متخصص فقط اطلاعات مجاز مربوط به خودش را می‌بیند. برای درخواست مرخصی یا تغییر ساعات کاری از بخش برنامه کاری استفاده کنید؛ این تغییرات در گفتگو اجرا نمی‌شوند.',
  },
  {
    id: 'settlements',
    title: 'پورسانت و سوابق تسویه',
    path: '/staff/settlements',
    keywords: ['پورسانت', 'تسویه', 'حقوق', 'کارمزد', 'پرداختی'],
    text: 'متخصص می‌تواند سوابق تسویه خود را در بخش تسویه‌ها مشاهده کند. مبلغ پورسانت برآوردشده با مبلغ قطعی پرداخت‌شده یکسان نیست؛ دوره، وضعیت و تاریخ پرداخت را بررسی کنید. مدیر نیز بخش تسویه‌های سالن را دارد. میمو پرداخت یا تسویه ثبت نمی‌کند.',
  },
  {
    id: 'reports',
    title: 'گزارش عملکرد سالن',
    path: '/dashboard',
    keywords: ['گزارش', 'درآمد', 'عملکرد', 'فروش', 'سود'],
    text: 'برای گزارش، از پنل مدیر وارد سالن و بخش گزارش‌ها شوید. درآمد نوبت‌های تکمیل‌شده با سود خالص، وصول وجه و تسویه یکسان نیست. خلاصه روزانه‌ای که میمو نشان می‌دهد فقط از داده‌های مجاز همان سالن است و تعریف هر مبلغ کنار آن ذکر می‌شود.',
  },
  {
    id: 'reviews',
    title: 'نظرها و امتیاز سالن‌ها',
    path: '/salons',
    keywords: ['نظر', 'نظرها', 'امتیاز', 'رضایت', 'نقد', 'ستاره'],
    text: 'در صفحه سالن، امتیاز و تعداد نظرها را کنار هم بررسی کنید. نبود نظر به معنی نارضایتی نیست و امتیاز بالا تضمین نتیجه خدمت نیست. برای ثبت نظر درباره نوبت خود از مسیر مربوط در حساب کاربری استفاده کنید.',
  },
  {
    id: 'academy',
    title: 'آکادمی و دوره‌ها',
    path: '/academy',
    keywords: ['آکادمی', 'آموزش', 'دوره', 'مدرس', 'هنرجو', 'مدرک'],
    text: 'در آکادمی می‌توانید دوره‌های منتشرشده را بررسی و مسیر مدرس‌شدن را پیدا کنید. زمان برگزاری، قیمت و شرایط مدرک را از صفحه خود دوره بخوانید. میمو در این نسخه به موجودی و جزئیات زنده دوره‌ها متصل نیست و آن‌ها را حدس نمی‌زند.',
  },
  {
    id: 'safety',
    title: 'انتخاب خدمات زیبایی و اسپا',
    path: '/salons',
    keywords: ['اسپا', 'ماساژ', 'حساسیت', 'پوست', 'زیبایی', 'بارداری'],
    text: 'برای پیدا کردن ارائه‌دهنده، نوع خدمت، شهر و ترجیح زمانی را مشخص کنید و جزئیات همان مرکز را بخوانید. میمو تشخیص بیماری یا پیشنهاد درمان پزشکی نمی‌دهد. اگر حساسیت یا منع پزشکی دارید، پیش از دریافت خدمت با متخصص واجد صلاحیت مشورت کنید.',
  },
  {
    id: 'privacy',
    title: 'اطلاعات شخصی و امنیت حساب',
    path: '/privacy',
    keywords: ['حریم خصوصی', 'امنیت', 'رمز', 'اطلاعات شخصی', 'دسترسی'],
    text: 'میمو برای این نسخه فقط از دانش داخلی و اطلاعات مجاز سامانه استفاده می‌کند و به سرویس مدل خارجی وصل نیست. اطلاعات شخصی فقط پس از ورود و بررسی مجوز خوانده می‌شوند. رمز، کد پیامکی، اطلاعات کارت و کلید API را در گفتگو ارسال نکنید.',
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
    this.businesses.set('parnegarin-admin', {
      assistantId: 'parnegarin-admin', name: 'پنل مدیریت پرنگارین',
      description: 'راهنمای پنل مدیریت؛ ابزارهای خصوصی ادمین متصل نیستند', parnegarinTools: false,
      knowledge: [{ id: 'admin-data', title: 'داده‌ها و عملیات پنل مدیریت', path: '/dashboard',
        keywords: ['آمار', 'گزارش', 'مالی', 'کاربر', 'مدیریت', 'ورود', 'دسترسی', 'چاپ', 'ادمین'],
        text: 'این نسخه پنل ادمین شامل صفحات نمایشی است؛ ورود نمایشی و اعداد نمونه، مجوز واقعی یا آمار عملیاتی نیستند. میمو فقط درباره مسیرهای همین پنل راهنمایی می‌کند و به اطلاعات خصوصی، تأیید محتوا یا تغییر کاربران متصل نیست. برای گزارش قطعی باید سرویس واقعی و احراز هویت ادمین متصل و اعتبارسنجی شوند.' }],
      workflows: [{ id: 'admin-navigation', title: 'راهنمای پنل مدیریت', path: '/dashboard',
        paths: ['/dashboard', '/users', '/users/*', '/customers', '/salons', '/financial', '/courses', '/media', '/settings', '/templates', '/content/*', '/moderation/*', '/login', '/'],
        note: 'داده‌ها و ورود این نسخه پنل نمایشی‌اند؛ میمو آن‌ها را آمار یا مجوز واقعی در نظر نمی‌گیرد.',
        steps: [
          { id: 'section', title: 'انتخاب بخش', instruction: 'از منوی پنل، کاربران، سالن‌ها، مالی، محتوا یا بررسی درخواست‌ها را متناسب با کار خود انتخاب کنید.' },
          { id: 'review', title: 'بررسی جزئیات', instruction: 'فیلترها و جزئیات موردنظر را در همان بخش بررسی کنید. اعداد و ردیف‌های نمونه را مبنای تصمیم مالی یا عملیاتی قرار ندهید.' },
          { id: 'action', title: 'بررسی اتصال واقعی', instruction: 'تا اتصال به سرویس واقعی و احراز هویت معتبر انجام نشده، تغییر نمایشی را ذخیره قطعی یا عملیات موفق حساب نکنید. دستیار نیز عملیاتی روی داده‌های مدیریتی اجرا نمی‌کند.' },
        ],
      }],
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
          this.businesses.has(item.assistantId) ||
          typeof item.name !== 'string' ||
          !Array.isArray(item.knowledge) ||
          item.knowledge.length > 100 ||
          item.knowledge.some(
            (a: KnowledgeArticle) =>
              !a ||
              typeof a.id !== 'string' ||
              typeof a.title !== 'string' ||
              typeof a.text !== 'string' ||
              a.text.length > 6000 ||
              (a.path !== undefined && (typeof a.path !== 'string' || a.path.length > 300)) ||
              (a.keywords !== undefined &&
                (!Array.isArray(a.keywords) ||
                  a.keywords.some((word) => typeof word !== 'string' || word.length > 100))),
          )
        ) {
          throw new Error('Invalid assistant business configuration');
        }
        if (item.workflows !== undefined && !this.validWorkflows(item.workflows))
          throw new Error('Invalid assistant workflow configuration');
        this.businesses.set(item.assistantId, { ...item, parnegarinTools: false });
      }
    }
  }
  private validWorkflows(value: unknown): value is BusinessWorkflow[] {
    const identifier = (s: unknown) => typeof s === 'string' && /^[a-z][a-z0-9_-]{0,59}$/.test(s);
    const path = (s: unknown) => typeof s === 'string' && s.length <= 300 && /^\/(?![\/\\])[^\\\u0000-\u0020]*$/.test(s);
    if (!Array.isArray(value) || value.length > 30) return false;
    return new Set(value.map(flow => flow?.id)).size === value.length && value.every(flow =>
      flow && identifier(flow.id) && typeof flow.title === 'string' && flow.title.length <= 120 && path(flow.path)
      && Array.isArray(flow.paths) && flow.paths.length > 0 && flow.paths.length <= 40 && flow.paths.every(path)
      && (flow.note === undefined || (typeof flow.note === 'string' && flow.note.length <= 1500))
      && Array.isArray(flow.steps) && flow.steps.length > 0 && flow.steps.length <= 12
      && new Set(flow.steps.map((s: { id?: string }) => s?.id)).size === flow.steps.length
      && flow.steps.every((s: { id?: string; title?: string; instruction?: string }) => s && identifier(s.id)
        && typeof s.title === 'string' && s.title.length <= 120 && typeof s.instruction === 'string' && s.instruction.length <= 1500));
  }
  get(id: string): AssistantBusiness {
    const business = this.businesses.get(id);
    if (!business) throw new NotFoundException('دستیار این کسب‌وکار تعریف نشده است.');
    return business;
  }
  rank(businessId: string, query: string) {
    const words = meaningfulWords(query);
    const normalized = normalizePersian(query);
    return this.get(businessId)
      .knowledge.map((article) => {
        const title = normalizePersian(article.title);
        const body = normalizePersian(article.text);
        const keywords = article.keywords ?? [];
        const titleHits = words.filter((word) => hasPhrase(title, word)).length;
        const bodyHits = words.filter((word) => hasPhrase(body, word)).length;
        const aliasHits = keywords.filter((alias) => hasPhrase(normalized, alias)).length;
        const aliasWords = words.filter((word) =>
          keywords.some((alias) => hasPhrase(alias, word)),
        ).length;
        const score = titleHits * 4 + bodyHits + aliasHits * 6 + aliasWords * 2;
        const matched = words.filter(
          (word) =>
            hasPhrase(title, word) ||
            hasPhrase(body, word) ||
            keywords.some((alias) => hasPhrase(alias, word)),
        ).length;
        return { article, score, coverage: words.length ? matched / words.length : 0 };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
  search(businessId: string, query: string) {
    return this.rank(businessId, query).map((item) => item.article);
  }
}
