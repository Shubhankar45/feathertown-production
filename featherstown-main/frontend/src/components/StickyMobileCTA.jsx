import { Link } from "react-router-dom";
import { Phone, MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { trackWhatsAppClick } from "../utils/analytics";

export default function StickyMobileCTA() {
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const waNum = (settings?.whatsapp || "919556747518").replace(/\D/g, "");
  const phone = settings?.phone || "+91 95567 47518";

  const handleWhatsAppClick = () => {
    trackWhatsAppClick("sticky_mobile_cta");
    const text = encodeURIComponent(
      "Hi FeatherTown Aviary! I'm browsing on mobile and would like to inquire about available companion birds and live photos."
    );
    window.open(`https://wa.me/${waNum}?text=${text}`, "_blank");
  };

  return (
    <aside
      aria-label="Quick mobile contact and actions"
      className="ft-sticky-mobile-bar"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9990,
        background: "rgba(250, 248, 245, 0.98)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid #E2DDD3",
        boxShadow: "0 -4px 20px rgba(27, 59, 34, 0.08)",
        padding: "8px 14px calc(8px + env(safe-area-inset-bottom, 4px))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <style>{`
        @media (min-width: 769px) {
          .ft-sticky-mobile-bar {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. Quick Call Aviary Button */}
      <a
        href={`tel:${phone.replace(/\s+/g, "")}`}
        className="t-btn-press"
        aria-label="Call FeatherTown Aviary"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
          border: "1px solid #E2DDD3",
          borderRadius: 12,
          padding: "6px 10px",
          color: "#1B3B22",
          textDecoration: "none",
          minWidth: 54,
          height: 44,
        }}
      >
        <Phone size={16} strokeWidth={2.2} />
        <span style={{ fontSize: 9.5, fontWeight: 700, marginTop: 2 }}>Call</span>
      </a>

      {/* 2. Direct WhatsApp Primary CTA (Tomato Red Accent) */}
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className="t-btn-press"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "#D9381E",
          color: "#FFFFFF",
          border: "none",
          borderRadius: 12,
          height: 44,
          padding: "0 14px",
          fontSize: 13.5,
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 3px 12px rgba(217, 56, 30, 0.35)",
        }}
      >
        <MessageCircle size={16} strokeWidth={2.2} />
        <span>Chat &amp; Adopt Birds</span>
      </button>

      {/* 3. Floating Quick Cart Button */}
      <Link
        to="/cart"
        className="t-btn-press"
        aria-label={`View cart with ${cartCount} items`}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1B3B22",
          borderRadius: 12,
          color: "#FFFFFF",
          textDecoration: "none",
          minWidth: 54,
          height: 44,
          padding: "6px 10px",
        }}
      >
        <ShoppingCart size={16} strokeWidth={2.2} />
        <span style={{ fontSize: 9.5, fontWeight: 700, marginTop: 2 }}>Cart</span>

        {cartCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#D9381E",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: 800,
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #FAF8F5",
            }}
          >
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </Link>
    </aside>
  );
}

