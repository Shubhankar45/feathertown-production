import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { safeStorage } from "../utils/security";

const CONSENT_KEY = "ft_cookie_consent_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const saved = safeStorage.get(CONSENT_KEY, null);
    if (!saved) {
      // Show banner after brief delay for smooth appearance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom trigger to re-open modal (from footer "Cookie Settings" link)
  useEffect(() => {
    const handleReopen = () => {
      const saved = safeStorage.get(CONSENT_KEY, null);
      if (saved) {
        setAnalyticsAllowed(saved.analytics ?? true);
        setMarketingAllowed(saved.marketing ?? false);
      }
      setModalOpen(true);
    };
    window.addEventListener("ft_reopen_cookie_preferences", handleReopen);
    return () => window.removeEventListener("ft_reopen_cookie_preferences", handleReopen);
  }, []);

  const savePreferences = (analytics, marketing) => {
    const payload = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    safeStorage.set(CONSENT_KEY, payload);
    setVisible(false);
    setModalOpen(false);

    window.dispatchEvent(
      new CustomEvent("ft_cookie_consent_updated", { detail: payload })
    );
  };

  const handleAcceptAll = () => savePreferences(true, true);
  const handleEssentialOnly = () => savePreferences(false, false);
  const handleSaveCustom = () => savePreferences(analyticsAllowed, marketingAllowed);

  if (!visible && !modalOpen) return null;

  return (
    <>
      {/* Floating Consent Banner */}
      {visible && !modalOpen && (
        <div
          role="dialog"
          aria-label="Cookie consent banner"
          style={{
            position: "fixed",
            bottom: "clamp(12px, 3vw, 24px)",
            left: "clamp(12px, 3vw, 24px)",
            right: "clamp(12px, 3vw, 24px)",
            maxWidth: 580,
            margin: "0 auto",
            zIndex: 99998,
            background: "#FAF8F5",
            borderRadius: 20,
            padding: "clamp(14px, 3vw, 20px) clamp(14px, 3vw, 24px)",
            boxShadow: "0 16px 40px rgba(27, 59, 34, 0.12)",
            border: "1px solid #E2DDD3",
            animation: "fadeUp .4s cubic-bezier(.16,1,.3,1)",
            fontFamily: "Outfit, system-ui, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "#E7EFE8",
                color: "#1B3B22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              🍪
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#152B17",
                  marginBottom: 6,
                }}
              >
                We value your privacy
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#736B5E",
                  lineHeight: 1.55,
                  marginBottom: 16,
                }}
              >
                We use cookies to improve your shopping experience, remember cart items, and provide secure checkout. Read our{" "}
                <Link
                  to="/privacy-policy"
                  style={{ color: "#1B3B22", textDecoration: "underline", fontWeight: 700 }}
                >
                  Privacy Policy
                </Link>
                .
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handleAcceptAll}
                  className="t-btn-press"
                  style={{
                    background: "#D9381E",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "9px 20px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 3px 12px rgba(217, 56, 30, 0.3)",
                  }}
                >
                  Accept All
                </button>
                <button
                  onClick={handleEssentialOnly}
                  className="t-btn-press"
                  style={{
                    background: "#FFFFFF",
                    color: "#1B3B22",
                    border: "1px solid #E2DDD3",
                    padding: "9px 18px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Essential Only
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  style={{
                    background: "transparent",
                    color: "#736B5E",
                    border: "none",
                    padding: "9px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(21, 43, 23, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            fontFamily: "Outfit, system-ui, sans-serif",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FAF8F5",
              borderRadius: 24,
              padding: "clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px)",
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 24px 64px rgba(27, 59, 34, 0.2)",
              border: "1px solid #E2DDD3",
              animation: "scaleIn .25s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 id="cookie-modal-title" style={{ fontSize: 20, fontWeight: 800, color: "#152B17" }}>
                Cookie Preferences
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2DDD3",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#736B5E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#736B5E", lineHeight: 1.5, marginBottom: 20 }}>
              Choose which categories of cookies you permit. Strictly essential cookies are required for shopping cart and authentication functions.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {/* Essential */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "#FFFFFF",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#152B17" }}>Strictly Necessary</div>
                  <div style={{ fontSize: 12, color: "#736B5E" }}>Cart items, security &amp; login session</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1B3B22", background: "#E7EFE8", border: "1px solid #B8D4BA", padding: "3px 8px", borderRadius: 99 }}>
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <label
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "#FFFFFF",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#152B17" }}>Analytics &amp; Performance</div>
                  <div style={{ fontSize: 12, color: "#736B5E" }}>Anonymous usage metrics to help improve speed</div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsAllowed}
                  onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#1B3B22" }}
                />
              </label>

              {/* Marketing */}
              <label
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "#FFFFFF",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#152B17" }}>Personalized Offers</div>
                  <div style={{ fontSize: 12, color: "#736B5E" }}>Special species discounts &amp; bundle suggestions</div>
                </div>
                <input
                  type="checkbox"
                  checked={marketingAllowed}
                  onChange={(e) => setMarketingAllowed(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: "#1B3B22" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "#FFFFFF",
                  color: "#152B17",
                  border: "1px solid #E2DDD3",
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustom}
                className="t-btn-press"
                style={{
                  background: "#D9381E",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(217, 56, 30, 0.3)",
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
