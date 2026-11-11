/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Editorial Avian Hero Section
   /components/sections/ModernHero.jsx

   Faithful to the Zuvipaw reference layout:
   - Clean Oat Milk (#FAF8F5) background with warm editorial typography
   - Single ultra-high-resolution companion birds photograph
     (Sun Conure & Cockatiel perched warmly together on rope)
   - Rounded corner showcase card with soft border & subtle shadow
   - Floating Forest Green circular badge ("Birds Make Life Brighter")
   - Strict 60-30-10 palette (Oat Milk 60%, Forest Green 30%, Tomato Red 10%)
   - 100% Lucide React line icons (zero emojis)
   - Flawlessly responsive across mobile, tablet, laptop, and ultra-wide
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { ArrowRight, Wheat, Heart, ShieldCheck, Feather } from "lucide-react";
import heroBirdsCompanion from "../../assets/hero-birds-companion.jpg";

export default function ModernHero() {
  return (
    <section
      style={{
        position: "relative",
        background: "#FAF8F5",
        color: "#152B17",
        width: "100%",
        paddingTop: "clamp(28px, 4.5vw, 56px)",
        paddingBottom: "clamp(36px, 5.5vw, 68px)",
        fontFamily: "Outfit, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 56px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "clamp(28px, 4.5vw, 60px)",
            alignItems: "center",
          }}
        >
          {/* ══════════════════════════════════════════
              LEFT COLUMN: Confident Editorial Copy
             ══════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 580 }}>
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
              <span>LOVE. CARE. FLOCK.</span>
            </div>

            {/* Master Headline */}
            <h1
              style={{
                fontSize: "clamp(34px, 4.4vw, 58px)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#152B17",
                margin: "0 0 16px 0",
              }}
            >
              Everything <br />
              <span style={{ color: "#1B3B22" }}>Your Bird</span> Needs
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(15px, 1.2vw, 17px)",
                lineHeight: 1.6,
                color: "#736B5E",
                margin: "0 0 28px 0",
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
                gap: 14,
                flexWrap: "wrap",
                marginBottom: "clamp(24px, 3.5vw, 36px)",
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
                  boxShadow: "0 6px 18px rgba(217, 56, 30, 0.28)",
                  transition: "background 0.2s, transform 0.2s",
                }}
              >
                <span>Shop Now</span>
                <ArrowRight size={17} strokeWidth={2.4} />
              </Link>

              <Link
                to="/birds"
                className="t-hover-lift t-btn-press"
                style={{
                  background: "#FFFFFF",
                  color: "#1B3B22",
                  border: "1.5px solid #E2DDD3",
                  padding: "13px 26px",
                  borderRadius: 999,
                  fontSize: 14.5,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>Browse Birds</span>
                <Feather size={15} strokeWidth={2.2} />
              </Link>
            </div>

            {/* 3 Horizontal Trust Indicators */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(14px, 2.5vw, 28px)",
                flexWrap: "wrap",
                paddingTop: 18,
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
              RIGHT COLUMN: Single High-Res Showcase Card
             ══════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            {/* Ambient Organic Light Aura Backdrop */}
            <div
              style={{
                position: "absolute",
                top: "10%",
                left: "10%",
                width: "80%",
                height: "80%",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(234, 242, 236, 0.7) 0%, rgba(253, 242, 233, 0.5) 50%, rgba(250, 248, 245, 0) 70%)",
                filter: "blur(28px)",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />

            {/* Showcase Image Card */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: 28,
                overflow: "hidden",
                border: "1.5px solid #E2DDD3",
                boxShadow:
                  "0 18px 44px -8px rgba(27, 59, 34, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)",
                background: "#FFFFFF",
                zIndex: 1,
              }}
            >
              <img
                src={heroBirdsCompanion}
                alt="Companion Sun Conure and Cockatiel perched warmly together at FeatherTown aviary"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 25%",
                  display: "block",
                  transition: "transform 0.4s ease",
                }}
              />
            </div>

            {/* Floating Forest Green Circular Badge ("Birds Make Life Brighter") */}
            <div
              style={{
                position: "absolute",
                top: -16,
                right: -14,
                background: "#1B3B22",
                color: "#FAF8F5",
                borderRadius: "50%",
                width: "clamp(88px, 11vw, 110px)",
                height: "clamp(88px, 11vw, 110px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 10,
                boxShadow: "0 10px 26px rgba(27, 59, 34, 0.30)",
                border: "3px solid #FAF8F5",
                zIndex: 10,
                transform: "rotate(6deg)",
                pointerEvents: "none",
              }}
            >
              <Heart size={18} fill="#FAF8F5" strokeWidth={0} style={{ marginBottom: 3 }} />
              <span
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: "clamp(10px, 0.95vw, 11.5px)",
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
