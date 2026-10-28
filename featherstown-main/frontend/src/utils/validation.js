/**
 * ═══════════════════════════════════════════════════════════════
 * FORM VALIDATION & SPAM / BOT PROTECTION UTILITY
 * ═══════════════════════════════════════════════════════════════
 */

// Email regex according to RFC 5322 specifications
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Indian 10-digit mobile number starting with 6-9
export const PHONE_REGEX = /^[6-9]\d{9}$/;

// Indian 6-digit PIN code
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim();
  return clean.length <= 254 && EMAIL_REGEX.test(clean);
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const clean = phone.replace(/[\s\-\(\)\+]/g, "").replace(/^91/, "");
  return PHONE_REGEX.test(clean);
}

export function isValidPincode(pin) {
  if (!pin || typeof pin !== "string") return false;
  return PINCODE_REGEX.test(pin.trim());
}

/**
 * Spam & Bot Protection Checker
 * 1. Checks if honeypot trap field was filled (bots auto-fill all visible/invisible fields).
 * 2. Checks time elapsed since form mount (submissions under 800ms are automated scripts).
 *
 * @param {string} honeypotValue - Value of the hidden honeypot input
 * @param {number} formMountedAt - Timestamp when the form component rendered (Date.now())
 * @param {number} minSubmissionMs - Minimum human interaction time (default 1000ms)
 * @returns {{ isBot: boolean, reason?: string }}
 */
export function checkBotSubmission(honeypotValue, formMountedAt, minSubmissionMs = 1000) {
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return { isBot: true, reason: "Honeypot field triggered" };
  }
  if (formMountedAt && Date.now() - formMountedAt < minSubmissionMs) {
    return { isBot: true, reason: "Submission too rapid (automated script detected)" };
  }
  return { isBot: false };
}
