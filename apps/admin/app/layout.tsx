import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'BarberCore Admin', template: '%s | Admin' },
  description: 'پنل مدیریت BarberCore',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <style>{`
          @font-face {
            font-family: 'Vazirmatn';
            src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn[wght].woff2') format('woff2-variations');
            font-weight: 100 900;
            font-display: swap;
          }
        `}</style>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
