import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'BarberCore Admin', template: '%s | Admin' },
  description: 'پنل مدیریت BarberCore',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      style={
        {
          '--font-sans': 'Vazirmatn, "Noto Sans Arabic", Tahoma, system-ui, sans-serif',
          '--font-body': 'var(--font-sans)',
        } as React.CSSProperties
      }
    >
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
      <body data-typography="admin" className="antialiased">
        {children}
      </body>
    </html>
  );
}
