import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Cormorant_Garamond, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { QueryProvider } from '@/components/shared/query-provider';
import { ConditionalNav } from '@/components/layout/conditional-nav';
import { ConditionalFooter } from '@/components/layout/conditional-footer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

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
  themeColor: '#4B244A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-theme="female"
      suppressHydrationWarning
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body
        className="font-sans antialiased"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text)',
          fontFamily: 'Vazirmatn, Inter, system-ui, sans-serif',
          '--font-display': '"Playfair Display", Estedad, Georgia, serif',
          '--font-body': 'Vazirmatn, Inter, system-ui, sans-serif',
          '--font-mono': '"JetBrains Mono", monospace',
        } as React.CSSProperties}
      >
        <ThemeProvider attribute="data-theme" defaultTheme="female" enableSystem={false}>
          <QueryProvider>
            <ConditionalNav />
            {children}
            <ConditionalFooter />
            <Toaster position="top-center" richColors dir="rtl" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

