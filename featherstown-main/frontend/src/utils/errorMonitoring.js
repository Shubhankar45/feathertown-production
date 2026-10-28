/**
 * ═══════════════════════════════════════════════════════════════
 * CLIENT-SIDE ERROR MONITORING & REPORTING
 * ═══════════════════════════════════════════════════════════════
 */

const MAX_ERROR_HISTORY = 20;
const errorLog = [];

export function logClientError(errorInfo) {
  const payload = {
    message: errorInfo.message || String(errorInfo),
    stack: errorInfo.stack || null,
    source: errorInfo.source || window.location.href,
    line: errorInfo.lineno || null,
    col: errorInfo.colno || null,
    time: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  errorLog.unshift(payload);
  if (errorLog.length > MAX_ERROR_HISTORY) errorLog.pop();

  if (process.env.NODE_ENV !== "production") {
    console.error("[FeatherTown Error Monitor]", payload);
  }

  // Attempt sending beacon to backend error logging endpoint if available
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/log-error", JSON.stringify(payload));
    }
  } catch {
    // ignore beacon failure
  }
}

/**
 * Initializes global uncaught error and unhandled promise rejection listeners
 */
export function initErrorMonitoring() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    logClientError({
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logClientError({
      message: `Unhandled Promise: ${event.reason?.message || event.reason}`,
      stack: event.reason?.stack,
    });
  });
}
