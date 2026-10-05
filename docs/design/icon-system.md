# Parnegarin icon system

All product icons in Marketplace, salon management, Staff Portal, education,
Admin and shared UI use **Phosphor Icons React 2.1.10**. The dependency belongs
to `@barbercore/ui`; applications import its shared entry point:

```tsx
import { CalendarDays, Flower2, Gift, Star, X } from '@barbercore/ui/icons';

<Flower2 size={28} />
<CalendarDays size={20} />
<Star size={18} weight={selected ? 'fill' : 'regular'} />
<X size={18} />
```

## Style rules

- Domain, navigation, empty-state and notification icons default to `duotone`.
- Compact controls, arrows, search, editor tools and spinners use `regular`.
- Ratings and favorites explicitly switch between `regular` and `fill`.
- Icons inherit `currentColor` and accept size, className, style and SVG props.
- Use the component's `weight` for visual emphasis; do not use strokeWidth or
  fill utility classes to simulate a weight.
- Decorative icons are hidden from assistive technology by default. Put the
  accessible name on their button/link. Standalone meaningful icons can use
  `alt`, `aria-label` or `aria-labelledby`.
- Keep brand artwork and photographs as brand/image assets.

The icon layer uses individual SSR-compatible Phosphor imports, so both server
and client components work without an icon provider or external asset request.
Pure export initializers allow unused icons to be removed from production
bundles. Existing semantic component names remain available to keep consumer
code stable; every rendered shape comes from Phosphor.

The Persian calendar overrides its navigation icons, Sonner overrides its
status icons, and map zoom controls use the same Plus/Minus components. Loader
icons in shared buttons, dashboards and map searches use SpinnerGap.

`/design-system` contains a responsive gallery and examples of selected rating,
favorite and loading states. SVG data attributes identify library, shape and
weight for deployment/visual checks.

## Release validation

- Production builds for `web` and `admin`, including TypeScript validation.
- Source/dependency audit for a single icon-library entry point.
- Browser checks at 1680px and 390px: full-width homepage, loaded category
  photos, duotone gallery, calendar navigation/date selection, selectable star
  ratings, notification icons and Admin navigation.
- Local visual checks use an unavailable-backend response or fixture data;
  they do not verify production database access.
