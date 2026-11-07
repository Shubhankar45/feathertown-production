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
        background: "#FFFFFF",
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
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#059669",
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
              color: "#0F172A",
              lineHeight: 1.15,
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            <span className="text-emerald-600">Featured</span> Collections
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
            Curated essentials, spacious aviaries, and organic nutrition to keep your companion birds thriving.
          </p>
        </div>

        <Link
          to="/accessories"
          className="t-btn-press"
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#16A34A",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
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
              spotlightColor="rgba(22, 163, 74, 0.15)"
              borderColor="#E2E8F0"
              className="t-hover-lift group flex flex-col justify-end p-6"
              style={{
                borderRadius: 24,
                height: 230,
                background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
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
                  opacity: 0.18,
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
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  padding: "5px 14px",
                  borderRadius: 999,
                  color: "#16A34A",
                  fontSize: 12,
                  fontWeight: 800,
                  width: "fit-content",
                  marginBottom: 12,
                  border: "1px solid #DCFCE7",
                  boxShadow: "0 2px 8px rgba(22, 163, 74, 0.1)",
                }}
              >
                <span>{col.icon}</span>
                <span>Explore</span>
              </div>

              <h3
                className="group-hover:text-emerald-700 transition-colors"
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
