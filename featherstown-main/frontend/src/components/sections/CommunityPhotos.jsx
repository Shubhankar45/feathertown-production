/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Top Weekly Community Photos
   /components/sections/CommunityPhotos.jsx

   Exact match to Reference Section 5:
   - Deep matte dark background (#0B0F14)
   - "Top Weekly Community Photos" bold title with green accent
   - Asymmetric dark bento masonry grid of bird companion photos
   - Centered glowing mint pill button
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import sunImg from "../../assets/Sun-conure.jfif";
import greyImg from "../../assets/african.png";
import cockatielImg from "../../assets/cocketail.jpg";
import greenImg from "../../assets/green.jpg";
import macawImg from "../../assets/macaw.png";
import pineImg from "../../assets/pineapple.png";

const PHOTOS = [
  {
    id: 1,
    title: "Sunny with Rahul in Bangalore",
    author: "Rahul S. & Sun Conure",
    image: sunImg,
    tag: "Sun Conure",
    featured: true,
  },
  {
    id: 2,
    title: "Rio mastering his morning whistles",
    author: "Ananya M. & Cockatiel",
    image: cockatielImg,
    tag: "Cockatiel",
  },
  {
    id: 3,
    title: "Professor Grey joining family breakfast",
    author: "Vikram K. & African Grey",
    image: greyImg,
    tag: "African Grey",
  },
  {
    id: 4,
    title: "Little Mango learning step-up tricks",
    author: "Pooja D. & Green Cheek",
    image: greenImg,
    tag: "Green Cheek",
  },
  {
    id: 5,
    title: "Zeus spreading majestic canopy wings",
    author: "Amitabh N. & Macaw",
    image: macawImg,
    tag: "Macaw",
    featured: true,
  },
  {
    id: 6,
    title: "Peaches enjoying fresh papaya treat",
    author: "Sneha P. & Pineapple Conure",
    image: pineImg,
    tag: "Conure",
  },
];

export default function CommunityPhotos() {
  return (
    <section
      style={{
        background: "#F8FAFC",
        padding: "clamp(56px, 7vw, 88px) clamp(16px, 4vw, 64px)",
        position: "relative",
        borderTop: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "clamp(32px, 4vw, 48px)" }}>
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 46px)",
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#0F172A",
            letterSpacing: "-0.02em",
            margin: "0 0 8px 0",
          }}
        >
          <span style={{ color: "#059669" }}>Top Weekly</span> Community Photos
        </h2>
        <p style={{ fontSize: 14.5, color: "#64748B", margin: 0 }}>
          Real happy moments captured by verified FeatherTown bird parents across India.
        </p>
      </div>

      {/* Modern Bento Photo Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(clamp(240px, 30vw, 360px), 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
        }}
      >
        {PHOTOS.map((p) => (
          <div
            key={p.id}
            className="ft-card-lift"
            style={{
              position: "relative",
              borderRadius: 22,
              overflow: "hidden",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              minHeight: 280,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <img
              src={p.image}
              alt={p.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s ease",
              }}
            />

            {/* Dark Vignette Overlay for Text Legibility */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.35) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Tag Badge Top-Right */}
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(8px)",
                border: "1px solid #A7F3D0",
                color: "#059669",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
              }}
            >
              {p.tag}
            </div>

            {/* Photo Info Bottom */}
            <div style={{ position: "relative", zIndex: 2, padding: "18px 20px" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF", marginBottom: 3 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "#CBD5E1" }}>
                By {p.author}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Centered Green Pill Button at bottom */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Link
          to="/reviews"
          style={{
            background: "#059669",
            color: "#FFFFFF",
            padding: "13px 32px",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 14,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 6px 20px rgba(5, 150, 105, 0.28)",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.background = "#047857";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "#059669";
          }}
        >
          <span>View More Reviews &amp; Stories</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
