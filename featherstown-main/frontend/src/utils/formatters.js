/* ═══════════════════════════════════════════════════════════════
   FeatherTown — Bulletproof Date & Currency Formatters
   Prevents any RangeError or TypeError from crashing React UI.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Safely format any date or timestamp string.
 * Never throws RangeError: Invalid time value.
 */
export function safeFormatDate(
  dateVal,
  options = { day: "2-digit", month: "short", year: "numeric" },
  fallback = "—"
) {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString("en-IN", options);
  } catch {
    return fallback;
  }
}

/**
 * Safely format date + time.
 */
export function safeFormatDateTime(dateVal, fallback = "—") {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

/**
 * Safely format currency amount to Indian Rupee (₹).
 */
export function safeFormatCurrency(amount, fallback = "₹0") {
  if (amount === null || amount === undefined || amount === "") return fallback;
  const num = Number(amount);
  if (isNaN(num)) return fallback;
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * Safely format numeric value with commas.
 */
export function safeFormatNumber(val, fallback = "0") {
  if (val === null || val === undefined || val === "") return fallback;
  const num = Number(val);
  if (isNaN(num)) return fallback;
  return num.toLocaleString("en-IN");
}

/**
 * Safely convert any value to lowercased string for search/filter operations.
 */
export function safeLower(val) {
  if (val === null || val === undefined) return "";
  return String(val).toLowerCase().trim();
}
