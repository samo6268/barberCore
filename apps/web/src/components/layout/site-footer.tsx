import Link from 'next/link';
import { ScissorsIcon } from '@ui/icons/custom';

const ABOUT_LINKS = [
  { label: 'درباره ما',          href: '/about' },
  { label: 'چطور کار می‌کنیم',   href: '/about#how-it-works' },
  { label: 'مطبوعات',            href: '/blog' },
  { label: 'تماس با ما',         href: '/contact' },
];

const SERVICE_LINKS = [
  { label: 'آرایشگاه‌های مردانه', href: '/salons?gender=male' },
  { label: 'سالن‌های زنانه',      href: '/salons?gender=female' },
  { label: 'آکادمی',             href: '/academy' },
  { label: 'ثبت سالن',           href: '/salons/new' },
];

const BOTTOM_LINKS = [
  { label: 'حریم خصوصی', href: '/privacy' },
  { label: 'قوانین',      href: '/terms' },
  { label: 'کوکی‌ها',    href: '/privacy#cookies' },
];

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--brand-navy-600)', color: 'var(--bg-ivory)' }}>
      <div className="container-editorial py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-display font-semibold text-lg mb-3"
              style={{ color: 'var(--brand-gold-400)' }}>
              <ScissorsIcon size={20} />
              پرنگارین
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-navy-200)' }}>
              پلتفرم رزرو آنلاین آرایشگاه و سالن زیبایی در ایران
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider mb-5" style={{ color: 'var(--brand-gold-600)' }}>درباره</h4>
            <ul className="space-y-3">
              {ABOUT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--brand-navy-200)' }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider mb-5" style={{ color: 'var(--brand-gold-600)' }}>خدمات</h4>
            <ul className="space-y-3">
              {SERVICE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white"
                    style={{ color: 'var(--brand-navy-200)' }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider mb-5" style={{ color: 'var(--brand-gold-600)' }}>تماس</h4>
            <ul className="space-y-3">
              <li className="text-sm" style={{ color: 'var(--brand-navy-200)' }}>info@barbercore.ir</li>
              <li className="text-sm" style={{ color: 'var(--brand-navy-200)' }}>۰۲۱-۸۸۷۷۶۶۵۵</li>
              <li className="text-sm" style={{ color: 'var(--brand-navy-200)' }}>تهران، خیابان ولیعصر</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--brand-navy-500)' }}>
          <p className="text-xs" style={{ color: 'var(--brand-navy-300)' }}>
            © ۱۴۰۳ پرنگارین — تمام حقوق محفوظ است
          </p>
          <div className="flex gap-5">
            {BOTTOM_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="text-xs transition-colors hover:text-white"
                style={{ color: 'var(--brand-navy-300)' }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
