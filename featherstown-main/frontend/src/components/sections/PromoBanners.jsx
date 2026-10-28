/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Promo Banners (Dark Minimal)
   /components/sections/PromoBanners.jsx
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import sunImg from "../../assets/Sun-conure.jfif";
import cocketailImg from "../../assets/cocketail.jpg";

export default function PromoBanners() {
  const { settings } = useSettings();
  const rawBanners = Array.isArray(settings?.promoBanners) ? settings.promoBanners : [];
  const banners = rawBanners.filter((b) => b.active !== false);

  if (banners.length === 0) return null;

  const defaultImgs = [sunImg, cocketailImg];

  return (
    <section
      style={{
        padding: "clamp(32px, 5vw, 56px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FFFFFF",
        borderTop: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
        }}
      >
        {banners.map((b, idx) => (
          <div
            key={b.id || idx}
            className="ft-card-lift"
            style={{
              background: idx % 2 === 0
                ? "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)"
                : "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
              borderRadius: 24,
              padding: "clamp(24px, 4vw, 36px) clamp(20px, 4vw, 32px)",
              color: "#0F172A",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
              border: idx % 2 === 0 ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
              position: "relative",
              overflow: "hidden",
              flexWrap: "wrap",
              gap: 16,
              transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#059669";
              e.currentTarget.style.boxShadow = "0 10px 28px rgba(5, 150, 105, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = idx % 2 === 0 ? "#A7F3D0" : "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(15, 23, 42, 0.05)";
            }}
          >
            <div style={{ maxWidth: 340, zIndex: 2 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#059669",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Special Offer
              </span>
              <h3
                style={{
                  fontSize: "clamp(22px, 2.6vw, 30px)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: 8,
                  color: "#0F172A",
                }}
              >
                {b.title}
              </h3>
              <p style={{ fontSize: 14, color: "#475569", marginBottom: 20, lineHeight: 1.5 }}>
                {b.subtitle}
              </p>
              <Link
                to={b.link || "/accessories"}
                style={{
                  background: "#059669",
                  color: "#FFFFFF",
                  padding: "11px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13.5,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)",
                }}
              >
                <span>{b.buttonText || "Explore"}</span>
                <span>›</span>
              </Link>
            </div>

            <div
              className="ft-animate-float"
              style={{
                position: "relative",
                width: "clamp(84px, 20vw, 115px)",
                height: "clamp(84px, 20vw, 115px)",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #FFFFFF",
                boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
                flexShrink: 0,
              }}
            >
              <img
                src={defaultImgs[idx % defaultImgs.length]}
                alt={b.title}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
