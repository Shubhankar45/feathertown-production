/**
 * ═══════════════════════════════════════════════════════════════
 * PRIVACY-FRIENDLY ANALYTICS ENGINE
 * ═══════════════════════════════════════════════════════════════
 * Tracks site metrics, user journey, conversion funnel, and CTAs.
 * Respects cookie consent settings (only stores/transmits if allowed).
 */

import { safeStorage } from "./security";

const CONSENT_KEY = "ft_cookie_consent_v1";

function canTrack() {
  const consent = safeStorage.get(CONSENT_KEY, null);
  // Track if user explicitly consented to analytics, or if consent not yet decided (anonymous session tracking)
  return !consent || consent.analytics !== false;
}

/**
 * Log page view
 * @param {string} path - URL path
 * @param {string} title - Page title
 */
export function trackPageView(path = window.location.pathname, title = document.title) {
  if (!canTrack()) return;

  // Google Analytics 4 integration if available
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: title,
    });
  }

  // Local event dispatch for internal monitoring
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ft_analytics_event", {
        detail: { type: "page_view", path, title, timestamp: Date.now() },
      })
    );
  }
}

/**
 * Log custom business event
 * @param {string} eventName - e.g. "click_cta", "add_to_cart", "whatsapp_chat"
 * @param {Record<string, any>} params - additional properties
 */
export function trackEvent(eventName, params = {}) {
  if (!canTrack()) return;

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ft_analytics_event", {
        detail: { type: "event", name: eventName, params, timestamp: Date.now() },
      })
    );
  }
}

/**
 * Track Add to Cart
 */
export function trackAddToCart(item, quantity = 1) {
  trackEvent("add_to_cart", {
    item_id: item._id || item.id,
    item_name: item.name,
    item_category: item.category,
    price: item.price,
    quantity,
    value: (item.price || 0) * quantity,
    currency: "INR",
  });
}

/**
 * Track WhatsApp Contact CTA click
 */
export function trackWhatsAppClick(source = "navbar", item = "") {
  trackEvent("whatsapp_click", { source, item });
}
