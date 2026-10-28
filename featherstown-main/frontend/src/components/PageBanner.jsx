import { Link } from "react-router-dom";

export default function PageBanner({ eyebrow, title, accent, desc }) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, #F0FDF4 0%, #F8FAFC 100%)",
        padding: "48px clamp(16px, 3.5vw, 48px) 38px",
        textAlign: "center",
        borderBottom: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
        position: "relative",
      }}
    >
      <div className="rv" style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "#64748B",
            marginBottom: 14,
            fontWeight: 500,
          }}
        >
          <Link to="/" style={{ color: "#059669", textDecoration: "none", fontWeight: 600 }}>
            Home
          </Link>
          <span style={{ opacity: 0.5, color: "#94A3B8" }}>/</span>
          <span style={{ color: "#0F172A", fontWeight: 700 }}>{eyebrow}</span>
        </div>

        {/* Eyebrow Tag */}
        <div>
          <span
            style={{
              display: "inline-block",
              background: "#ECFDF5",
              color: "#059669",
              border: "1px solid #A7F3D0",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              padding: "4px 14px",
              borderRadius: 99,
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "Outfit, system-ui, sans-serif",
            fontSize: "clamp(28px, 4.5vw, 44px)",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.15,
            marginBottom: desc ? 12 : 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title} {accent && <span style={{ color: "#059669" }}>{accent}</span>}
        </h1>

        {/* Description */}
        {desc && (
          <p
            style={{
              fontSize: "clamp(14px, 1.6vw, 16px)",
              color: "#475569",
              lineHeight: 1.65,
              maxWidth: 580,
              margin: "0 auto",
            }}
          >
            {desc}
          </p>
        )}
      </div>
    </section>
  );
}
