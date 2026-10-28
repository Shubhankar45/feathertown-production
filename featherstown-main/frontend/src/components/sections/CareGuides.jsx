/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Care Guides & Tips (Dark Minimal)
   /components/sections/CareGuides.jsx
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { resolveBirdImage } from "../../context/BirdsContext";

export default function CareGuides() {
  const { settings } = useSettings();
  const guides = Array.isArray(settings?.careGuides) ? settings.careGuides : [];

  return (
    <section
      id="care-guides"
      style={{
        padding: "clamp(48px, 6vw, 80px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FFFFFF",
        borderTop: "1px solid #E2E8F0",
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
            <span style={{ color: "#059669" }}>Care Guides</span> &amp; Tips
          </h2>
          <p style={{ fontSize: 14.5, color: "#64748B", margin: 0 }}>
            Expert avian guidelines to give your companion the longest, happiest flight.
          </p>
        </div>

        <Link
          to="/about"
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
          View all guides ›
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
          gap: "clamp(14px, 2.5vw, 22px)",
        }}
      >
        {guides.map((g, idx) => (
          <div
            key={g.id || idx}
            className="ft-card-lift"
            style={{
              background: "#FFFFFF",
              borderRadius: 22,
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
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
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#059669",
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    padding: "4px 10px",
                    borderRadius: 999,
                  }}
                >
                  {g.readTime || "5 min read"}
                </span>
                <img
                  src={resolveBirdImage(g.image)}
                  alt={g.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                    border: "2px solid #E2E8F0",
                  }}
                />
              </div>

              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#0F172A",
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {g.title}
              </h3>

              <p
                style={{
                  fontSize: 13,
                  color: "#475569",
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {g.desc}
              </p>
            </div>

            <Link
              to="/about"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#059669",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              Read full article →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
