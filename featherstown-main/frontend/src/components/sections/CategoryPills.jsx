/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Circular Category Quick-Pills
   /components/sections/CategoryPills.jsx

   Directly modeled on the reference e-commerce quick category row:
   - 9 circular pastel pill buttons with clean icons
   - Soft pastel alternating circular containers (#EAF2EC and #FDF2E9)
   - Clean, minimal typography underneath
   - 100% Lucide React line icons (zero emojis)
   - Smooth horizontal scroll on mobile with hidden scrollbars
═══════════════════════════════════════════════════════════════ */
import { Link } from "react-router-dom";
import {
  Wheat,
  Feather,
  Sparkles,
  Puzzle,
  Home,
  Layers,
  Droplets,
  Stethoscope,
  Compass,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "food",
    name: "Bird Food",
    to: "/accessories?category=food",
    icon: Wheat,
    bg: "#EAF2EC",
    color: "#1B3B22",
  },
  {
    id: "birds",
    name: "Companion Birds",
    to: "/birds",
    icon: Feather,
    bg: "#FDF2E9",
    color: "#D9381E",
  },
  {
    id: "treats",
    name: "Healthy Treats",
    to: "/accessories?category=treats",
    icon: Sparkles,
    bg: "#EAF2EC",
    color: "#1B3B22",
  },
  {
    id: "toys",
    name: "Foraging Toys",
    to: "/accessories?category=toys",
    icon: Puzzle,
    bg: "#FDF2E9",
    color: "#D9381E",
  },
  {
    id: "cages",
    name: "Cages & Aviaries",
    to: "/accessories?category=cages",
    icon: Home,
    bg: "#EAF2EC",
    color: "#1B3B22",
  },
  {
    id: "perches",
    name: "Perches & Stands",
    to: "/accessories?category=perches",
    icon: Layers,
    bg: "#FDF2E9",
    color: "#D9381E",
  },
  {
    id: "grooming",
    name: "Grooming",
    to: "/accessories?category=grooming",
    icon: Droplets,
    bg: "#EAF2EC",
    color: "#1B3B22",
  },
  {
    id: "health",
    name: "Health & Care",
    to: "/accessories?category=health",
    icon: Stethoscope,
    bg: "#FDF2E9",
    color: "#D9381E",
  },
  {
    id: "quiz",
    name: "60s Bird Quiz",
    to: "/quiz",
    icon: Compass,
    bg: "#EAF2EC",
    color: "#1B3B22",
    highlight: true,
  },
];

export default function CategoryPills() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "clamp(24px, 4vw, 44px) clamp(16px, 4vw, 64px)",
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
        borderBottom: "1px solid #E2DDD3",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
      aria-label="Shop by Category"
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "clamp(12px, 2.2vw, 28px)",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 4,
        }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={cat.to}
              className="t-btn-press group"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
                flexShrink: 0,
                minWidth: "clamp(72px, 9vw, 96px)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {/* Circular Pastel Bubble */}
              <div
                style={{
                  width: "clamp(60px, 6vw, 76px)",
                  height: "clamp(60px, 6vw, 76px)",
                  borderRadius: "50%",
                  background: cat.bg,
                  border: `1.5px solid ${cat.color === "#D9381E" ? "#F5D0C5" : "#CCE0D0"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: cat.color,
                  marginBottom: 10,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease",
                }}
                className="group-hover:scale-108 group-hover:shadow-md"
              >
                <Icon size={26} strokeWidth={2.2} />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "clamp(12px, 1vw, 13px)",
                  fontWeight: 700,
                  color: cat.highlight ? "#D9381E" : "#152B17",
                  lineHeight: 1.25,
                  maxWidth: 90,
                  display: "block",
                  transition: "color 0.15s ease",
                }}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

