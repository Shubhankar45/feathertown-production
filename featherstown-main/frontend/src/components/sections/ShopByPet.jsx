/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Birdpedia Species Showcase
   /components/sections/ShopByPet.jsx

   Exact match to Reference Section 4 ("Birdpedia information"):
   - Deep matte dark background (#0B0F14)
   - Title: "Birdpedia Information"
   - Dark elevated cards with cutout bird portraits
   - Glowing emerald pill buttons: "Learn More"
   - Carousel navigation arrows (← →)
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { resolveBirdImage } from "../../context/BirdsContext";

export default function ShopByPet() {
  const { settings } = useSettings();
  const categories = Array.isArray(settings?.petCategories) ? settings.petCategories : [];

  return (
    <section
      id="species"
      style={{
        padding: "clamp(48px, 6vw, 84px) clamp(16px, 4vw, 64px)",
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
          marginBottom: "clamp(28px, 4vw, 44px)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(25px, 3.4vw, 38px)",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 8px 0",
          }}
        >
          <span style={{ color: "#16A34A" }}>Bird</span><span style={{ color: "#EA580C" }}>pedia</span> Information
        </h2>
        <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
          Find detailed information, talking abilities, and care needs for every companion bird species.
        </p>
      </div>

      {/* 6 Light Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(clamp(170px, 22vw, 220px), 1fr))",
          gap: "clamp(14px, 2vw, 22px)",
        }}
      >
        {categories.map((pet) => (
          <Link
            key={pet.id || pet.name}
            to={pet.link || "/birds"}
            className="ft-card-lift"
            style={{
              textDecoration: "none",
              background: "#FFFFFF",
              borderRadius: 22,
              padding: "24px 16px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
              border: "1px solid #E2E8F0",
              transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.25s, box-shadow 0.28s, background 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#059669";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(5, 150, 105, 0.12)";
              e.currentTarget.style.background = "#F8FAFC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(15, 23, 42, 0.05)";
              e.currentTarget.style.background = "#FFFFFF";
            }}
          >
            {/* Cutout Bird Portrait Circle */}
            <div
              style={{
                width: "clamp(88px, 14vw, 110px)",
                height: "clamp(88px, 14vw, 110px)",
                borderRadius: "50%",
                background: "#F1F5F9",
                padding: 4,
                marginBottom: 16,
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
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
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                  transition: "transform 0.35s ease",
                }}
              />
            </div>

            <span
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
              style={{
                background: "#ECFDF5",
                color: "#059669",
                border: "1px solid #A7F3D0",
                padding: "7px 20px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.3,
                boxShadow: "0 1px 4px rgba(5, 150, 105, 0.1)",
                transition: "all 0.2s",
              }}
            >
              Learn More
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination / Carousel arrows */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginTop: 36,
        }}
      >
        <Link
          to="/birds"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#0F172A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
          }}
          aria-label="Previous species"
        >
          ←
        </Link>
        <Link
          to="/birds"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#059669",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 2px 10px rgba(5, 150, 105, 0.25)",
          }}
          aria-label="Next species"
        >
          →
        </Link>
      </div>
    </section>
  );
}
