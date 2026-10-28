/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Explore Existing Birds (Aviary Habitat Preview)
   /components/sections/ExploreVideoSection.jsx

   Exact match to Reference Section 3:
   - Deep matte dark background (#0B0F14)
   - Left: "Let's explore the existing Birds" bold headline
   - Right: Scenic nature mountain aviary card with glowing emerald Play icon ▶️
═══════════════════════════════════════════════════════════════ */
import { useState } from "react";
import { Link } from "react-router-dom";
import natureImg from "../../assets/nature-aviary.jpg";

export default function ExploreVideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      style={{
        background: "#F8FAFC",
        padding: "clamp(48px, 6vw, 80px) clamp(16px, 4vw, 64px)",
        position: "relative",
        borderTop: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: "clamp(32px, 5vw, 64px)",
          alignItems: "center",
        }}
      >
        {/* Left Column: Headline & Description */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2
            style={{
              fontSize: "clamp(32px, 4.4vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: "#0F172A",
              margin: "0 0 16px 0",
            }}
          >
            Let's explore <br />
            the existing <br />
            <span style={{ color: "#059669" }}>Birds</span>
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "#475569",
              lineHeight: 1.65,
              margin: "0 0 28px 0",
              maxWidth: 460,
            }}
          >
            Take an inside look at how our companion birds are hand-raised in ethical natural free-flight environments with daily social handling and organic nutrition.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link
              to="/birds"
              style={{
                background: "#059669",
                color: "#FFFFFF",
                padding: "12px 26px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 13.5,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(5, 150, 105, 0.25)",
              }}
            >
              <span>Browse All Species</span>
              <span>→</span>
            </Link>

            <Link
              to="/accessories"
              style={{
                background: "#FFFFFF",
                color: "#0F172A",
                border: "1px solid #CBD5E1",
                padding: "12px 22px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13.5,
                textDecoration: "none",
              }}
            >
              <span>Explore Habitats &amp; Cages</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Panoramic Nature Aviary Video Card with Emerald Play Button */}
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
            border: "1px solid #E2E8F0",
            aspectRatio: "16 / 10",
            maxHeight: 400,
          }}
        >
          <img
            src={natureImg}
            alt="Nature aviary habitat"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Dark Vignette Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.1) 60%, transparent 100%)",
            }}
          />

          {/* Centered Glowing Emerald Play Button ▶️ */}
          <button
            onClick={() => setPlaying(!playing)}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(8px)",
              border: "2px solid #059669",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.15)",
              transition: "transform 0.25s, background 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.12)";
              e.currentTarget.style.background = "#059669";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.92)";
              e.currentTarget.style.color = "#059669";
            }}
            aria-label="Play aviary tour video"
          >
            ▶
          </button>

          {/* Floating bottom badge */}
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 18,
              fontSize: 12.5,
              fontWeight: 700,
              color: "#0F172A",
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(6px)",
              padding: "5px 14px",
              borderRadius: 999,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
            }}
          >
            🌿 Virtual Aviary Habitat Tour &bull; 4K
          </div>
        </div>
      </div>
    </section>
  );
}
