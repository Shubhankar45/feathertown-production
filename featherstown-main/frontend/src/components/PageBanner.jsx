import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function PageBanner({ eyebrow, title, accent, desc }) {
  return (
    <section
      style={{
        background: "#FAF8F5",
        padding: "clamp(36px, 4.5vw, 52px) clamp(16px, 3.5vw, 48px) clamp(28px, 3.5vw, 40px)",
        textAlign: "center",
        borderBottom: "1px solid #E2DDD3",
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
            color: "#736B5E",
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          <Link to="/" style={{ color: "#1B3B22", textDecoration: "none", fontWeight: 700 }}>
            Home
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: "#152B17", fontWeight: 700 }}>{eyebrow}</span>
        </div>

        {/* Eyebrow Tag */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#E7EFE8",
              border: "1px solid #B8D4BA",
              color: "#1B3B22",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              padding: "4px 14px",
              borderRadius: 999,
            }}
          >
            <Sparkles size={12} strokeWidth={2.2} />
            <span>{eyebrow}</span>
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "Outfit, system-ui, sans-serif",
            fontSize: "clamp(28px, 4.2vw, 44px)",
            fontWeight: 900,
            color: "#152B17",
            lineHeight: 1.15,
            marginBottom: desc ? 12 : 0,
            letterSpacing: "-0.025em",
          }}
        >
          {title} {accent && <span style={{ color: "#1B3B22" }}>{accent}</span>}
        </h1>

        {/* Description */}
        {desc && (
          <p
            style={{
              fontSize: "clamp(14px, 1.6vw, 15.5px)",
              color: "#736B5E",
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
