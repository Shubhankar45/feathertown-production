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
    <div style={{ background: "#F7F5F0", color: "#152B17", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
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
            border: "1px solid #E2DDD3",
            boxShadow: "0 2px 10px rgba(21, 43, 23, 0.04)",
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
                color: "#1B3B22",
                textTransform: "uppercase",
                background: "#E7EFE8",
                border: "1px solid #B8D4BA",
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
                color: "#152B17",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              {title}
            </h2>

            <p style={{ fontSize: 15, color: "#736B5E", lineHeight: 1.75, marginBottom: 14 }}>
              {story}
            </p>

            <p style={{ fontSize: 15, color: "#736B5E", lineHeight: 1.75, marginBottom: 20 }}>
              {mission}
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/birds"
                className="ft-btn-hover"
                style={{
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  padding: "12px 26px",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(27, 59, 34, 0.25)",
                }}
              >
                Browse Companion Birds →
              </Link>
              <Link
                to="/contact"
                className="ft-btn-hover"
                style={{
                  background: "#FAF8F5",
                  color: "#152B17",
                  border: "1.5px solid #E2DDD3",
                  padding: "11px 24px",
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Get in Touch
              </Link>
            </div>
          </div>

          <div className="rv-right" style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={heroImg}
              alt="FeatherTown aviary sanctuary companion bird"
              style={{
                width: "100%",
                maxWidth: 420,
                borderRadius: 22,
                objectFit: "cover",
                boxShadow: "0 10px 30px rgba(21, 43, 23, 0.08)",
              }}
            />
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h3 style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, color: "#152B17" }}>
              The Four FeatherTown Commitments
            </h3>
            <p style={{ fontSize: 14, color: "#736B5E", marginTop: 4 }}>
              How we protect bird welfare, owner education, and transparent pet parenting across India.
            </p>
          </div>

          <div
            className="rv-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: 20,
            }}
          >
            <div style={pillarCard}>
              <div style={pillarIcon}>🩺</div>
              <div style={pillarTitle}>1. Certified Avian Health</div>
              <div style={pillarText}>
                Every bird is examined by certified avian specialists, free from psittacine beak and feather disease (PBFD), parasites, and respiratory issues before adoption.
              </div>
            </div>

            <div style={pillarCard}>
              <div style={pillarIcon}>🧬</div>
              <div style={pillarTitle}>2. DNA Sex Certification</div>
              <div style={pillarText}>
                Monomorphic parrots receive lab-verified DNA feather/blood testing so you know your companion's biological gender with 99.9% certainty.
              </div>
            </div>

            <div style={pillarCard}>
              <div style={pillarIcon}>🤝</div>
              <div style={pillarTitle}>3. Hand-Fed Socialization</div>
              <div style={pillarText}>
                We do not sell wild-caught birds. Every hatchling is spoon or syringe raised with warm hand-feeding formula and gentle human touch from day 14 onwards.
              </div>
            </div>

            <div style={pillarCard}>
              <div style={pillarIcon}>💬</div>
              <div style={pillarTitle}>4. Lifetime Mentor WhatsApp</div>
              <div style={pillarText}>
                Adopting is just day one. Our avian care line stays open for weaning, cage setup questions, behavioral guidance, and diet adjustments for the bird's entire lifespan.
              </div>
            </div>
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
  border: "1px solid #E2DDD3",
  boxShadow: "0 2px 10px rgba(21, 43, 23, 0.04)",
};

const pillarIcon = {
  width: 50,
  height: 50,
  borderRadius: 14,
  background: "#E7EFE8",
  border: "1px solid #B8D4BA",
  color: "#1B3B22",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  marginBottom: 14,
};

const pillarTitle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#152B17",
  marginBottom: 6,
};

const pillarText = {
  fontSize: 13,
  color: "#736B5E",
  lineHeight: 1.6,
};
