import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { QueryProvider } from '@/components/shared/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'پرنگارین | رزرو آنلاین آرایشگاه',
    template: '%s | پرنگارین',
  },
  description: 'پلتفرم رزرو آنلاین آرایشگاه و سالن زیبایی در ایران',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'پرنگارین',
  },
};

export const viewport: Viewport = {
  themeColor: '#1e293b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-theme-background text-theme-text antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <QueryProvider>
            {children}
            <Toaster position="top-center" richColors dir="rtl" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
