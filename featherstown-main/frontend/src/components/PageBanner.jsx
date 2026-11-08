import { Link } from "react-router-dom";
import ShinyText from "./react-bits/ShinyText";

export default function PageBanner({ eyebrow, title, accent, desc }) {
  return (
    <section
      style={{
        background: "#F8FAFC",
        padding: "clamp(40px, 5vw, 56px) clamp(16px, 3.5vw, 48px) clamp(32px, 4vw, 44px)",
        textAlign: "center",
        borderBottom: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >

      <div style={{ maxWidth: 980, margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Breadcrumb Navigation */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "#64748B",
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          <Link to="/" style={{ color: "#16A34A", textDecoration: "none", fontWeight: 700 }}>
            Home
          </Link>
          <span style={{ opacity: 0.4, color: "#94A3B8" }}>/</span>
          <span style={{ color: "#0F172A", fontWeight: 700 }}>{eyebrow}</span>
        </div>

        {/* Eyebrow Tag with ShinyText */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #FED7AA",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              padding: "5px 16px",
              borderRadius: 999,
              boxShadow: "0 2px 8px rgba(249, 115, 22, 0.08)",
            }}
          >
            <span>✨</span>
            <ShinyText text={eyebrow} speed={3.5} />
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "Outfit, system-ui, sans-serif",
            fontSize: "clamp(30px, 4.5vw, 46px)",
            fontWeight: 900,
            color: "#0F172A",
            lineHeight: 1.15,
            marginBottom: desc ? 12 : 0,
            letterSpacing: "-0.025em",
          }}
        >
          {title} {accent && <span className="text-emerald-600">{accent}</span>}
        </h1>

        {/* Description */}
        {desc && (
          <p
            style={{
              fontSize: "clamp(14px, 1.6vw, 15.5px)",
              color: "#475569",
              lineHeight: 1.65,
              maxWidth: 600,
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
