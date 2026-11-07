import { useState } from "react";
import { Link } from "react-router-dom";
import natureImg from "../../assets/nature-aviary.jpg";
import Magnet from "../react-bits/Magnet";

export default function ExploreVideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      style={{
        background: "#F8FAFC",
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
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
          gap: "clamp(36px, 6vw, 72px)",
          alignItems: "center",
        }}
      >
        {/* Left Column: Headline & Description */}
        <div style={{ display: "flex", flexDirection: "column" }}>
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
              marginBottom: 14,
              width: "fit-content",
            }}
          >
            <span>NATURAL FLIGHT HABITAT</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#0F172A",
              margin: "0 0 16px 0",
            }}
          >
            Let's explore <br />
            the natural <br />
            <span className="text-emerald-600">Aviary Sanctuary</span>
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.65,
              margin: "0 0 26px 0",
              maxWidth: 480,
            }}
          >
            Take an inside look at how our companion birds are hand-raised in expansive natural flight aviaries. Pure air, real foliage, organic forage puzzles, and continuous positive reinforcement socialization ensure calm, confident companions.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Magnet padding={40} magnetStrength={3}>
              <Link
                to="/birds"
                className="t-btn-press"
                style={{
                  background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                  color: "#FFFFFF",
                  padding: "12px 26px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(22, 163, 74, 0.28)",
                }}
              >
                <span>Browse All Species</span>
                <span style={{ color: "#FEF3C7" }}>→</span>
              </Link>
            </Magnet>

            <Link
              to="/accessories"
              className="t-btn-press"
              style={{
                background: "#FFFFFF",
                color: "#0F172A",
                border: "1.5px solid #CBD5E1",
                padding: "11px 22px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <span>Explore Habitats &amp; Cages</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Panoramic Nature Aviary Video Card */}
        <div
          className="t-hover-lift t-img-zoom"
          style={{
            position: "relative",
            width: "100%",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
            border: "1px solid #E2E8F0",
            aspectRatio: "16 / 10",
            maxHeight: 420,
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
              background: "linear-gradient(to top, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 100%)",
            }}
          />

          {/* Centered Glowing Play Button ▶️ */}
          <button
            onClick={() => setPlaying(!playing)}
            className="t-btn-press"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(10px)",
              border: "2px solid #16A34A",
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              cursor: "pointer",
              boxShadow: "0 8px 28px rgba(15, 23, 42, 0.2)",
              transition: "transform 0.25s, background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#16A34A";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.94)";
              e.currentTarget.style.color = "#16A34A";
            }}
            aria-label="Play aviary tour video"
          >
            ▶
          </button>

          {/* Floating bottom badge */}
          <div
            style={{
              position: "absolute",
              bottom: 18,
              left: 18,
              fontSize: 12,
              fontWeight: 800,
              color: "#0F172A",
              background: "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(8px)",
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid #DCFCE7",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.08)",
            }}
          >
            🌿 Virtual Aviary Habitat Tour &bull; 4K Ultra HD
          </div>
        </div>
      </div>
    </section>
  );
}
