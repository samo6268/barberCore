import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { CheckCircle, Info, Loader2, WarningCircle, XCircle } from '@barbercore/ui/icons';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { QueryProvider } from '@/components/shared/query-provider';
import { ConditionalNav } from '@/components/layout/conditional-nav';
import { ConditionalFooter } from '@/components/layout/conditional-footer';
import '@daypicker/react/style.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'پرنگارین | رزرو آنلاین سالن زیبایی و آرایشگاه',
    template: '%s | پرنگارین',
  },
  description:
    'سالن‌ها و متخصصان زیبایی را مقایسه کنید، خدمات و زمان‌های خالی را ببینید و نوبت خود را آنلاین رزرو کنید.',
  openGraph: {
    title: 'پرنگارین | انتخاب و رزرو آنلاین خدمات زیبایی',
    description: 'سالن، متخصص و زمان مناسب خود را پیدا کنید و بدون تماس تلفنی نوبت بگیرید.',
    locale: 'fa_IR',
    type: 'website',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'پرنگارین',
  },
};

export const viewport: Viewport = {
  themeColor: '#1d1715',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="neutral" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body
        className="font-sans antialiased"
        style={
          {
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
          } as React.CSSProperties
        }
      >
        <ThemeProvider attribute="data-theme" defaultTheme="neutral" enableSystem={false}>
          <QueryProvider>
            <ConditionalNav />
            {children}
            <ConditionalFooter />
            <Toaster
              position="top-center"
              richColors
              dir="rtl"
              icons={{
                success: <CheckCircle size={20} />,
                error: <XCircle size={20} />,
                warning: <WarningCircle size={20} />,
                info: <Info size={20} />,
                loading: <Loader2 size={20} className="animate-spin motion-reduce:animate-none" />,
              }}
           />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
