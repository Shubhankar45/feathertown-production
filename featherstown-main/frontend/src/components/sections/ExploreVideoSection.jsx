import { useState } from "react";
import { Link } from "react-router-dom";
import { Feather } from "lucide-react";
import natureImg from "../../assets/nature-aviary.jpg";
import Magnet from "../react-bits/Magnet";

export default function ExploreVideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section
      style={{
        background: "#FAF8F5",
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
        position: "relative",
        borderTop: "1px solid #E2DDD3",
        borderBottom: "1px solid #E2DDD3",
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
              background: "#E7EFE8",
              border: "1px solid #B8D4BA",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#1B3B22",
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
              color: "#152B17",
              margin: "0 0 16px 0",
            }}
          >
            Let's explore <br />
            the natural <br />
            <span style={{ color: "#1B3B22" }}>Aviary Sanctuary</span>
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "#736B5E",
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
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  padding: "12px 26px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(27, 59, 34, 0.25)",
                }}
              >
                <span>Browse All Species</span>
                <span>→</span>
              </Link>
            </Magnet>

            <Link
              to="/accessories"
              className="t-btn-press"
              style={{
                background: "#FFFFFF",
                color: "#152B17",
                border: "1.5px solid #E2DDD3",
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

        {/* Right Column: Video / Ambient Photo Card */}
        <div
          className="t-hover-lift t-img-zoom"
          style={{
            position: "relative",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 20px 48px rgba(21, 43, 23, 0.08)",
            border: "1px solid #E2DDD3",
            background: "#FFFFFF",
            minHeight: 340,
          }}
        >
          {playing ? (
            <div style={{ position: "relative", paddingTop: "56.25%", background: "#152B17" }}>
              <iframe
                title="FeatherTown Aviary Tour"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <img
                src={natureImg}
                alt="FeatherTown natural lush flight aviary canopy with hand-tamed companion birds"
                style={{
                  width: "100%",
                  height: 380,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(21, 43, 23, 0.18)",
                }}
              />
            </div>
          )}

          {/* Central Play Button */}
          {!playing && (
            <button
              onClick={() => setPlaying(true)}
              className="t-btn-press"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "2px solid #1B3B22",
                color: "#1B3B22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                cursor: "pointer",
                boxShadow: "0 8px 28px rgba(21, 43, 23, 0.2)",
                transition: "transform 0.25s, background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1B3B22";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                e.currentTarget.style.color = "#1B3B22";
              }}
              aria-label="Play aviary tour video"
            >
              ▶
            </button>
          )}

          {/* Floating bottom badge */}
          <div
            style={{
              position: "absolute",
              bottom: 18,
              left: 18,
              fontSize: 12,
              fontWeight: 800,
              color: "#152B17",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
              padding: "6px 16px",
              borderRadius: 999,
              border: "1px solid #B8D4BA",
              boxShadow: "0 2px 10px rgba(21, 43, 23, 0.08)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Feather size={13} color="#1B3B22" strokeWidth={2.2} />
            <span>Virtual Aviary Habitat Tour &bull; 4K Ultra HD</span>
          </div>
        </div>
      </div>
    </section>
  );
}
