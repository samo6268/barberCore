import {
  AdvertisementStatus,
  AdvertisementType,
  DayOfWeek,
  GenderType,
  PrismaClient,
  SalonStatus,
  StaffStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type DemoService = {
  name: string;
  categorySlug: string;
  durationMinutes: number;
  price: number;
  discountPrice?: number;
};

async function upsertDemoService(
  salonId: string,
  categoryId: string,
  service: DemoService,
  sortOrder: number,
) {
  const existing = await prisma.service.findFirst({
    where: { salonId, name: service.name },
  });
  const data = {
    salonId,
    categoryId,
    name: service.name,
    durationMinutes: service.durationMinutes,
    price: service.price,
    discountPrice: service.discountPrice,
    isActive: true,
    isOnlineBookable: true,
    sortOrder,
  };

  return existing
    ? prisma.service.update({ where: { id: existing.id }, data })
    : prisma.service.create({ data });
}

async function upsertSalonHour(salonId: string, dayOfWeek: DayOfWeek, isOpen: boolean) {
  const existing = await prisma.workingHour.findFirst({
    where: { salonId, staffId: null, dayOfWeek },
  });
  const data = {
    salonId,
    staffId: null,
    dayOfWeek,
    isOpen,
    openTime: isOpen ? '09:00' : '00:00',
    closeTime: isOpen ? '21:00' : '00:00',
    breakStart: isOpen ? '13:00' : null,
    breakEnd: isOpen ? '14:00' : null,
  };

  return existing
    ? prisma.workingHour.update({ where: { id: existing.id }, data })
    : prisma.workingHour.create({ data });
}

async function seedDemoMarketplace(categories: Array<{ id: string; slug: string }>) {
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));
  const owner = await prisma.user.upsert({
    where: { phone: '09121111111' },
    update: { firstName: 'مریم', lastName: 'صادقی', role: UserRole.SALON_OWNER, isActive: true },
    create: {
      phone: '09121111111',
      firstName: 'مریم',
      lastName: 'صادقی',
      role: UserRole.SALON_OWNER,
      isPhoneVerified: true,
    },
  });

  const demoSalons = [
    {
      slug: 'luxe-beauty',
      name: 'لوکس بیوتی',
      description:
        'سالن لوکس بیوتی با تیمی از متخصصان باتجربه، خدمات حرفه‌ای مو، رنگ و زیبایی را در محیطی آرام ارائه می‌کند.',
      genderType: GenderType.FEMALE,
      phone: '02188776655',
      address: 'تهران، نیاوران، خیابان باهنر',
      city: 'تهران',
      province: 'تهران',
      coverImageUrl: '/images/salons/01.svg',
      logoUrl: '/images/salons/04.svg',
      rating: 4.9,
      reviewCount: 312,
      services: [
        { name: 'کوتاهی مو', categorySlug: 'haircut', durationMinutes: 60, price: 800_000 },
        {
          name: 'رنگ مو',
          categorySlug: 'color',
          durationMinutes: 120,
          price: 2_500_000,
          discountPrice: 2_200_000,
        },
        { name: 'مراقبت پوست', categorySlug: 'skincare', durationMinutes: 60, price: 950_000 },
      ],
      staff: [
        {
          phone: '09122222221',
          firstName: 'سارا',
          lastName: 'کریمی',
          displayName: 'سارا کریمی',
          avatarUrl: '/images/instructors/01.svg',
          specialties: ['کوتاهی مو', 'رنگ مو'],
          serviceNames: ['کوتاهی مو', 'رنگ مو'],
        },
        {
          phone: '09122222222',
          firstName: 'لیلا',
          lastName: 'احمدی',
          displayName: 'لیلا احمدی',
          avatarUrl: '/images/instructors/02.svg',
          specialties: ['مراقبت پوست', 'کوتاهی مو'],
          serviceNames: ['کوتاهی مو', 'مراقبت پوست'],
        },
      ],
      featured: true,
    },
    {
      slug: 'barber-classics',
      name: 'باربر کلاسیک',
      description:
        'باربر کلاسیک با تمرکز بر کوتاهی، اصلاح ریش و خدمات حرفه‌ای آقایان، رزرو سریع و بدون انتظار را فراهم می‌کند.',
      genderType: GenderType.MALE,
      phone: '02122334455',
      address: 'تهران، سعادت‌آباد، خیابان علامه',
      city: 'تهران',
      province: 'تهران',
      coverImageUrl: '/images/salons/02.svg',
      logoUrl: '/images/salons/06.svg',
      rating: 4.8,
      reviewCount: 224,
      services: [
        {
          name: 'کوتاهی مردانه',
          categorySlug: 'haircut',
          durationMinutes: 45,
          price: 500_000,
        },
        { name: 'اصلاح ریش', categorySlug: 'beard', durationMinutes: 30, price: 300_000 },
        {
          name: 'پاکسازی پوست',
          categorySlug: 'skincare',
          durationMinutes: 60,
          price: 700_000,
        },
      ],
      staff: [
        {
          phone: '09123333331',
          firstName: 'علی',
          lastName: 'محمدی',
          displayName: 'علی محمدی',
          avatarUrl: '/images/instructors/03.svg',
          specialties: ['کوتاهی مردانه', 'اصلاح ریش'],
          serviceNames: ['کوتاهی مردانه', 'اصلاح ریش', 'پاکسازی پوست'],
        },
      ],
      featured: false,
    },
    {
      slug: 'rose-salon',
      name: 'رز سالن',
      description:
        'رز سالن مرکز تخصصی خدمات ناخن و مراقبت پوست است و نوبت‌های خود را به‌صورت آنلاین ارائه می‌کند.',
      genderType: GenderType.FEMALE,
      phone: '03136655443',
      address: 'اصفهان، چهارباغ بالا',
      city: 'اصفهان',
      province: 'اصفهان',
      coverImageUrl: '/images/salons/03.svg',
      logoUrl: '/images/salons/07.svg',
      rating: 4.7,
      reviewCount: 178,
      services: [
        { name: 'مانیکور', categorySlug: 'nail', durationMinutes: 60, price: 400_000 },
        { name: 'پدیکور', categorySlug: 'nail', durationMinutes: 90, price: 600_000 },
        {
          name: 'فیشیال تخصصی',
          categorySlug: 'skincare',
          durationMinutes: 75,
          price: 850_000,
        },
      ],
      staff: [
        {
          phone: '09124444441',
          firstName: 'نازنین',
          lastName: 'احمدی',
          displayName: 'نازنین احمدی',
          avatarUrl: '/images/instructors/05.svg',
          specialties: ['ناخن', 'مراقبت پوست'],
          serviceNames: ['مانیکور', 'پدیکور', 'فیشیال تخصصی'],
        },
      ],
      featured: false,
    },
  ];

  for (const [salonIndex, demo] of demoSalons.entries()) {
    const salon = await prisma.salon.upsert({
      where: { slug: demo.slug },
      update: {
        ownerId: owner.id,
        name: demo.name,
        description: demo.description,
        genderType: demo.genderType,
        status: SalonStatus.ACTIVE,
        phone: demo.phone,
        address: demo.address,
        city: demo.city,
        province: demo.province,
        coverImageUrl: demo.coverImageUrl,
        logoUrl: demo.logoUrl,
        rating: demo.rating,
        reviewCount: demo.reviewCount,
        isVerified: true,
      },
      create: {
        slug: demo.slug,
        ownerId: owner.id,
        name: demo.name,
        description: demo.description,
        genderType: demo.genderType,
        status: SalonStatus.ACTIVE,
        phone: demo.phone,
        address: demo.address,
        city: demo.city,
        province: demo.province,
        coverImageUrl: demo.coverImageUrl,
        logoUrl: demo.logoUrl,
        rating: demo.rating,
        reviewCount: demo.reviewCount,
        isVerified: true,
        onboardingStep: 5,
      },
    });

    const services = [];
    for (const [serviceIndex, service] of demo.services.entries()) {
      const categoryId = categoryIds.get(service.categorySlug);
      if (!categoryId) throw new Error(`Missing category: ${service.categorySlug}`);
      services.push(await upsertDemoService(salon.id, categoryId, service, serviceIndex + 1));
    }

    for (const [staffIndex, demoStaff] of demo.staff.entries()) {
      const user = await prisma.user.upsert({
        where: { phone: demoStaff.phone },
        update: {
          firstName: demoStaff.firstName,
          lastName: demoStaff.lastName,
          role: UserRole.STAFF,
          isActive: true,
        },
        create: {
          phone: demoStaff.phone,
          firstName: demoStaff.firstName,
          lastName: demoStaff.lastName,
          role: UserRole.STAFF,
          isPhoneVerified: true,
        },
      });
      const profile = await prisma.staffProfile.upsert({
        where: { userId_salonId: { userId: user.id, salonId: salon.id } },
        update: {
          displayName: demoStaff.displayName,
          avatarUrl: demoStaff.avatarUrl,
          specialties: demoStaff.specialties,
          status: StaffStatus.ACTIVE,
          sortOrder: staffIndex + 1,
        },
        create: {
          userId: user.id,
          salonId: salon.id,
          displayName: demoStaff.displayName,
          avatarUrl: demoStaff.avatarUrl,
          specialties: demoStaff.specialties,
          status: StaffStatus.ACTIVE,
          sortOrder: staffIndex + 1,
        },
      });

      const serviceIds = services
        .filter((service) => demoStaff.serviceNames.includes(service.name))
        .map((service) => service.id);
      await prisma.staffService.deleteMany({ where: { staffId: profile.id } });
      await prisma.staffService.createMany({
        data: serviceIds.map((serviceId) => ({ staffId: profile.id, serviceId })),
        skipDuplicates: true,
      });
    }

    for (const day of Object.values(DayOfWeek)) {
      await upsertSalonHour(salon.id, day, day !== DayOfWeek.FRIDAY);
    }

    if (demo.featured) {
      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() - 1);
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 30);
      const advertisement = await prisma.advertisement.findFirst({
        where: { salonId: salon.id, type: AdvertisementType.FEATURED },
      });
      const adData = {
        salonId: salon.id,
        type: AdvertisementType.FEATURED,
        status: AdvertisementStatus.ACTIVE,
        startsAt,
        endsAt,
        fixedPrice: 5_000_000,
        targetCity: salon.city,
        targetGender: salon.genderType,
      };
      if (advertisement) {
        await prisma.advertisement.update({ where: { id: advertisement.id }, data: adData });
      } else {
        await prisma.advertisement.create({ data: adData });
      }
    }

    console.log(`   Demo salon ${salonIndex + 1}: ${salon.name}`);
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Service categories
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { slug: 'haircut' },
      update: {},
      create: { name: 'کوتاهی مو', slug: 'haircut', sortOrder: 1 },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'beard' },
      update: {},
      create: { name: 'اصلاح ریش', slug: 'beard', sortOrder: 2 },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'color' },
      update: {},
      create: { name: 'رنگ مو', slug: 'color', sortOrder: 3 },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'skincare' },
      update: {},
      create: { name: 'مراقبت پوست', slug: 'skincare', sortOrder: 4 },
    }),
    prisma.serviceCategory.upsert({
      where: { slug: 'nail' },
      update: {},
      create: { name: 'ناخن', slug: 'nail', sortOrder: 5 },
    }),
  ]);

  // Super admin
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@barbercore.ir' },
    update: {},
    create: {
      email: 'admin@barbercore.ir',
      phone: '+989100000000',
      passwordHash: adminHash,
      firstName: 'سوپر',
      lastName: 'ادمین',
      role: UserRole.SUPER_ADMIN,
      isPhoneVerified: true,
      isEmailVerified: true,
    },
  });

  await seedDemoMarketplace(categories);

  // Default SMS templates
  const templates = [
    {
      key: 'otp_login',
      body: 'کد ورود پرنگارین: {{code}}\nاین کد تا ۵ دقیقه معتبر است.',
    },
    {
      key: 'booking_confirmed',
      body: 'رزرو شما در {{salon_name}} برای تاریخ {{date}} ساعت {{time}} تأیید شد.\nکد رزرو: {{booking_id}}',
    },
    {
      key: 'booking_reminder',
      body: 'یادآوری: فردا ساعت {{time}} نوبت شما در {{salon_name}} است.',
    },
    {
      key: 'booking_cancelled',
      body: 'رزرو شما در {{salon_name}} لغو شد. برای اطلاعات بیشتر تماس بگیرید.',
    },
  ];

  for (const tpl of templates) {
    const existing = await prisma.smsTemplate.findFirst({ where: { salonId: null, key: tpl.key } });
    if (!existing) {
      await prisma.smsTemplate.create({ data: { key: tpl.key, body: tpl.body } });
    }
  }

  // System settings
  await prisma.systemSetting.upsert({
    where: { key: 'default_commission_rate' },
    update: {},
    create: { key: 'default_commission_rate', value: '5', updatedBy: superAdmin.id },
  });
  await prisma.systemSetting.upsert({
    where: { key: 'booking_cancellation_window_hours' },
    update: {},
    create: {
      key: 'booking_cancellation_window_hours',
      value: '2',
      updatedBy: superAdmin.id,
    },
  });

  console.log('✅ Seed complete');
  console.log(`   SuperAdmin: admin@barbercore.ir / Admin@1234`);
  console.log(`   Categories: ${categories.map((c) => c.name).join(', ')}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
