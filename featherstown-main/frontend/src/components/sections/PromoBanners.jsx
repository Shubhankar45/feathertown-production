/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Dual Promotional Split Banners
   /components/sections/PromoBanners.jsx

   Directly modeled on the reference design:
   - Banner 1 (Left): Warm Peach/Oat (#FCEFEA), "Play More, Sing More",
     Tomato Red pill button "Shop Toys →", toy/play imagery.
   - Banner 2 (Right): Soft Mint/Sage (#EAF2EC), "Healthy Birds, Happier Tomorrows",
     Forest Green pill button "Shop Wellness →", nutrition/wellness imagery.
   - 100% responsive, equal height, rounded 24px cards.
   - 100% customizable from Admin Panel.
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import pineCrop from "../../assets/birds/crop-pineapple-conure.jpg";
import cockatielCrop from "../../assets/birds/crop-cockatiel.jpg";

export default function PromoBanners() {
  const { settings } = useSettings();

  const banner1 = settings?.promoBanners?.[0] || {};
  const banner2 = settings?.promoBanners?.[1] || {};

  const b1Title = banner1.title || "Play More, Sing More";
  const b1Subtitle =
    banner1.subtitle ||
    "Explore our interactive puzzle & foraging toy collection for endless fun!";
  const b1Btn = banner1.buttonText || "Shop Toys";
  const b1Link = banner1.link || "/accessories?category=toys";
  const b1Img = banner1.image || pineCrop;

  const b2Title = banner2.title || "Healthy Birds, Happier Tomorrows";
  const b2Subtitle =
    banner2.subtitle ||
    "Save up to 30% on select organic diet blends and avian wellness products.";
  const b2Btn = banner2.buttonText || "Shop Wellness";
  const b2Link = banner2.link || "/accessories?category=wellness";
  const b2Img = banner2.image || cockatielCrop;

  return (
    <section
      style={{
        padding: "clamp(24px, 4vw, 44px) clamp(20px, 4.5vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        fontFamily: "Outfit, system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "clamp(20px, 3vw, 28px)",
          width: "100%",
        }}
      >
        {/* Banner 1: Play & Foraging (Warm Peach/Oat) */}
        {banner1.active !== false && (
          <div
            className="t-hover-lift"
            style={{
              background: banner1.bgGradient || "#FCEFEA",
              borderRadius: 24,
              padding: "clamp(28px, 4.5vw, 40px) clamp(20px, 3.5vw, 36px)",
              border: "1px solid #F5D0C5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              minHeight: 240,
            }}
          >
            <div style={{ maxWidth: "60%", zIndex: 2 }}>
              <h3
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: "clamp(24px, 2.6vw, 32px)",
                  fontWeight: 900,
                  color: "#D9381E",
                  lineHeight: 1.15,
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                {b1Title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "#736B5E",
                  margin: "0 0 22px 0",
                }}
              >
                {b1Subtitle}
              </p>
              <Link
                to={b1Link}
                className="t-btn-press"
                style={{
                  background: "#D9381E",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 22px",
                  borderRadius: 999,
                  boxShadow: "0 4px 12px rgba(217, 56, 30, 0.25)",
                }}
              >
                <span>{b1Btn}</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </Link>
            </div>

            {/* Right Image Cutout */}
            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 0,
                width: "clamp(130px, 16vw, 190px)",
                height: "clamp(140px, 18vw, 210px)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <img
                src={b1Img}
                alt={b1Title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = pineCrop;
                }}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.12))",
                }}
              />
            </div>
          </div>
        )}

        {/* Banner 2: Wellness & Nutrition (Soft Mint/Sage) */}
        {banner2.active !== false && (
          <div
            className="t-hover-lift"
            style={{
              background: banner2.bgGradient || "#EAF2EC",
              borderRadius: 24,
              padding: "clamp(28px, 4.5vw, 40px) clamp(20px, 3.5vw, 36px)",
              border: "1px solid #CCE0D0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              minHeight: 240,
            }}
          >
            <div style={{ maxWidth: "60%", zIndex: 2 }}>
              <h3
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: "clamp(24px, 2.6vw, 32px)",
                  fontWeight: 900,
                  color: "#1B3B22",
                  lineHeight: 1.15,
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                {b2Title}
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "#736B5E",
                  margin: "0 0 22px 0",
                }}
              >
                {b2Subtitle}
              </p>
              <Link
                to={b2Link}
                className="t-btn-press"
                style={{
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 22px",
                  borderRadius: 999,
                  boxShadow: "0 4px 12px rgba(27, 59, 34, 0.2)",
                }}
              >
                <span>{b2Btn}</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </Link>
            </div>

            {/* Right Image Cutout */}
            <div
              style={{
                position: "absolute",
                right: 12,
                bottom: 0,
                width: "clamp(130px, 16vw, 190px)",
                height: "clamp(140px, 18vw, 210px)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <img
                src={b2Img}
                alt={b2Title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = cockatielCrop;
                }}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.12))",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
