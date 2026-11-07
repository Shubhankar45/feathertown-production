import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function BirdEssentials() {
  const { settings } = useSettings();
  const essentials = Array.isArray(settings?.habitatEssentials) ? settings.habitatEssentials : [];

  return (
    <section
      style={{
        padding: "clamp(40px, 5vw, 64px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "clamp(26px, 4vw, 40px) clamp(20px, 4vw, 36px)",
          border: "1px solid #E2E8F0",
          boxShadow: "0 6px 24px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ marginBottom: 28 }}>
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
              marginBottom: 10,
            }}
          >
            <span>HABITAT CARE</span>
          </div>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 900,
              color: "#0F172A",
              lineHeight: 1.2,
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            <span className="text-emerald-600">Habitat</span> Essentials
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
            Everything you need for an enriched, healthy, and playful companion bird home.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(clamp(120px, 24vw, 160px), 1fr))",
            gap: "clamp(12px, 2vw, 18px)",
          }}
        >
          {essentials.map((item) => (
            <Link
              key={item.id || item.label}
              to={item.link || "/accessories"}
              style={{ textDecoration: "none" }}
            >
              <SpotlightCard
                spotlightColor="rgba(249, 115, 22, 0.12)"
                borderColor="#E2E8F0"
                className="t-hover-lift group flex flex-col items-center text-center p-4"
                style={{
                  borderRadius: 20,
                  background: "#FAFAFA",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ECFDF5 0%, #DCFCE7 100%)",
                    border: "1px solid #A7F3D0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    marginBottom: 10,
                    boxShadow: "0 2px 6px rgba(22, 163, 74, 0.1)",
                  }}
                  className="transition-transform duration-300 group-hover:scale-110"
                >
                  {item.icon}
                </div>
                <span
                  className="group-hover:text-emerald-700 transition-colors"
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#0F172A",
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </span>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
