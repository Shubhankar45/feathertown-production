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
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "clamp(26px, 4vw, 40px) clamp(20px, 4vw, 36px)",
          border: "1px solid #E2DDD3",
          boxShadow: "0 6px 24px rgba(21, 43, 23, 0.04)",
        }}
      >
        <div style={{ marginBottom: 28 }}>
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
            <span>HABITAT CARE</span>
          </div>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 900,
              color: "#152B17",
              lineHeight: 1.2,
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#1B3B22" }}>Habitat</span> Essentials
          </h2>
          <p style={{ fontSize: 14, color: "#736B5E", margin: 0 }}>
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
                spotlightColor="rgba(27, 59, 34, 0.08)"
                borderColor="#E2DDD3"
                className="t-hover-lift group flex flex-col items-center text-center p-4"
                style={{
                  borderRadius: 20,
                  background: "#FAF8F5",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "#E7EFE8",
                    border: "1px solid #B8D4BA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    marginBottom: 10,
                  }}
                  className="transition-transform duration-300 group-hover:scale-110"
                >
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#152B17",
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
