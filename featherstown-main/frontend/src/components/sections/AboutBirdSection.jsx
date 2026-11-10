import { Link } from "react-router-dom";
import hummingbirdImg from "../../assets/hummingbird-flight.jpg";
import CountUp from "../react-bits/CountUp";
import Magnet from "../react-bits/Magnet";

export default function AboutBirdSection() {
  return (
    <section
      id="about"
      style={{
        background: "#FAF8F5",
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid #E2DDD3",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: "clamp(36px, 6vw, 72px)",
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
            className="t-hover-lift t-img-zoom"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              borderRadius: 28,
              overflow: "hidden",
              border: "1px solid #E2DDD3",
              boxShadow: "0 20px 48px rgba(21, 43, 23, 0.08)",
              background: "#FFFFFF",
            }}
          >
            <img
              src={hummingbirdImg}
              alt="Hummingbird in flight demonstrating ethical avian agility and vitality"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: 460,
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Floating glass pill tag */}
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 18,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                border: "1px solid #B8D4BA",
                padding: "8px 18px",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(21, 43, 23, 0.08)",
              }}
            >
              <span style={{ fontSize: 14 }}>🌿</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1B3B22" }}>
                100% Ethical Avian Socialization
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Text & Learn More CTA */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#E7EFE8",
              border: "1px solid #B8D4BA",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#1B3B22",
              textTransform: "uppercase",
              marginBottom: 14,
              width: "fit-content",
            }}
          >
            <span>ABOUT US</span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: "#152B17",
              margin: "0 0 16px 0",
            }}
          >
            Know more <br />
            types of <span style={{ color: "#1B3B22" }}>Birds</span> <br />
            with <span style={{ color: "#1B3B22" }}>Feather</span><span style={{ color: "#D9381E" }}>Town</span>
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#736B5E",
              lineHeight: 1.65,
              margin: "0 0 24px 0",
              maxWidth: 500,
            }}
          >
            Get to know all kinds of healthy hand-tamed companion birds with FeatherTown. We provide complete veterinarian documentation, DNA sex testing certificates, organic starter nutrition, and dedicated lifetime WhatsApp mentorship for every pet family.
          </p>

          {/* Trust Stat Counters */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              marginBottom: 28,
              padding: "16px 0",
              borderTop: "1px solid #E2DDD3",
              borderBottom: "1px solid #E2DDD3",
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1B3B22" }}>
                <CountUp to={1250} duration={2} suffix="+" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#736B5E", marginTop: 2 }}>
                Happy Pet Families
              </div>
            </div>
            <div style={{ borderLeft: "1px solid #E2DDD3", paddingLeft: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#D9381E" }}>
                <CountUp to={100} duration={1.5} suffix="%" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#736B5E", marginTop: 2 }}>
                DNA &amp; Vet Certified
              </div>
            </div>
            <div style={{ borderLeft: "1px solid #E2DDD3", paddingLeft: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#152B17" }}>
                <CountUp to={15} duration={1.5} suffix="+" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#736B5E", marginTop: 2 }}>
                Exotic Breeds
              </div>
            </div>
          </div>

          {/* Learn More Pill Button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Magnet padding={40} magnetStrength={3}>
              <Link
                to="/about"
                className="t-btn-press"
                style={{
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  padding: "12px 28px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(27, 59, 34, 0.25)",
                }}
              >
                Learn More About Us ›
              </Link>
            </Magnet>
          </div>
        </div>
      </div>
    </section>
  );
}
