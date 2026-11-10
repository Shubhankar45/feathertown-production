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
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
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
            background: "#E7EFE8",
            border: "1px solid #B8D4BA",
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.2,
            color: "#1B3B22",
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
            color: "#152B17",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            margin: "0 0 10px 0",
          }}
        >
          <span style={{ color: "#1B3B22" }}>Bird</span><span style={{ color: "#D9381E" }}>pedia</span> Species Directory
        </h2>
        <p style={{ fontSize: 14, color: "#736B5E", margin: 0, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
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
              spotlightColor="rgba(27, 59, 34, 0.08)"
              borderColor="#E2DDD3"
              className="t-hover-lift group flex flex-col items-center text-center p-6"
              style={{
                borderRadius: 24,
                boxShadow: "0 4px 18px rgba(21, 43, 23, 0.04)",
                background: "#FFFFFF",
              }}
            >
              {/* Cutout Bird Portrait Circle */}
              <div
                style={{
                  width: "clamp(92px, 14vw, 116px)",
                  height: "clamp(92px, 14vw, 116px)",
                  borderRadius: "50%",
                  background: "#FAF8F5",
                  padding: 4,
                  marginBottom: 16,
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid #E2DDD3",
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
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#152B17",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {pet.name}
              </span>

              <span
                style={{
                  fontSize: 12,
                  color: "#736B5E",
                  fontWeight: 500,
                  marginBottom: 16,
                }}
              >
                {pet.tagline || "Companion Species"}
              </span>

              {/* Pill Button */}
              <div
                className="t-btn-press"
                style={{
                  background: "#E7EFE8",
                  color: "#1B3B22",
                  border: "1px solid #B8D4BA",
                  padding: "7px 20px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 0.3,
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
            background: "#D9381E",
            color: "#FFFFFF",
            padding: "11px 28px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 16px rgba(217, 56, 30, 0.3)",
          }}
        >
          <span>View All Available Birds</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
