export const MOCK_SALONS_MALE = [
  {
    id: 'm1', slug: 'barber-classic-tehran', name: 'باربر کلاسیک', gender: 'MALE',
    city: 'تهران', address: 'جردن، خیابان آفریقا', phone: '02188776655',
    coverUrl: null, logoUrl: null, rating: 4.8, reviewCount: 124,
    isVerified: true, isFeatured: true, description: 'آرایشگاه مردانه کلاسیک با بیش از ۱۵ سال سابقه',
    minPrice: 85000,
    services: [
      { id: 's1', name: 'کوتاهی مو', price: 85000, durationMinutes: 30 },
      { id: 's2', name: 'اصلاح ریش', price: 65000, durationMinutes: 20 },
      { id: 's3', name: 'کوتاهی + اصلاح', price: 140000, durationMinutes: 50 },
      { id: 's4', name: 'رنگ مو', price: 250000, durationMinutes: 90 },
    ],
    staff: [
      { id: 'st1', displayName: 'استاد محمد', specialties: ['کوتاهی کلاسیک', 'اصلاح صورت'], services: [] },
      { id: 'st2', displayName: 'استاد علی', specialties: ['رنگ مو', 'هایلایت'], services: [] },
    ],
    reviews: [
      { id: 'r1', rating: 5, comment: 'عالی! بهترین آرایشگاه تهران', customer: { firstName: 'رضا', lastName: 'م.' }, createdAt: '2024-01-10' },
      { id: 'r2', rating: 5, comment: 'کار با کیفیت و سریع', customer: { firstName: 'امیر', lastName: 'ح.' }, createdAt: '2024-01-08' },
      { id: 'r3', rating: 4, comment: 'محیط خوب و تمیز', customer: { firstName: 'سعید', lastName: 'ک.' }, createdAt: '2024-01-05' },
    ],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
  {
    id: 'm2', slug: 'gentleman-cuts', name: 'جنتلمن کاتس', gender: 'MALE',
    city: 'تهران', address: 'ولنجک، میدان شهرک غرب', phone: '02188990011',
    coverUrl: null, logoUrl: null, rating: 4.6, reviewCount: 89,
    isVerified: true, isFeatured: false, description: 'تخصص در کوتاهی‌های مدرن و کلاسیک',
    minPrice: 95000,
    services: [
      { id: 's5', name: 'کوتاهی مدرن', price: 95000, durationMinutes: 35 },
      { id: 's6', name: 'اصلاح با تیغ', price: 75000, durationMinutes: 25 },
      { id: 's7', name: 'فید و تیپ', price: 120000, durationMinutes: 45 },
    ],
    staff: [
      { id: 'st3', displayName: 'داریوش رضایی', specialties: ['فید و تیپ', 'کوتاهی مدرن'], services: [] },
    ],
    reviews: [
      { id: 'r4', rating: 5, comment: 'فضا و کارکنان فوق‌العاده', customer: { firstName: 'بهنام', lastName: 'ع.' }, createdAt: '2024-01-12' },
    ],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
  {
    id: 'm3', slug: 'barber-studio-isfahan', name: 'باربر استودیو اصفهان', gender: 'MALE',
    city: 'اصفهان', address: 'خیابان چهارباغ', phone: '03136543210',
    coverUrl: null, logoUrl: null, rating: 4.7, reviewCount: 201,
    isVerified: true, isFeatured: true, description: 'بهترین آرایشگاه مردانه اصفهان با تیم حرفه‌ای',
    minPrice: 70000,
    services: [
      { id: 's8', name: 'کوتاهی', price: 70000, durationMinutes: 30 },
      { id: 's9', name: 'رنگ ریش', price: 45000, durationMinutes: 20 },
    ],
    staff: [
      { id: 'st4', displayName: 'حسام امیری', specialties: ['کوتاهی سنتی', 'رنگ ریش'], services: [] },
      { id: 'st5', displayName: 'کیوان نجفی', specialties: ['اصلاح ریش'], services: [] },
    ],
    reviews: [],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '22:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
  {
    id: 'm4', slug: 'velvet-cut', name: 'ولوت کات', gender: 'MALE',
    city: 'مشهد', address: 'احمدآباد، خیابان راهنمایی', phone: '05138887766',
    coverUrl: null, logoUrl: null, rating: 4.5, reviewCount: 56,
    isVerified: false, isFeatured: false, description: 'کوتاهی تخصصی مردانه',
    minPrice: 60000,
    services: [
      { id: 's10', name: 'کوتاهی موی سر', price: 60000, durationMinutes: 25 },
      { id: 's11', name: 'کراتین مو', price: 350000, durationMinutes: 120 },
    ],
    staff: [
      { id: 'st6', displayName: 'مهدی صادقی', specialties: ['کوتاهی مدرن'], services: [] },
    ],
    reviews: [],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '10:00', closeTime: '21:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
];

export const MOCK_SALONS_FEMALE = [
  {
    id: 'f1', slug: 'lux-beauty-tehran', name: 'لاکچری بیوتی', gender: 'FEMALE',
    city: 'تهران', address: 'الهیه، خیابان فرشته', phone: '02122334455',
    coverUrl: null, logoUrl: null, rating: 4.9, reviewCount: 312,
    isVerified: true, isFeatured: true, description: 'سالن زیبایی لوکس با خدمات کامل زنانه',
    minPrice: 150000,
    services: [
      { id: 'sf1', name: 'کوتاهی مو', price: 150000, durationMinutes: 45 },
      { id: 'sf2', name: 'رنگ مو', price: 350000, durationMinutes: 120 },
      { id: 'sf3', name: 'کراتین', price: 800000, durationMinutes: 180 },
      { id: 'sf4', name: 'میکاپ عروس', price: 1200000, durationMinutes: 120 },
      { id: 'sf5', name: 'مانیکور', price: 120000, durationMinutes: 60 },
      { id: 'sf6', name: 'پدیکور', price: 130000, durationMinutes: 60 },
    ],
    staff: [
      { id: 'stf1', displayName: 'خانم محمدی', specialties: ['رنگ مو', 'کراتین', 'بالیاژ'], services: [] },
      { id: 'stf2', displayName: 'خانم رضایی', specialties: ['میکاپ', 'آرایش عروس'], services: [] },
      { id: 'stf3', displayName: 'خانم حسینی', specialties: ['مانیکور', 'پدیکور', 'ناخن'], services: [] },
    ],
    reviews: [
      { id: 'rf1', rating: 5, comment: 'بهترین سالن تهران! کارکنان فوق‌العاده مودب و حرفه‌ای', customer: { firstName: 'نیلوفر', lastName: 'ک.' }, createdAt: '2024-01-15' },
      { id: 'rf2', rating: 5, comment: 'رنگ موهام رویایی شد، ممنون خانم محمدی', customer: { firstName: 'سحر', lastName: 'م.' }, createdAt: '2024-01-13' },
      { id: 'rf3', rating: 5, comment: 'محیط خیلی تمیز و آرامش‌بخش', customer: { firstName: 'مریم', lastName: 'ع.' }, createdAt: '2024-01-11' },
    ],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
  {
    id: 'f2', slug: 'roza-beauty', name: 'سالن روزا', gender: 'FEMALE',
    city: 'تهران', address: 'یوسف‌آباد، خیابان جمال‌زاده', phone: '02188001122',
    coverUrl: null, logoUrl: null, rating: 4.7, reviewCount: 178,
    isVerified: true, isFeatured: false, description: 'متخصص در رنگ‌های مدرن و هایلایت',
    minPrice: 200000,
    services: [
      { id: 'sf7', name: 'هایلایت', price: 400000, durationMinutes: 150 },
      { id: 'sf8', name: 'بالیاژ', price: 600000, durationMinutes: 180 },
      { id: 'sf9', name: 'کوتاهی مدرن', price: 200000, durationMinutes: 60 },
    ],
    staff: [
      { id: 'stf4', displayName: 'رزا احمدی', specialties: ['هایلایت', 'بالیاژ', 'رنگ فانتزی'], services: [] },
    ],
    reviews: [
      { id: 'rf4', rating: 5, comment: 'هایلایتم رو عاشقم! دقیقاً همان چیزی که می‌خواستم', customer: { firstName: 'آرین', lastName: 'ش.' }, createdAt: '2024-01-14' },
    ],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '10:00', closeTime: '19:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
  {
    id: 'f3', slug: 'nails-art-studio', name: 'استودیو ناخن آرت', gender: 'FEMALE',
    city: 'اصفهان', address: 'خیابان شیخ بهایی', phone: '03133445566',
    coverUrl: null, logoUrl: null, rating: 4.8, reviewCount: 245,
    isVerified: true, isFeatured: true, description: 'تخصص در ناخن، ژل، و اکستنشن',
    minPrice: 90000,
    services: [
      { id: 'sf10', name: 'مانیکور ساده', price: 90000, durationMinutes: 45 },
      { id: 'sf11', name: 'ژل ناخن', price: 250000, durationMinutes: 90 },
      { id: 'sf12', name: 'اکستنشن ناخن', price: 400000, durationMinutes: 120 },
      { id: 'sf13', name: 'طرح ناخن', price: 50000, durationMinutes: 30 },
    ],
    staff: [
      { id: 'stf5', displayName: 'ندا کریمی', specialties: ['ژل ناخن', 'طرح ناخن', 'اکستنشن'], services: [] },
      { id: 'stf6', displayName: 'زهرا علوی', specialties: ['مانیکور', 'پدیکور'], services: [] },
    ],
    reviews: [
      { id: 'rf5', rating: 5, comment: 'طرح ناخنام خیلی قشنگ شد', customer: { firstName: 'لیلا', lastName: 'ب.' }, createdAt: '2024-01-16' },
    ],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
  {
    id: 'f4', slug: 'gloria-beauty-mashhad', name: 'گلوریا بیوتی', gender: 'FEMALE',
    city: 'مشهد', address: 'بلوار سجاد، جنب پارک ملت', phone: '05138001234',
    coverUrl: null, logoUrl: null, rating: 4.6, reviewCount: 132,
    isVerified: true, isFeatured: false, description: 'سالن زیبایی زنانه با تخصص در میکاپ و آرایش عروس',
    minPrice: 180000,
    services: [
      { id: 'sf14', name: 'میکاپ روزانه', price: 180000, durationMinutes: 60 },
      { id: 'sf15', name: 'آرایش عروس', price: 1500000, durationMinutes: 180 },
      { id: 'sf16', name: 'اصلاح ابرو', price: 60000, durationMinutes: 20 },
    ],
    staff: [
      { id: 'stf7', displayName: 'گلنار شاهی', specialties: ['آرایش عروس', 'میکاپ مجلسی'], services: [] },
    ],
    reviews: [],
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '10:00', closeTime: '20:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
];

export const MOCK_AVAILABLE_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

export const MOCK_MY_BOOKINGS = [
  {
    id: 'b1', status: 'CONFIRMED', totalPrice: 140000,
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    salon: { id: 'm1', name: 'باربر کلاسیک', slug: 'barber-classic-tehran', city: 'تهران' },
    items: [{ service: { name: 'کوتاهی + اصلاح' } }],
    staff: { displayName: 'استاد محمد' },
  },
  {
    id: 'b2', status: 'COMPLETED', totalPrice: 95000,
    startsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
    salon: { id: 'm2', name: 'جنتلمن کاتس', slug: 'gentleman-cuts', city: 'تهران' },
    items: [{ service: { name: 'کوتاهی مدرن' } }],
    staff: { displayName: 'داریوش رضایی' },
  },
  {
    id: 'b3', status: 'CANCELLED', totalPrice: 350000,
    startsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    salon: { id: 'f1', name: 'لاکچری بیوتی', slug: 'lux-beauty-tehran', city: 'تهران' },
    items: [{ service: { name: 'رنگ مو' } }],
    staff: { displayName: 'خانم محمدی' },
  },
];

export function getMockSalonBySlug(slug: string) {
  return [...MOCK_SALONS_MALE, ...MOCK_SALONS_FEMALE].find(s => s.slug === slug) || null;
}

// Mock data for salon owner dashboard
export const MOCK_OWNER_SALONS = [
  {
    id: 'm1', slug: 'barber-classic-tehran', name: 'باربر کلاسیک', gender: 'MALE',
    city: 'تهران', address: 'جردن، خیابان آفریقا', phone: '02188776655',
    status: 'ACTIVE', rating: 4.8, reviewCount: 124,
    isVerified: true, description: 'آرایشگاه مردانه کلاسیک با بیش از ۱۵ سال سابقه',
    _count: { bookings: 48, reviews: 124 },
    workingHours: [
      { dayOfWeek: 'SATURDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'SUNDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'MONDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'TUESDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'WEDNESDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'THURSDAY', isOpen: true, openTime: '09:00', closeTime: '21:00' },
      { dayOfWeek: 'FRIDAY', isOpen: false, openTime: null, closeTime: null },
    ],
  },
];

export const MOCK_SALON_BOOKINGS = [
  {
    id: 'sb1', status: 'CONFIRMED', totalPrice: 140000,
    startsAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 1 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    customer: { firstName: 'علی', lastName: 'کریمی' },
    items: [{ service: { name: 'کوتاهی + اصلاح' } }],
    staff: { displayName: 'استاد محمد' },
  },
  {
    id: 'sb2', status: 'PENDING', totalPrice: 85000,
    startsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    customer: { firstName: 'رضا', lastName: 'محمدی' },
    items: [{ service: { name: 'کوتاهی مو' } }],
    staff: { displayName: 'استاد علی' },
  },
  {
    id: 'sb3', status: 'COMPLETED', totalPrice: 250000,
    startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    customer: { firstName: 'سعید', lastName: 'احمدی' },
    items: [{ service: { name: 'رنگ مو' } }],
    staff: { displayName: 'استاد محمد' },
  },
  {
    id: 'sb4', status: 'CONFIRMED', totalPrice: 65000,
    startsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
    customer: { firstName: 'امیر', lastName: 'حسینی' },
    items: [{ service: { name: 'اصلاح ریش' } }],
    staff: null,
  },
];

export const MOCK_SALON_SERVICES = [
  { id: 's1', name: 'کوتاهی مو', price: 85000, durationMinutes: 30, isActive: true, categoryId: 'cat1', category: { name: 'کوتاهی' } },
  { id: 's2', name: 'اصلاح ریش', price: 65000, durationMinutes: 20, isActive: true, categoryId: 'cat1', category: { name: 'اصلاح' } },
  { id: 's3', name: 'کوتاهی + اصلاح', price: 140000, durationMinutes: 50, isActive: true, categoryId: 'cat1', category: { name: 'پکیج' } },
  { id: 's4', name: 'رنگ مو', price: 250000, durationMinutes: 90, isActive: true, categoryId: 'cat2', category: { name: 'رنگ' } },
  { id: 's5', name: 'کراتین', price: 450000, durationMinutes: 150, isActive: false, categoryId: 'cat2', category: { name: 'رنگ' } },
];

export const MOCK_SALON_STAFF = [
  { id: 'st1', displayName: 'استاد محمد', specialties: ['کوتاهی کلاسیک', 'اصلاح صورت'], bio: 'بیش از ۱۰ سال تجربه در آرایشگری مردانه', avatarUrl: null, services: [{id:'s1'},{id:'s2'}], isActive: true },
  { id: 'st2', displayName: 'استاد علی', specialties: ['رنگ مو', 'هایلایت', 'کراتین'], bio: 'متخصص رنگ و تکنیک‌های مدرن', avatarUrl: null, services: [{id:'s4'},{id:'s5'}], isActive: true },
];

export const MOCK_SERVICE_CATEGORIES = [
  { id: 'cat1', name: 'کوتاهی و اصلاح', icon: '✂️' },
  { id: 'cat2', name: 'رنگ و کراتین', icon: '🎨' },
  { id: 'cat3', name: 'مراقبت پوست', icon: '🧴' },
  { id: 'cat4', name: 'ناخن', icon: '💅' },
];
