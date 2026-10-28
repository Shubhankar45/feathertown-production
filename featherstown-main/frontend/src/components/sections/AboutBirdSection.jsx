/* ═══════════════════════════════════════════════════════════════
   Feathers Town — About Us Section with Flying Hummingbird
   /components/sections/AboutBirdSection.jsx

   Exact match to Reference Section 2:
   - Deep matte dark background
   - Flying iridescent emerald hummingbird with wings spread
   - Minimal bold typography: "Know more types of Birds here"
   - Mint pill action button: "Learn More →"
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import hummingbirdImg from "../../assets/hummingbird-flight.jpg";

export default function AboutBirdSection() {
  return (
    <section
      id="about"
      style={{
        background: "#FFFFFF",
        padding: "clamp(48px, 6vw, 84px) clamp(16px, 4vw, 64px)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      {/* Background Soft Aura */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "5%",
          width: "clamp(300px, 40vw, 600px)",
          height: "clamp(300px, 40vw, 600px)",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Left Column: Stunning Flying Hummingbird Image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              borderRadius: 28,
              overflow: "hidden",
              border: "1px solid #E2E8F0",
              boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
              background: "#F8FAFC",
            }}
          >
            <img
              src={hummingbirdImg}
              alt="Emerald Hummingbird in flight"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: 460,
                objectFit: "cover",
                display: "block",
                transition: "transform 0.5s ease",
              }}
            />

            {/* Floating glass pill tag */}
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 18,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(12px)",
                border: "1px solid #E2E8F0",
                padding: "8px 16px",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
              }}
            >
              <span style={{ fontSize: 14 }}>🌿</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
                100% Ethical Socialization
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Text & Learn More CTA */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Eyebrow */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              color: "#EA580C",
              textTransform: "uppercase",
              marginBottom: 12,
              display: "inline-block",
            }}
          >
            ABOUT US
          </span>

          {/* Headline */}
          <h2
            style={{
              fontSize: "clamp(28px, 3.8vw, 46px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "#0F172A",
              margin: "0 0 16px 0",
            }}
          >
            Know more <br />
            types of <span style={{ color: "#16A34A" }}>Birds</span> <br />
            here
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.6,
              margin: "0 0 24px 0",
              maxWidth: 480,
            }}
          >
            Get to know all kinds of healthy hand-tamed companion birds with FeatherTown. We provide complete veterinarian documentation, DNA sex testing, certified organic starter nutrition, and dedicated lifetime WhatsApp mentorship for every pet parent.
          </p>

          {/* Learn More Pill Button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Link
              to="/about"
              style={{
                background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                color: "#FFFFFF",
                padding: "11px 26px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(22, 163, 74, 0.28)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(249, 115, 22, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(22, 163, 74, 0.28)";
              }}
            >
              <span>Learn More</span>
              <span style={{ fontSize: 15, color: "#FEF3C7" }}>→</span>
            </Link>

            <Link
              to="/birds"
              style={{
                background: "#FFFFFF",
                color: "#0F172A",
                border: "1px solid #CBD5E1",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#059669";
                e.currentTarget.style.color = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#CBD5E1";
                e.currentTarget.style.color = "#0F172A";
              }}
            >
              <span>View Aviary</span>
              <span>›</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
