import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";
import { resolveBirdImage } from "../../context/BirdsContext";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function CareGuides() {
  const { settings } = useSettings();
  const guides = Array.isArray(settings?.careGuides) ? settings.careGuides : [];

  return (
    <section
      id="care-guides"
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
            <span>VETERINARIAN KNOWLEDGE</span>
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
            <span style={{ color: "#1B3B22" }}>Care Guides</span> &amp; Avian Health
          </h2>
          <p style={{ fontSize: 14, color: "#736B5E", margin: 0 }}>
            Expert guidelines to give your companion the healthiest, longest, and happiest flight.
          </p>
        </div>

        <Link
          to="/about"
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
          View all guides ›
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
        }}
      >
        {guides.map((g, idx) => (
          <SpotlightCard
            key={g.id || idx}
            spotlightColor="rgba(27, 59, 34, 0.08)"
            borderColor="#E2DDD3"
            className="t-hover-lift group flex flex-col justify-between p-6"
            style={{
              borderRadius: 24,
              boxShadow: "0 4px 18px rgba(21, 43, 23, 0.04)",
              background: "#FFFFFF",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#1B3B22",
                    background: "#E7EFE8",
                    border: "1px solid #B8D4BA",
                    padding: "4px 12px",
                    borderRadius: 999,
                  }}
                >
                  {g.readTime || "5 min read"}
                </span>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid #E2DDD3",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <img
                    src={resolveBirdImage(g.image)}
                    alt={g.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#152B17",
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}
              >
                {g.title}
              </h3>

              <p
                style={{
                  fontSize: 13,
                  color: "#736B5E",
                  lineHeight: 1.6,
                  marginBottom: 18,
                }}
              >
                {g.desc}
              </p>
            </div>

            <Link
              to="/about"
              className="t-btn-press"
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#1B3B22",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: "auto",
              }}
            >
              Read full article →
            </Link>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
