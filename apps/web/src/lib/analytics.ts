export type MarketplaceEvent =
  | 'marketplace_viewed'
  | 'hero_search_submitted'
  | 'service_selected'
  | 'salon_card_opened'
  | 'salon_favorited'
  | 'filter_applied'
  | 'booking_started'
  | 'booking_date_selected'
  | 'booking_time_selected'
  | 'booking_login_requested'
  | 'booking_completed'
  | 'review_submitted'
  | 'referral_copied';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * A provider-neutral event layer. It feeds dataLayer when an analytics vendor
 * is installed and keeps a small local queue while the MVP is being validated.
 * The queue is intentionally capped and contains no phone, email or token.
 */
export function trackEvent(name: MarketplaceEvent, properties: EventProperties = {}) {
  if (typeof window === 'undefined') return;

  const event = {
    name,
    properties,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push({ event: name, ...properties });

  try {
    const key = 'parnegarin:funnel-events';
    const previous = JSON.parse(localStorage.getItem(key) || '[]');
    const next = Array.isArray(previous) ? [...previous.slice(-99), event] : [event];
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Analytics must never block the customer journey.
  }
}
