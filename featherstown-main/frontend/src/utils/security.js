/**
 * ═══════════════════════════════════════════════════════════════
 * FRONTEND SECURITY UTILITY ("Secrets of Frontend")
 * ═══════════════════════════════════════════════════════════════
 * Guidelines & Safeguards:
 * 1. NEVER store API private secrets, JWT private keys, or passwords in frontend.
 * 2. Sanitize user inputs and rendered content against Cross-Site Scripting (XSS).
 * 3. Enforce safe URL schemes (prevent `javascript:`, `data:`, or phishing redirects).
 * 4. Safe sessionStorage/localStorage access (handling private browsing quotas).
 * 5. Force HTTPS protocol checks in browser environments.
 */

// Force HTTPS in client if deployed on a live domain
export function enforceHttps() {
  if (typeof window === "undefined") return;
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".local");

  if (!isLocal && window.location.protocol === "http:") {
    window.location.href = window.location.href.replace("http:", "https:");
  }
}

/**
 * Strips script tags, unsafe HTML elements, and event handlers
 * @param {string} str - Raw user input
 * @returns {string} Sanitized string
 */
export function sanitizeText(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
    .trim();
}

/**
 * Validates URLs before opening in window.open or <a> href
 * @param {string} url - Target URL
 * @returns {string} Safe URL or safe fallback
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  const protocolMatch = trimmed.match(/^([a-z0-9+.-]+):/i);
  if (!protocolMatch) {
    // Relative URL (e.g. /accessories) is safe
    return trimmed;
  }
  const protocol = protocolMatch[1].toLowerCase();
  if (["http", "https", "mailto", "tel"].includes(protocol)) {
    return trimmed;
  }
  console.warn(`Blocked unsafe URL scheme: ${protocol}`);
  return "#";
}

/**
 * Safe wrapper around localStorage with fallback for Safari private mode
 */
export const safeStorage = {
  get(key, fallback = null) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // silent
    }
  },
};
