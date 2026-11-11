/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Featured Companion Birds (Seasonal Collection)
   /components/sections/FeaturedBreeds.jsx

   Directly modeled on the reference "Seasonal Collection" section:
   - Header: "Featured Companion Birds" with "View All →" on right
   - 4-column card grid, full-width expansive responsive layout
   - Rich, clear companion bird photograph in top viewport
   - White bottom card strip with Breed Name, trait subtitle, and chevron arrow (>)
   - Smooth hover states, links directly to /birds or breed details
   - 100% customizable from Admin Panel
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import sunCrop from "../../assets/birds/crop-sun-conure.jpg";
import cockatielCrop from "../../assets/birds/crop-cockatiel.jpg";
import greenCrop from "../../assets/birds/crop-green-cheek.jpg";
import greyCrop from "../../assets/birds/crop-african-grey.jpg";

const DEFAULT_FEATURED_BREEDS = [
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

const FALLBACK_IMAGES = {
  "sun-conure": sunCrop,
  "cockatiel": cockatielCrop,
  "green-cheek": greenCrop,
  "african-grey": greyCrop,
};

export default function FeaturedBreeds() {
  const { settings } = useSettings();

  const title = settings?.featuredBreedsTitle || "Featured Companion Birds";
  const rawList =
    settings?.featuredBreeds && settings.featuredBreeds.length > 0
      ? settings.featuredBreeds
      : DEFAULT_FEATURED_BREEDS;

  const resolveImage = (item, idx) => {
    if (!item?.image) {
      return DEFAULT_FEATURED_BREEDS[idx % 4]?.image || sunCrop;
    }
    const img = item.image;
    if (img === "/assets/birds/crop-sun-conure.jpg") return sunCrop;
    if (img === "/assets/birds/crop-cockatiel.jpg") return cockatielCrop;
    if (img === "/assets/birds/crop-green-cheek.jpg") return greenCrop;
    if (img === "/assets/birds/crop-african-grey.jpg") return greyCrop;
    return img;
  };

  return (
    <section
      style={{
        padding: "clamp(36px, 5vw, 68px) clamp(20px, 4.5vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        fontFamily: "Outfit, system-ui, sans-serif",
        boxSizing: "border-box",
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
          {title}
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

      {/* 4-Card Responsive Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
          width: "100%",
        }}
      >
        {rawList.map((breed, idx) => {
          const imgSrc = resolveImage(breed, idx);
          const fallback = DEFAULT_FEATURED_BREEDS[idx % 4]?.image || sunCrop;

          return (
            <Link
              key={breed.id || breed.name || idx}
              to={breed.link || "/birds"}
              className="t-hover-lift"
              style={{
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
                background: "#FFFFFF",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid #E2DDD3",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
            >
              {/* Photo Viewport */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "#FAF8F5",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={imgSrc}
                  alt={breed.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallback;
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </div>

              {/* Bottom Card Strip */}
              <div
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#FFFFFF",
                  borderTop: "1px solid #F0ECE4",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 15.5,
                      fontWeight: 800,
                      color: "#152B17",
                      marginBottom: 2,
                    }}
                  >
                    {breed.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#736B5E",
                    }}
                  >
                    {breed.subtitle}
                  </div>
                </div>

                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#FAF8F5",
                    border: "1px solid #E2DDD3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1B3B22",
                    flexShrink: 0,
                  }}
                >
                  <ChevronRight size={16} strokeWidth={2.4} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
