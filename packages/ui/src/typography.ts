/**
 * BarberCore Typography System
 * Loaded via next/font in the web app layout.
 * This file exports font class names and metadata — actual loading
 * happens in apps/web/src/app/layout.tsx.
 */

export const typographyConfig = {
  fonts: {
    display: {
      female: 'Playfair Display',
      male: 'Cormorant Garamond',
      farsi: 'Estedad',
    },
    body: {
      farsi: 'Vazirmatn',
      latin: 'Inter',
    },
    mono: 'JetBrains Mono',
  },

  scale: {
    'display-2xl': { size: '4.5rem',   lineHeight: 1.05,  letterSpacing: '-0.04em' },
    'display-xl':  { size: '3.5rem',   lineHeight: 1.1,   letterSpacing: '-0.03em' },
    'display-lg':  { size: '2.5rem',   lineHeight: 1.15,  letterSpacing: '-0.02em' },
    'display-md':  { size: '2rem',     lineHeight: 1.2,   letterSpacing: '-0.015em' },
    'h1':          { size: '1.875rem', lineHeight: 1.25 },
    'h2':          { size: '1.5rem',   lineHeight: 1.3 },
    'h3':          { size: '1.25rem',  lineHeight: 1.4 },
    'body-lg':     { size: '1.125rem', lineHeight: 1.7 },
    'body':        { size: '1rem',     lineHeight: 1.7 },
    'body-sm':     { size: '0.875rem', lineHeight: 1.6 },
    'caption':     { size: '0.75rem',  lineHeight: 1.5,   letterSpacing: '0.05em' },
  },

  rules: {
    headings: 'Display font, weight 500–700. Never 800/900.',
    body: '400 regular, 500 for emphasis. Never bold inside paragraphs.',
    captions: 'Uppercase tracking-wide reserved for section eyebrows.',
  },
} as const;

export type TypeScale = keyof typeof typographyConfig.scale;
