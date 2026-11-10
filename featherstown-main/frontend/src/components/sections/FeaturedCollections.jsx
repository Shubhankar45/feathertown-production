import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function FeaturedCollections() {
  const { settings } = useSettings();
  const collections = Array.isArray(settings?.featuredCollections) ? settings.featuredCollections : [];

  return (
    <section
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 36,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
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
              marginBottom: 10,
            }}
          >
            <span>CURATED ESSENTIALS</span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.6vw, 40px)",
              fontWeight: 900,
              color: "#152B17",
              lineHeight: 1.15,
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#1B3B22" }}>Featured</span> Collections
          </h2>
          <p style={{ fontSize: 14, color: "#736B5E", margin: 0 }}>
            Curated essentials, spacious aviaries, and organic nutrition to keep your companion birds thriving.
          </p>
        </div>

        <Link
          to="/accessories"
          className="t-btn-press"
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#1B3B22",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
            borderRadius: 999,
            background: "#E7EFE8",
            border: "1px solid #B8D4BA",
          }}
        >
          View all collections ›
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
        }}
      >
        {collections.map((col) => (
          <Link
            key={col.id || col.title}
            to={col.link || "/accessories"}
            style={{ textDecoration: "none" }}
          >
            <SpotlightCard
              spotlightColor="rgba(27, 59, 34, 0.08)"
              borderColor="#E2DDD3"
              className="t-hover-lift group flex flex-col justify-end p-6"
              style={{
                borderRadius: 24,
                height: 230,
                background: "#FFFFFF",
                boxShadow: "0 4px 18px rgba(21, 43, 23, 0.04)",
              }}
            >
              {/* Background Illustration / Emoji */}
              <div
                className="ft-animate-float-slow"
                style={{
                  position: "absolute",
                  top: 18,
                  right: 20,
                  fontSize: 68,
                  opacity: 0.16,
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
                  background: "#FAF8F5",
                  padding: "5px 14px",
                  borderRadius: 999,
                  color: "#1B3B22",
                  fontSize: 12,
                  fontWeight: 800,
                  width: "fit-content",
                  marginBottom: 12,
                  border: "1px solid #E2DDD3",
                }}
              >
                <span>{col.icon}</span>
                <span>Explore</span>
              </div>

              <h3
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  color: "#152B17",
                  marginBottom: 4,
                  lineHeight: 1.2,
                }}
              >
                {col.title}
              </h3>

              <p
                style={{
                  fontSize: 13,
                  color: "#736B5E",
                  fontWeight: 500,
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {col.subtitle}
              </p>
            </SpotlightCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
