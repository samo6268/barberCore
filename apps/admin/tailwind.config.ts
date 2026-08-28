import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Vazirmatn', 'Tahoma', 'sans-serif'],
        display: ['var(--font-sans)', 'Vazirmatn', 'Tahoma', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '20px' }],
        sm: ['14px', { lineHeight: '24px' }],
        base: ['16px', { lineHeight: '28px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '32px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        caption: ['12px', { lineHeight: '20px' }],
        label: ['13px', { lineHeight: '20px' }],
        metric: ['24px', { lineHeight: '32px' }],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};
export default config;
