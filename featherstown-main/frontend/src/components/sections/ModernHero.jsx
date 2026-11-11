/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Editorial Avian Hero Section
   /components/sections/ModernHero.jsx

   Directly modeled on the reference design & optimized for all screens:
   - Transparent PNG premium parrot with majestic wingspan and soft drop shadow
   - Soft organic ambient halo (no dark boxes or harsh clipping)
   - Interactive toggle: Transparent Flying Conure | Perched Close-Up
   - Floating Forest Green circular badge ("Birds Make Life Brighter ❤️")
   - Floating trust pill badges: "100% Hand-Tamed" & "DNA Certified"
   - Strict 60-30-10 palette (Oat Milk 60%, Forest Green 30%, Tomato Red 10%)
   - 100% Lucide React line icons (zero emojis)
   - Flawlessly responsive across mobile, tablet, laptop, and ultra-wide
═══════════════════════════════════════════════════════════════ */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Wheat,
  Heart,
  ShieldCheck,
  Sparkles,
  Feather,
  CheckCircle2,
} from "lucide-react";
import heroCutout from "../../assets/hero.png";
import heroParrot from "../../assets/hero-parrot.jpg";

export default function ModernHero() {
  const [viewMode, setViewMode] = useState("cutout"); // 'cutout' or 'portrait'

  return (
    <section
      style={{
        position: "relative",
        background: "#FAF8F5",
        color: "#152B17",
        width: "100%",
        paddingTop: "clamp(28px, 5vw, 60px)",
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
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
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
              RIGHT COLUMN: Transparent Premium Parrot Stage
             ══════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 540,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Ambient Organic Light Aura Backdrop */}
            <div
              style={{
                position: "absolute",
                width: "clamp(280px, 80%, 460px)",
                height: "clamp(280px, 80%, 460px)",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(234, 242, 236, 0.95) 0%, rgba(253, 242, 233, 0.7) 48%, rgba(250, 248, 245, 0) 72%)",
                filter: "blur(24px)",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />

            {/* Central Parrot Stage */}
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: "clamp(300px, 45vw, 420px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              {viewMode === "cutout" ? (
                /* Transparent PNG Soaring Parrot */
                <img
                  src={heroCutout}
                  alt="Majestic colorful companion parrot soaring with transparent background in FeatherTown aviary"
                  style={{
                    width: "clamp(260px, 75vw, 480px)",
                    height: "auto",
                    maxHeight: 420,
                    objectFit: "contain",
                    display: "block",
                    filter:
                      "drop-shadow(0 24px 34px rgba(27, 59, 34, 0.16)) drop-shadow(0 4px 12px rgba(0,0,0,0.06))",
                    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  className="ft-animate-float"
                />
              ) : (
                /* High-Res Close-Up Portrait */
                <div
                  style={{
                    width: "clamp(260px, 75vw, 420px)",
                    aspectRatio: "1 / 1",
                    borderRadius: 28,
                    overflow: "hidden",
                    border: "2px solid #E2DDD3",
                    boxShadow: "0 16px 40px rgba(27, 59, 34, 0.12)",
                    background: "#FAF8F5",
                  }}
                >
                  <img
                    src={heroParrot}
                    alt="Close up portrait of healthy sun conure parrot"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Floating Top-Right Circular Badge ("Birds Make Life Brighter ❤️") */}
              <div
                style={{
                  position: "absolute",
                  top: "clamp(-10px, -2vw, 0px)",
                  right: "clamp(-8px, 0vw, 12px)",
                  background: "#1B3B22",
                  color: "#FAF8F5",
                  borderRadius: "50%",
                  width: "clamp(90px, 12vw, 114px)",
                  height: "clamp(90px, 12vw, 114px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 10,
                  boxShadow: "0 10px 24px rgba(27, 59, 34, 0.28)",
                  border: "2.5px solid #FAF8F5",
                  zIndex: 10,
                  transform: "rotate(6deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <Heart size={18} fill="#FAF8F5" strokeWidth={0} style={{ marginBottom: 3 }} />
                <span
                  style={{
                    fontFamily: "Outfit, system-ui, sans-serif",
                    fontSize: "clamp(10px, 1vw, 11.5px)",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    letterSpacing: "0.2px",
                  }}
                >
                  Birds Make <br /> Life Brighter
                </span>
              </div>

              {/* Floating Bottom-Left Pill Badge ("100% Hand-Tamed") */}
              <div
                style={{
                  position: "absolute",
                  bottom: "clamp(4px, 1vw, 16px)",
                  left: "clamp(-4px, 1vw, 16px)",
                  background: "rgba(255, 255, 255, 0.94)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1.5px solid #CCE0D0",
                  borderRadius: 999,
                  padding: "7px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                  zIndex: 10,
                }}
              >
                <CheckCircle2 size={15} color="#1B3B22" strokeWidth={2.4} />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1B3B22" }}>
                  100% Hand-Tamed
                </span>
              </div>
            </div>

            {/* Seamless View Selector Pills */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#FFFFFF",
                border: "1px solid #E2DDD3",
                borderRadius: 999,
                padding: 3,
                marginTop: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                zIndex: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("cutout")}
                style={{
                  background: viewMode === "cutout" ? "#1B3B22" : "transparent",
                  color: viewMode === "cutout" ? "#FFFFFF" : "#736B5E",
                  border: "none",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Majestic Flight (PNG)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("portrait")}
                style={{
                  background: viewMode === "portrait" ? "#1B3B22" : "transparent",
                  color: viewMode === "portrait" ? "#FFFFFF" : "#736B5E",
                  border: "none",
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Avian Portrait
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
