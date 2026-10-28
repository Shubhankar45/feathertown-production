/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Habitat Essentials (Dark Minimal)
   /components/sections/BirdEssentials.jsx
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

export default function BirdEssentials() {
  const { settings } = useSettings();
  const essentials = Array.isArray(settings?.habitatEssentials) ? settings.habitatEssentials : [];

  return (
    <section
      style={{
        padding: "clamp(36px, 5vw, 60px) clamp(16px, 4vw, 64px)",
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
          padding: "clamp(24px, 4vw, 36px) clamp(18px, 3.5vw, 32px)",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: "clamp(22px, 2.8vw, 30px)",
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.2,
              margin: "0 0 6px 0",
            }}
          >
            <span style={{ color: "#059669" }}>Habitat</span> Essentials
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
            Everything you need for an enriched, healthy, and playful companion bird home.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(clamp(110px, 24vw, 155px), 1fr))",
            gap: "clamp(10px, 2vw, 16px)",
          }}
        >
          {essentials.map((item) => (
            <Link
              key={item.id || item.label}
              to={item.link || "/accessories"}
              className="ft-card-lift"
              style={{
                textDecoration: "none",
                background: "#F8FAFC",
                borderRadius: 20,
                padding: "20px 14px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
                transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.2s, background 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#059669";
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(5, 150, 105, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.background = "#F8FAFC";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.03)";
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1)",
                }}
              >
                {item.icon}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0F172A",
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
