/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Featured Collections (Dark Minimal)
   /components/sections/FeaturedCollections.jsx
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

export default function FeaturedCollections() {
  const { settings } = useSettings();
  const collections = Array.isArray(settings?.featuredCollections) ? settings.featuredCollections : [];

  return (
    <section
      style={{
        padding: "clamp(48px, 6vw, 72px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FFFFFF",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.15,
              margin: "0 0 6px 0",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "#059669" }}>Featured</span> Collections
          </h2>
          <p style={{ fontSize: 14.5, color: "#64748B", margin: 0 }}>
            Curated essentials, spacious aviaries, and organic nutrition to keep your companion birds thriving.
          </p>
        </div>

        <Link
          to="/accessories"
          className="ft-btn-hover"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#059669",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 999,
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
          }}
        >
          View all collections ›
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
          gap: "clamp(14px, 2.5vw, 22px)",
        }}
      >
        {collections.map((col) => (
          <Link
            key={col.id || col.title}
            to={col.link || "/accessories"}
            className="ft-card-lift"
            style={{
              textDecoration: "none",
              borderRadius: 24,
              overflow: "hidden",
              position: "relative",
              height: 220,
              background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
              border: "1px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "24px 20px",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
              transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.25s, box-shadow 0.28s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#059669";
              e.currentTarget.style.boxShadow = "0 10px 28px rgba(5, 150, 105, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(15, 23, 42, 0.05)";
            }}
          >
            {/* Background Illustration / Emoji */}
            <div
              className="ft-animate-float-slow"
              style={{
                position: "absolute",
                top: 16,
                right: 20,
                fontSize: 64,
                opacity: 0.2,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {col.emoji}
            </div>

            {/* Icon Tag Overlay */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(10px)",
                padding: "5px 12px",
                borderRadius: 999,
                color: "#059669",
                fontSize: 12,
                fontWeight: 700,
                width: "fit-content",
                marginBottom: 10,
                border: "1px solid #A7F3D0",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.06)",
              }}
            >
              <span>{col.icon}</span>
              <span>Explore</span>
            </div>

            <h3
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: 4,
                lineHeight: 1.2,
              }}
            >
              {col.title}
            </h3>

            <p
              style={{
                fontSize: 13,
                color: "#64748B",
                fontWeight: 600,
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {col.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
