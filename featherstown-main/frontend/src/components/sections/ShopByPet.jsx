import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { resolveBirdImage } from "../../context/BirdsContext";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function ShopByPet() {
  const { settings } = useSettings();
  const categories = Array.isArray(settings?.petCategories) ? settings.petCategories : [];

  return (
    <section
      id="species"
      style={{
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FFFFFF",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      {/* Header matching Reference: "Birdpedia information" */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "clamp(32px, 5vw, 48px)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.2,
            color: "#059669",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          <span>SPECIES ENCYCLOPEDIA</span>
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 3.6vw, 40px)",
            fontWeight: 900,
            color: "#0F172A",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            margin: "0 0 10px 0",
          }}
        >
          <span className="text-emerald-600">Bird</span><span className="text-orange-500">pedia</span> Species Directory
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          Find detailed traits, talking ability ratings, and personalized care needs for every companion bird breed.
        </p>
      </div>

      {/* 6 Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(clamp(170px, 22vw, 220px), 1fr))",
          gap: "clamp(16px, 2vw, 24px)",
        }}
      >
        {categories.map((pet) => (
          <Link
            key={pet.id || pet.name}
            to={pet.link || "/birds"}
            style={{ textDecoration: "none" }}
          >
            <SpotlightCard
              spotlightColor="rgba(22, 163, 74, 0.15)"
              borderColor="#E2E8F0"
              className="t-hover-lift group flex flex-col items-center text-center p-6"
              style={{
                borderRadius: 24,
                boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* Cutout Bird Portrait Circle */}
              <div
                style={{
                  width: "clamp(92px, 14vw, 116px)",
                  height: "clamp(92px, 14vw, 116px)",
                  borderRadius: "50%",
                  background: "#F8FAFC",
                  padding: 4,
                  marginBottom: 16,
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid #E2E8F0",
                }}
              >
                <img
                  src={resolveBirdImage(pet.image)}
                  alt={pet.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>

              <span
                className="group-hover:text-emerald-700 transition-colors"
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#0F172A",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {pet.name}
              </span>

              <span
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  fontWeight: 500,
                  marginBottom: 16,
                }}
              >
                {pet.tagline || "Companion Species"}
              </span>

              {/* Mint Pill Button */}
              <div
                className="t-btn-press"
                style={{
                  background: "#ECFDF5",
                  color: "#059669",
                  border: "1px solid #A7F3D0",
                  padding: "7px 20px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.3,
                  boxShadow: "0 2px 6px rgba(5, 150, 105, 0.1)",
                }}
              >
                Learn More →
              </div>
            </SpotlightCard>
          </Link>
        ))}
      </div>

      {/* Explore All Link */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 40,
        }}
      >
        <Link
          to="/birds"
          className="t-btn-press"
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            color: "#FFFFFF",
            padding: "11px 28px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(234, 88, 12, 0.35)",
          }}
        >
          <span>View All Available Birds</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
