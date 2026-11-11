/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Editorial Avian Hero Section
   /components/sections/ModernHero.jsx

   Faithful to the Zuvipaw reference layout:
   - Full-width expansive editorial layout with responsive horizontal padding
   - 100% customizable via Admin Panel (Hero image, title, subtitle, CTAs, badge, trust chips)
   - Single high-resolution companion birds photograph with instant fallback
   - Rounded corner showcase card with soft border & subtle shadow
   - Floating Forest Green circular badge ("Birds Make Life Brighter")
   - Strict 60-30-10 palette (Oat Milk 60%, Forest Green 30%, Tomato Red 10%)
   - 100% Lucide React line icons (zero emojis)
   - Flawlessly responsive across mobile, tablet, laptop, and ultra-wide
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { ArrowRight, Wheat, Heart, ShieldCheck, Feather } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import heroBirdsCompanion from "../../assets/hero-birds-companion.jpg";

export default function ModernHero() {
  const { settings } = useSettings();

  // Dynamic admin-customizable values with rock-solid fallbacks
  const heroImageSrc = settings?.heroImage && settings.heroImage.trim()
    ? settings.heroImage.trim()
    : heroBirdsCompanion;

  const eyebrow = settings?.heroBadgeText || "LOVE. CARE. FLOCK.";
  const title = settings?.heroTitle || "Everything Your Bird Needs";
  const subtitle =
    settings?.heroSubtitle ||
    "Premium organic nutrition, spacious habitats, and certified hand-tamed companion birds for happier, healthier flocks.";
  const floatingBadge = settings?.heroFloatingBadge || "Birds Make Life Brighter";
  const ctaText = settings?.heroCtaText || "Shop Now";
  const ctaLink = settings?.heroCtaLink || "/accessories";
  const secondaryCtaText = settings?.heroSecondaryCtaText || "Browse Birds";
  const secondaryCtaLink = settings?.heroSecondaryCtaLink || "/birds";

  const trust1 = settings?.heroTrust1 || "Better Nutrition";
  const trust2 = settings?.heroTrust2 || "Happier Birds";
  const trust3 = settings?.heroTrust3 || "Certified Aviary";

  return (
    <section
      style={{
        position: "relative",
        background: "#FAF8F5",
        color: "#152B17",
        width: "100%",
        paddingTop: "clamp(24px, 3.5vw, 48px)",
        paddingBottom: "clamp(32px, 4.5vw, 60px)",
        fontFamily: "Outfit, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          padding: "0 clamp(20px, 4.5vw, 64px)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 500px), 1fr))",
            gap: "clamp(32px, 4.5vw, 72px)",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* ══════════════════════════════════════════
              LEFT COLUMN: Confident Editorial Copy
             ══════════════════════════════════════════ */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 660,
              width: "100%",
            }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#EAF2EC",
                border: "1px solid #CCE0D0",
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 800,
                color: "#1B3B22",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                width: "fit-content",
                marginBottom: "clamp(14px, 2.5vw, 20px)",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1B3B22" }} />
              <span>{eyebrow}</span>
            </div>

            {/* Master Headline */}
            <h1
              style={{
                fontSize: "clamp(36px, 4.6vw, 62px)",
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "#152B17",
                margin: "0 0 16px 0",
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(15.5px, 1.25vw, 18px)",
                lineHeight: 1.6,
                color: "#736B5E",
                margin: "0 0 28px 0",
                maxWidth: 580,
              }}
            >
              {subtitle}
            </p>

            {/* CTA Button Group */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: "clamp(24px, 3.5vw, 36px)",
              }}
            >
              <Link
                to={ctaLink}
                className="t-hover-lift t-btn-press"
                style={{
                  background: "#D9381E",
                  color: "#FFFFFF",
                  padding: "15px 36px",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 6px 20px rgba(217, 56, 30, 0.28)",
                  transition: "background 0.2s, transform 0.2s",
                }}
              >
                <span>{ctaText}</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </Link>

              {secondaryCtaText && (
                <Link
                  to={secondaryCtaLink}
                  className="t-hover-lift t-btn-press"
                  style={{
                    background: "#FFFFFF",
                    color: "#1B3B22",
                    border: "1.5px solid #E2DDD3",
                    padding: "14px 28px",
                    borderRadius: 999,
                    fontSize: 14.5,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{secondaryCtaText}</span>
                  <Feather size={15} strokeWidth={2.2} />
                </Link>
              )}
            </div>

            {/* 3 Horizontal Trust Indicators */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(14px, 2.5vw, 32px)",
                flexWrap: "wrap",
                paddingTop: 20,
                borderTop: "1px solid #E2DDD3",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#EAF2EC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1B3B22",
                  }}
                >
                  <Wheat size={17} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1B3B22" }}>
                  {trust1}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#FDF2E9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D9381E",
                  }}
                >
                  <Heart size={17} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1B3B22" }}>
                  {trust2}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "#EAF2EC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1B3B22",
                  }}
                >
                  <ShieldCheck size={17} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1B3B22" }}>
                  {trust3}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN: Full-Width Showcase Card
             ══════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {/* Ambient Organic Light Aura Backdrop */}
            <div
              style={{
                position: "absolute",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(234, 242, 236, 0.75) 0%, rgba(253, 242, 233, 0.55) 50%, rgba(250, 248, 245, 0) 72%)",
                filter: "blur(32px)",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />

            {/* Showcase Image Card */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 10",
                minHeight: "clamp(300px, 38vw, 540px)",
                borderRadius: "clamp(22px, 2.5vw, 32px)",
                overflow: "hidden",
                border: "1.5px solid #E2DDD3",
                boxShadow:
                  "0 22px 50px -10px rgba(27, 59, 34, 0.14), 0 4px 14px rgba(0, 0, 0, 0.04)",
                background: "#FFFFFF",
                zIndex: 1,
              }}
            >
              <img
                src={heroImageSrc}
                alt={title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = heroBirdsCompanion;
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 26%",
                  display: "block",
                  transition: "transform 0.4s ease",
                }}
              />
            </div>

            {/* Floating Forest Green Circular Badge ("Birds Make Life Brighter") */}
            <div
              style={{
                position: "absolute",
                top: "clamp(-16px, -1.8vw, -10px)",
                right: "clamp(-14px, -1.5vw, -6px)",
                background: "#1B3B22",
                color: "#FAF8F5",
                borderRadius: "50%",
                width: "clamp(92px, 10.5vw, 118px)",
                height: "clamp(92px, 10.5vw, 118px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 10,
                boxShadow: "0 12px 28px rgba(27, 59, 34, 0.32)",
                border: "3.5px solid #FAF8F5",
                zIndex: 10,
                transform: "rotate(6deg)",
                pointerEvents: "none",
              }}
            >
              <Heart size={18} fill="#FAF8F5" strokeWidth={0} style={{ marginBottom: 3 }} />
              <span
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: "clamp(10px, 0.9vw, 12px)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "0.2px",
                  whiteSpace: "pre-line",
                }}
              >
                {floatingBadge.replace(/\s+(Make|Life|Brighter)/gi, "\n$1")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
