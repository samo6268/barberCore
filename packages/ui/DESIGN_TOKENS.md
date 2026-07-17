# BarberCore Design Tokens

## Philosophy
"Editorial Luxury" — warm, premium, photography-first. Inspired by Beautyblvdsalon, Glossier, Aesop, Boulevard.

---

## Color Palette

### Brand Plum (`--brand-plum-*`)
The primary brand identity color. Deep, rich, editorial.

| Token | Value | Usage |
|-------|-------|-------|
| `plum-50` | `#F5EBF4` | Hover backgrounds, featured badge bg |
| `plum-100` | `#E3CBE1` | Tinted backgrounds, selection |
| `plum-200` | `#C99BC6` | Borders on plum surfaces |
| `plum-400` | `#8A4C87` | Secondary text on light bg |
| `plum-600` | `#4B244A` | **Primary brand** — buttons, headers, logo |
| `plum-800` | `#2D1530` | Hover state of plum-600 |
| `plum-900` | `#1A0B1C` | Text on gold backgrounds |

**Rule:** Never use plum below 400 for text. Never use plum-800/900 as button bg (too dark for readability).

### Brand Gold (`--brand-gold-*`)
The accent color for premium indicators, underlines, and highlights.

| Token | Value | Usage |
|-------|-------|-------|
| `gold-50` | `#FBF6E8` | Featured card background |
| `gold-100` | `#F3E5B8` | Text on navy/plum dark surfaces |
| `gold-400` | `#E5C682` | Decorative elements |
| `gold-600` | `#D8B76A` | **Primary gold** — underlines, borders, quote glyphs |
| `gold-800` | `#9C7E3C` | Text on light gold backgrounds |

**Rule:** Gold is NEVER used as a primary button color. It's decorative and hierarchical only.

### Brand Rose (`--brand-rose-*`)
The accent for female-theme UI elements, CTAs, and warm highlights.

| Token | Value | Usage |
|-------|-------|-------|
| `rose-50` | `#FBF1F4` | Hero section background tint |
| `rose-200` | `#EAC5D1` | Avatar default background |
| `rose-600` | `#C98FA3` | **Primary rose** — female accent, CTA banners, badges |
| `rose-800` | `#8F5E70` | Hover state of rose-600 |

### Brand Navy (`--brand-navy-*`)
The primary color for male theme. Also used in footer, admin UI.

| Token | Value | Usage |
|-------|-------|-------|
| `navy-50` | `#ECEFF2` | Light backgrounds |
| `navy-400` | `#4A5562` | Secondary text, icons |
| `navy-600` | `#1F2933` | **Primary navy** — male buttons, admin sidebar |
| `navy-900` | `#0F141A` | Modal backdrop tint, footer bg |

### Ivory (`--bg-ivory`, `--bg-ivory-soft`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-ivory` | `#FAF7F2` | Primary page background |
| `--bg-ivory-soft` | `#F4EFE6` | Section alternation, card surfaces, pull quote bg |

**Rule:** Never use pure white (#FFF) as page background. Ivory creates warmth.

### UI Gray (`--ui-gray-*`)

| Token | Value | Usage |
|-------|-------|-------|
| `ui-gray-100` | `#F0EBE5` | Subtle hover on cards, table row hover |
| `ui-gray-200` | `#E7E2DC` | Borders, dividers, input underlines |
| `ui-gray-400` | `#B8B0A5` | Placeholder text, disabled states |
| `ui-gray-500` | `#9A9188` | Muted text (captions, metadata) |

---

## Theme Variants

### `[data-theme="female"]` (default — FEMALE & UNISEX salons)
- Primary: `plum-600`
- Accent: `rose-600`
- Highlight: `gold-600`
- Background: `ivory` (#FAF7F2)
- Display font: Playfair Display / Estedad

### `[data-theme="male"]` (MALE salons)
- Primary: `navy-600`
- Accent: `gold-600`
- Highlight: `plum-600` (minimal use)
- Background: `#F7F5F1` (cooler ivory)
- Display font: Cormorant Garamond / Estedad

**Switching theme:** Set `data-theme="male"` on the `<html>` or nearest container element. All `var(--color-*)` tokens update automatically.

---

## Typography

### Font Stack
- **Display (Farsi):** Estedad (variable, 200–900)
- **Display (Latin Female):** Playfair Display (400–700)
- **Display (Latin Male):** Cormorant Garamond (300–700)
- **Body:** Vazirmatn (Farsi) + Inter (Latin)
- **Mono:** JetBrains Mono (admin code blocks)

### Type Scale
| Class | Size | Line Height | Letter Spacing | Use |
|-------|------|-------------|----------------|-----|
| `text-display-2xl` | 4.5rem | 1.05 | -0.04em | Hero headline (female only) |
| `text-display-xl`  | 3.5rem | 1.1  | -0.03em | Section headlines |
| `text-display-lg`  | 2.5rem | 1.15 | -0.02em | Feature headlines |
| `text-display-md`  | 2rem   | 1.2  | -0.015em | Card titles, sub-sections |
| `text-h1`          | 1.875rem | 1.25 | — | Page h1 |
| `text-h2`          | 1.5rem | 1.3  | — | Section h2 |
| `text-h3`          | 1.25rem | 1.4 | — | Sub-sections |
| `text-body-lg`     | 1.125rem | 1.7 | — | Lead paragraphs |
| `text-body`        | 1rem | 1.7 | — | Default body |
| `text-body-sm`     | 0.875rem | 1.6 | — | Secondary info |
| `text-caption`     | 0.75rem | 1.5 | +0.05em | Labels, eyebrows (uppercase) |

### Rules
1. Headings: display font, weight 500–700 **only**. Never 800/900.
2. Body: weight 400 regular, 500 for emphasis. Never bold inside body paragraphs.
3. Captions in uppercase+tracking: ONLY for section eyebrows (e.g. "SERVICES", "CHAPTER 01").

---

## Spacing Rhythm

- Base unit: 4px
- Section padding: `py-20` mobile / `py-32` desktop
- Container max-width: `1320px`
- Container horizontal padding: `px-6` → `px-12` → `px-20`
- Inter-section gap: minimum `96px` desktop
- Primary card padding: `p-10`
- Secondary card padding: `p-6`

---

## Component Rules

### Buttons
- Never use drop shadows
- Hover via color shift (plum-600 → plum-800) + 4px Y translate up
- Border radius: `rounded-md` (6px) — not pill, not sharp

### Cards
- Never use box shadows
- Hierarchy via background color tone only
- Border radius: `rounded-2xl` (16px)

### Inputs
- Underline-only style (no box borders)
- Focus: `border-b-color-primary` + floating label transition

### Images
- Always use `next/image` with `blurDataURL`
- Hero: 16/9 desktop, 4/5 mobile
- Cards: 3/4 portrait
- Never generic stock placeholder images

---

## Motion

- Default reveal: `opacity 0→1` + `translateY 40px→0` over 600ms `ease-out`
- Image reveals: `clipPath inset` over 800ms
- All motion respects `prefers-reduced-motion: reduce`
- Library: `framer-motion` + `lenis` for smooth scroll
