import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semantic theme tokens (CSS var-driven) ── */
        'theme-primary':     'var(--color-primary)',
        'theme-primary-fg':  'var(--color-primary-foreground)',
        'theme-accent':      'var(--color-accent)',
        'theme-highlight':   'var(--color-highlight)',
        'theme-bg':          'var(--color-background)',
        'theme-surface':     'var(--color-surface)',
        'theme-raised':      'var(--color-surface-raised)',
        'theme-border':      'var(--color-border)',
        'theme-text':        'var(--color-text)',
        'theme-muted':       'var(--color-text-muted)',
        'theme-subtle':      'var(--color-text-subtle)',

        /* ── Brand Plum ── */
        'plum': {
          50:  '#F5EBF4',
          100: '#E3CBE1',
          200: '#C99BC6',
          300: '#AE6BAB',
          400: '#8A4C87',
          500: '#6B3568',
          600: '#4B244A',
          700: '#3A1C39',
          800: '#2D1530',
          900: '#1A0B1C',
          950: '#0D050E',
        },

        /* ── Brand Gold ── */
        'gold': {
          50:  '#FBF6E8',
          100: '#F3E5B8',
          200: '#EBD388',
          300: '#E3C158',
          400: '#E5C682',
          500: '#DCBA6A',
          600: '#D8B76A',
          700: '#C4A054',
          800: '#9C7E3C',
          900: '#6B5428',
          950: '#3A2D14',
        },

        /* ── Brand Rose ── */
        'rose-brand': {
          50:  '#FBF1F4',
          100: '#F3D8E2',
          200: '#EAC5D1',
          300: '#DDA8BB',
          400: '#CE90A8',
          500: '#C28BAB',
          600: '#C98FA3',
          700: '#B07A8D',
          800: '#8F5E70',
          900: '#6B3F50',
          950: '#3A2030',
        },

        /* ── Brand Navy ── */
        'navy': {
          50:  '#ECEFF2',
          100: '#D2D8DE',
          200: '#B5BFC9',
          300: '#8D9BA8',
          400: '#4A5562',
          500: '#364452',
          600: '#1F2933',
          700: '#18212A',
          800: '#131A20',
          900: '#0F141A',
          950: '#080B0E',
        },

        /* ── Ivory ── */
        'ivory':      '#FAF7F2',
        'ivory-soft': '#F4EFE6',

        /* ── UI Gray ── */
        'ui-gray': {
          50:  '#F7F4F0',
          100: '#F0EBE5',
          200: '#E7E2DC',
          300: '#D4CCBF',
          400: '#B8B0A5',
          500: '#9A9188',
          600: '#7A7168',
          700: '#5C5550',
          800: '#3D3A36',
          900: '#1E1C1A',
        },
      },

      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-body)', 'Vazirmatn', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
        /* Explicit families for when needed without CSS vars */
        playfair:   ['"Playfair Display"', 'Georgia', 'serif'],
        cormorant:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
        vazirmatn:  ['Vazirmatn', 'system-ui', 'sans-serif'],
        inter:      ['Inter', 'system-ui', 'sans-serif'],
        estedad:    ['Estedad', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        /* Editorial type scale */
        'display-2xl': ['4.5rem',  { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        'display-xl':  ['3.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        'display-lg':  ['2.5rem',  { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md':  ['2rem',    { lineHeight: '1.2',  letterSpacing: '-0.015em' }],
        'h1':          ['1.875rem',{ lineHeight: '1.25' }],
        'h2':          ['1.5rem',  { lineHeight: '1.3' }],
        'h3':          ['1.25rem', { lineHeight: '1.4' }],
        'body-lg':     ['1.125rem',{ lineHeight: '1.7' }],
        'body':        ['1rem',    { lineHeight: '1.7' }],
        'body-sm':     ['0.875rem',{ lineHeight: '1.6' }],
        'caption':     ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },

      maxWidth: {
        'editorial': '1320px',
        'content':   '860px',
        'narrow':    '640px',
      },

      borderRadius: {
        'sm':   'var(--radius-sm)',
        'md':   'var(--radius-md)',
        'lg':   'var(--radius-lg)',
        'xl':   'var(--radius-xl)',
        '2xl':  'var(--radius-2xl)',
      },

      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '600': '600ms',
        '800': '800ms',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'clip-reveal': {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'gold-underline': {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
      },

      animation: {
        'fade-up':       'fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'clip-reveal':   'clip-reveal 800ms ease-in-out forwards',
        'scale-in':      'scale-in 300ms ease-out forwards',
        'gold-underline':'gold-underline 600ms ease-out forwards',
      },

      backgroundImage: {
        'plum-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234B244A' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
