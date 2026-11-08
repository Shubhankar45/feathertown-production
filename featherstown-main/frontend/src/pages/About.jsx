import { Link } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useSettings } from "../context/SettingsContext";
import heroImg from "../assets/hero.png";
import sunImg from "../assets/Sun-conure.jfif";
import cockatielImg from "../assets/cocketail.jpg";

export default function About() {
  const { settings } = useSettings();

  const tagline = settings?.aboutTagline || "Small Pets, Big Love";
  const title = settings?.aboutTitle || "Redefining Companion Bird Care Across India";
  const story =
    settings?.aboutStory ||
    "FeatherTown was founded in Sundargarh, Odisha, out of a profound passion for intelligent, emotionally rich companion birds. Too often, birds are misunderstood, fed inappropriate seed diets, or housed in undersized cages.";
  const mission =
    settings?.aboutMission ||
    "We set out to create a sanctuary where every conure, cockatiel, and macaw receives proper hand-feeding, human bonding, natural flight exercise, and certified avian veterinary checks before joining a family.";

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="About FeatherTown | Ethical Avian Breeding & Lifetime Care in India"
        description="Learn about FeatherTown's mission: ethical hand-tamed companion birds, certified veterinarian inspections, lifetime nutrition advice, and safe habitats across India."
      />

      <PageBanner
        eyebrow="Our Story &amp; Values"
        title="About"
        accent="FeatherTown"
        desc="We go beyond selling birds. Every parrot is raised with family love, socialized with patience, and supported with lifetime care."
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        {/* Story Section */}
        <div
          className="rv"
          style={{
            background: "#FFFFFF",
            borderRadius: 28,
            padding: "clamp(24px, 4vw, 48px) clamp(16px, 4vw, 36px)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            marginBottom: 40,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "clamp(24px, 4vw, 40px)",
            alignItems: "center",
          }}
        >
          <div className="rv-left">
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: 1.2,
                color: "#059669",
                textTransform: "uppercase",
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                padding: "4px 12px",
                borderRadius: 99,
                display: "inline-block",
                marginBottom: 14,
              }}
            >
              {tagline}
            </span>

            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 36px)",
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              {title}
            </h2>

            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, marginBottom: 14 }}>
              {story}
            </p>

            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.75, marginBottom: 20 }}>
              {mission}
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/birds"
                className="ft-btn-hover"
                style={{
                  background: "#16A34A",
                  color: "#FFFFFF",
                  padding: "12px 26px",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                }}
              >
                Browse Companion Birds →
              </Link>
              <Link
                to="/contact"
                className="ft-btn-hover"
                style={{
                  background: "#F8FAFC",
                  color: "#0F172A",
                  border: "1.5px solid #CBD5E1",
                  padding: "11px 22px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Contact Avian Team
              </Link>
            </div>
          </div>

          <div style={{ position: "relative", textAlign: "center" }} className="rv-right">
            <div
              className="ft-animate-float-slow"
              style={{
                borderRadius: 24,
                overflow: "hidden",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                padding: "24px 20px",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              }}
            >
              <img
                src={heroImg || sunImg}
                alt="FeatherTown Aviary"
                style={{
                  maxWidth: "90%",
                  maxHeight: 340,
                  objectFit: "contain",
                  filter: "drop-shadow(0 12px 20px rgba(15,23,42,0.1))",
                  transition: "transform 0.4s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* 4 Pillars of Excellence (Matches Reference Aesthetics) */}
        <div className="rv" style={{ marginBottom: 24, textAlign: "center" }}>
          <h3 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A" }}>Our Four Guiding Commitments</h3>
          <p style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>Why thousands of bird parents trust FeatherTown</p>
        </div>

        <div
          className="rv-stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "clamp(14px, 2.5vw, 20px)",
            marginBottom: 48,
          }}
        >
          <div className="ft-card-lift" style={pillarCard}>
            <div style={pillarIcon}>🩺</div>
            <h4 style={pillarTitle}>Avian Vet Certification</h4>
            <p style={pillarText}>
              Every bird undergoes health screenings, beak &amp; feather virus checks, and nutritional evaluation before rehoming.
            </p>
          </div>

          <div className="ft-card-lift" style={pillarCard}>
            <div style={pillarIcon}>🤝</div>
            <h4 style={pillarTitle}>Hand-Tamed Bonding</h4>
            <p style={pillarText}>
              Raised alongside human family members with gentle socialization, step-up training, and recall exercises.
            </p>
          </div>

          <div className="ft-card-lift" style={pillarCard}>
            <div style={pillarIcon}>🌾</div>
            <h4 style={pillarTitle}>100% Non-Toxic &amp; Organic</h4>
            <p style={pillarText}>
              All cages, perches, toys, and seed mixes are free from zinc, lead, artificial dyes, and dangerous chemicals.
            </p>
          </div>

          <div className="ft-card-lift" style={pillarCard}>
            <div style={pillarIcon}>💚</div>
            <h4 style={pillarTitle}>Lifetime Avian Mentorship</h4>
            <p style={pillarText}>
              Our WhatsApp support remains open for life. Diet questions, behavior troubleshooting, or vet advice — we are always here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const pillarCard = {
  background: "#FFFFFF",
  borderRadius: 22,
  padding: "26px 22px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
};

const pillarIcon = {
  width: 50,
  height: 50,
  borderRadius: 14,
  background: "#ECFDF5",
  border: "1px solid #A7F3D0",
  color: "#059669",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  marginBottom: 14,
};

const pillarTitle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#0F172A",
  marginBottom: 6,
};

const pillarText = {
  fontSize: 13,
  color: "#64748B",
  lineHeight: 1.6,
};
