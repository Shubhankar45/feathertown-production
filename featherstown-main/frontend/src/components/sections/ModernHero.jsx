/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Editorial Avian Hero Section
   /components/sections/ModernHero.jsx

   Directly modeled on the reference design:
   - Left: Confident brand eyebrow, bold "Everything Your Bird Needs",
     descriptive subhead, primary Tomato Red "Shop Now →" pill button,
     and 3 horizontal trust indicators (Better Nutrition, Happier Birds, Certified Aviary).
   - Right: Clean companion bird imagery with floating Forest Green
     watermark badge ("Birds Make Life Brighter ❤️").
   - Strict 60-30-10 palette (Oat Milk 60%, Forest Green 30%, Tomato Red 10%).
   - Zero emojis, 100% Lucide React line icons.
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { ArrowRight, Wheat, Heart, ShieldCheck } from "lucide-react";
import heroImg from "../../assets/hero-perched.jpg";
import sunImg from "../../assets/birds/crop-sun-conure.jpg";

export default function ModernHero() {
  return (
    <section
      style={{
        position: "relative",
        background: "#FAF8F5",
        color: "#152B17",
        width: "100%",
        paddingTop: "clamp(36px, 6vw, 68px)",
        paddingBottom: "clamp(40px, 6vw, 76px)",
        fontFamily: "Outfit, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          padding: "0 clamp(16px, 4.5vw, 64px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "clamp(32px, 5vw, 64px)",
            alignItems: "center",
          }}
        >
          {/* ══════════════════════════════════════════
              LEFT COLUMN: Confident Editorial Copy
             ══════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#E7EFE8",
                border: "1px solid #B8D4BA",
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 800,
                color: "#1B3B22",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                width: "fit-content",
                marginBottom: 20,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1B3B22" }} />
              <span>LOVE. CARE. FLOCK.</span>
            </div>

            {/* Master Headline */}
            <h1
              style={{
                fontSize: "clamp(36px, 4.8vw, 64px)",
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "#152B17",
                margin: "0 0 18px 0",
              }}
            >
              Everything <br />
              <span style={{ color: "#1B3B22" }}>Your Bird</span> Needs
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(16px, 1.3vw, 18px)",
                lineHeight: 1.6,
                color: "#736B5E",
                margin: "0 0 32px 0",
                maxWidth: 520,
              }}
            >
              Premium organic nutrition, spacious habitats, and certified hand-tamed companion birds for happier, healthier flocks.
            </p>

            {/* CTA Button Group */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 36,
              }}
            >
              <Link
                to="/accessories"
                className="t-hover-lift t-btn-press"
                style={{
                  background: "#D9381E",
                  color: "#FFFFFF",
                  padding: "14px 34px",
                  borderRadius: 999,
                  fontSize: 15,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 6px 18px rgba(217, 56, 30, 0.3)",
                  transition: "background 0.2s, transform 0.2s",
                }}
              >
                <span>Shop Now</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </Link>
            </div>

            {/* 3 Horizontal Trust Indicators directly below CTA */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px, 3vw, 32px)",
                flexWrap: "wrap",
                paddingTop: 20,
                borderTop: "1px solid #E2DDD3",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#EAF2EC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1B3B22",
                  }}
                >
                  <Wheat size={16} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1B3B22" }}>
                  Better Nutrition
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#FDF2E9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D9381E",
                  }}
                >
                  <Heart size={16} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1B3B22" }}>
                  Happier Birds
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#EAF2EC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1B3B22",
                  }}
                >
                  <ShieldCheck size={16} strokeWidth={2.4} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1B3B22" }}>
                  Certified Aviary
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN: Clean Pet Showcase
             ══════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 580,
              margin: "0 auto",
            }}
          >
            {/* Main Stage Image Container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 16px 44px -8px rgba(27, 59, 34, 0.12), 0 2px 8px rgba(0,0,0,0.04)",
                border: "1px solid #E2DDD3",
                background: "#FAF8F5",
              }}
            >
              <img
                src={heroImg || sunImg}
                alt="Happy companion birds resting comfortably in FeatherTown aviary"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Gradient Scrim for subtle contrast */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(21, 43, 23, 0.25) 0%, transparent 40%)",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Floating Watermark Badge: Forest Green (Upper Right) */}
            <div
              style={{
                position: "absolute",
                top: -16,
                right: -12,
                background: "#1B3B22",
                color: "#FAF8F5",
                borderRadius: "50%",
                width: "clamp(100px, 12vw, 124px)",
                height: "clamp(100px, 12vw, 124px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 12,
                boxShadow: "0 12px 28px rgba(27, 59, 34, 0.28)",
                border: "3px solid #FAF8F5",
                zIndex: 10,
                transform: "rotate(6deg)",
              }}
            >
              <Heart size={20} fill="#FAF8F5" strokeWidth={0} style={{ marginBottom: 4 }} />
              <span
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "0.2px",
                }}
              >
                Birds Make <br /> Life Brighter
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
