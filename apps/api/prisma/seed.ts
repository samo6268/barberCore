import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  // Default SMS templates
  const templates = [
    {
      key: 'otp_login',
      body: 'کد ورود بارِبِرکُر: {{code}}\nاین کد تا ۵ دقیقه معتبر است.',
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
