/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Dual Promotional Split Banners
   /components/sections/PromoBanners.jsx

   Directly modeled on the reference design:
   - Banner 1 (Left): Warm Peach/Oat (#FCEFEA), "Play More, Sing More",
     Tomato Red pill button "Shop Toys →", toy/play imagery.
   - Banner 2 (Right): Soft Mint/Sage (#EAF2EC), "Healthy Birds, Happier Tomorrows",
     Forest Green pill button "Shop Wellness →", nutrition/wellness imagery.
   - 100% responsive, equal height, rounded 24px cards.
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import pineCrop from "../../assets/birds/crop-pineapple-conure.jpg";
import cockatielCrop from "../../assets/birds/crop-cockatiel.jpg";

export default function PromoBanners() {
  return (
    <section
      style={{
        padding: "clamp(24px, 4vw, 44px) clamp(16px, 4.5vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "clamp(20px, 3vw, 28px)",
        }}
      >
        {/* Banner 1: Play & Foraging (Warm Peach/Oat) */}
        <div
          className="t-hover-lift"
          style={{
            background: "#FCEFEA",
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
              Play More, <br />
              <span style={{ color: "#152B17" }}>Sing More</span>
            </h3>
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "#736B5E",
                margin: "0 0 22px 0",
              }}
            >
              Explore our interactive puzzle &amp; foraging toy collection for endless fun!
            </p>
            <Link
              to="/accessories?category=toys"
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
              <span>Shop Toys</span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>

          {/* Right Image Cutout */}
          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 0,
              width: "clamp(130px, 16vw, 180px)",
              height: "clamp(140px, 18vw, 200px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <img
              src={pineCrop}
              alt="Playful companion conure with foraging toys"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.12))",
              }}
            />
          </div>
        </div>

        {/* Banner 2: Wellness & Nutrition (Soft Mint/Sage) */}
        <div
          className="t-hover-lift"
          style={{
            background: "#EAF2EC",
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
              Healthy Birds, <br />
              <span style={{ color: "#152B17" }}>Happier Tomorrows</span>
            </h3>
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.5,
                color: "#736B5E",
                margin: "0 0 22px 0",
              }}
            >
              Save up to 30% on select organic diet blends and avian wellness products.
            </p>
            <Link
              to="/accessories?category=food"
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
              <span>Shop Wellness</span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>

          {/* Right Image Cutout */}
          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 0,
              width: "clamp(130px, 16vw, 180px)",
              height: "clamp(140px, 18vw, 200px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <img
              src={cockatielCrop}
              alt="Healthy gentle companion cockatiel"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.12))",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
