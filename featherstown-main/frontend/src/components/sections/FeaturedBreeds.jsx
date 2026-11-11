/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Featured Companion Birds (Seasonal Collection)
   /components/sections/FeaturedBreeds.jsx

   Directly modeled on the reference "Seasonal Collection" section:
   - Header: "Featured Companion Birds" with "View All →" on right
   - 4-column card grid
   - Rich, clear companion bird photograph in top viewport
   - White bottom card strip with Breed Name, trait subtitle, and chevron arrow (>)
   - Smooth hover states, links directly to /birds or breed details
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import sunCrop from "../../assets/birds/crop-sun-conure.jpg";
import cockatielCrop from "../../assets/birds/crop-cockatiel.jpg";
import greenCrop from "../../assets/birds/crop-green-cheek.jpg";
import greyCrop from "../../assets/birds/crop-african-grey.jpg";

const FEATURED_BREEDS = [
  {
    id: "sun-conure",
    name: "Sun Conure",
    subtitle: "Playful, vibrant & affectionate",
    image: sunCrop,
    link: "/birds",
  },
  {
    id: "cockatiel",
    name: "Cockatiel",
    subtitle: "Gentle whistler & easy to bond",
    image: cockatielCrop,
    link: "/birds",
  },
  {
    id: "green-cheek",
    name: "Green-Cheek Conure",
    subtitle: "Quiet, compact & apartment safe",
    image: greenCrop,
    link: "/birds",
  },
  {
    id: "african-grey",
    name: "African Grey",
    subtitle: "Remarkable vocabulary & genius IQ",
    image: greyCrop,
    link: "/birds",
  },
];

export default function FeaturedBreeds() {
  return (
    <section
      style={{
        padding: "clamp(36px, 5vw, 68px) clamp(16px, 4.5vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "clamp(20px, 3vw, 32px)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 800,
            color: "#152B17",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Featured Companion Birds
        </h2>

        <Link
          to="/birds"
          className="t-btn-press"
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "#1B3B22",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>View All</span>
          <ArrowRight size={15} strokeWidth={2.4} />
        </Link>
      </div>

      {/* 4 Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px, 22vw, 270px), 1fr))",
          gap: "clamp(16px, 2.2vw, 24px)",
        }}
      >
        {FEATURED_BREEDS.map((breed) => (
          <Link
            key={breed.id}
            to={breed.link}
            className="group"
            style={{
              textDecoration: "none",
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid #E2DDD3",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1B3B22";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(27, 59, 34, 0.08)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2DDD3";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Image Viewport */}
            <div
              style={{
                width: "100%",
                aspectRatio: "4 / 3",
                background: "#FAF8F5",
                overflow: "hidden",
              }}
            >
              <img
                src={breed.image}
                alt={breed.name}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.35s ease",
                }}
                className="group-hover:scale-106"
              />
            </div>

            {/* Bottom Info Strip with Chevron */}
            <div
              style={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#FFFFFF",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#152B17",
                    margin: "0 0 3px 0",
                  }}
                >
                  {breed.name}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "#736B5E",
                    margin: 0,
                  }}
                >
                  {breed.subtitle}
                </p>
              </div>

              <div
                style={{
                  color: "#1B3B22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: 8,
                }}
              >
                <ChevronRight size={18} strokeWidth={2.4} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

