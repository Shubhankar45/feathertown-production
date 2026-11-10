/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Promo Banners
   /components/sections/PromoBanners.jsx
   Strict 60-30-10 Palette:
   Oat Milk (#FAF8F5, #FFFFFF, #E2DDD3), Forest Green (#1B3B22)
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
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
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
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "clamp(24px, 4vw, 36px) clamp(20px, 4vw, 32px)",
              color: "#152B17",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 20px rgba(21, 43, 23, 0.04)",
              border: "1px solid #E2DDD3",
              position: "relative",
              overflow: "hidden",
              flexWrap: "wrap",
              gap: 16,
              transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1B3B22";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(21, 43, 23, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2DDD3";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(21, 43, 23, 0.04)";
            }}
          >
            <div style={{ maxWidth: 340, zIndex: 2 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#1B3B22",
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
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: 8,
                  color: "#152B17",
                }}
              >
                {b.title}
              </h3>
              <p style={{ fontSize: 14, color: "#736B5E", marginBottom: 20, lineHeight: 1.5 }}>
                {b.subtitle}
              </p>
              <Link
                to={b.link || "/accessories"}
                style={{
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  padding: "11px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13.5,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(27, 59, 34, 0.2)",
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
                border: "3px solid #E2DDD3",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
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
