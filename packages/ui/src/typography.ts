/**
 * BarberCore Typography System
 * Shared semantic scale for web, salon/staff operations, and admin.
 */

export const typographyConfig = {
  fonts: {
    display: {
      farsi: 'Vazirmatn',
    },
    body: {
      farsi: 'Vazirmatn',
      fallback: 'Noto Sans Arabic',
    },
    mono: 'ui-monospace',
  },

  scale: {
    'display-lg': { size: '32px', lineHeight: '44px', weight: 700 },
    h1: { size: '28px', lineHeight: '40px', weight: 700 },
    h2: { size: '24px', lineHeight: '36px', weight: 700 },
    h3: { size: '20px', lineHeight: '32px', weight: 600 },
    h4: { size: '18px', lineHeight: '28px', weight: 600 },
    'body-lg': { size: '16px', lineHeight: '28px', weight: 400 },
    body: { size: '14px', lineHeight: '24px', weight: 400 },
    'body-sm': { size: '13px', lineHeight: '22px', weight: 400 },
    label: { size: '13px', lineHeight: '20px', weight: 500 },
    button: { size: '14px', lineHeight: '22px', weight: 600 },
    caption: { size: '12px', lineHeight: '20px', weight: 400 },
    price: { size: '18px', lineHeight: '28px', weight: 700 },
    metric: { size: '24px', lineHeight: '32px', weight: 700 },
  },

  rules: {
    headings: 'Vazirmatn 600–700. Weight 700 is reserved for headings and KPI values.',
    body: 'Vazirmatn 400; use 500 for labels and 600 for emphasis.',
    captions: 'Vazirmatn 400 with an open 20px Persian line-height.',
  },
} as const;

export type TypeScale = keyof typeof typographyConfig.scale;
