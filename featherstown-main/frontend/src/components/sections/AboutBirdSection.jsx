import { Link } from "react-router-dom";
import hummingbirdImg from "../../assets/hummingbird-flight.jpg";
import CountUp from "../react-bits/CountUp";
import Magnet from "../react-bits/Magnet";
import ShinyText from "../react-bits/ShinyText";

export default function AboutBirdSection() {
  return (
    <section
      id="about"
      style={{
        background: "#FFFFFF",
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
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
          background: "radial-gradient(circle, rgba(22, 163, 74, 0.08) 0%, transparent 70%)",
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
              }}
            />

            {/* Floating glass pill tag */}
            <div
              style={{
                position: "absolute",
                bottom: 18,
                left: 18,
                background: "rgba(255, 255, 255, 0.94)",
                backdropFilter: "blur(12px)",
                border: "1px solid #DCFCE7",
                padding: "8px 18px",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
              }}
            >
              <span style={{ fontSize: 14 }}>🌿</span>
              <ShinyText
                text="100% Ethical Avian Socialization"
                speed={4}
                style={{ fontSize: 12, fontWeight: 800 }}
              />
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
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#EA580C",
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
              color: "#0F172A",
              margin: "0 0 16px 0",
            }}
          >
            Know more <br />
            types of <span className="text-emerald-600">Birds</span> <br />
            with <span className="text-orange-500">FeatherTown</span>
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#475569",
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
              borderTop: "1px solid #F1F5F9",
              borderBottom: "1px solid #F1F5F9",
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#16A34A" }}>
                <CountUp to={1250} duration={2} suffix="+" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginTop: 2 }}>
                Happy Pet Families
              </div>
            </div>
            <div style={{ borderLeft: "1px solid #E2E8F0", paddingLeft: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#EA580C" }}>
                <CountUp to={100} duration={1.5} suffix="%" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginTop: 2 }}>
                DNA &amp; Vet Certified
              </div>
            </div>
            <div style={{ borderLeft: "1px solid #E2E8F0", paddingLeft: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A" }}>
                <CountUp to={15} duration={1.5} suffix="+" />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", marginTop: 2 }}>
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
                  background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                  color: "#FFFFFF",
                  padding: "12px 28px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 6px 18px rgba(22, 163, 74, 0.35)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
              >
                <span>Learn More</span>
                <span style={{ fontSize: 15 }}>→</span>
              </Link>
            </Magnet>
          </div>
        </div>
      </div>
    </section>
  );
}
