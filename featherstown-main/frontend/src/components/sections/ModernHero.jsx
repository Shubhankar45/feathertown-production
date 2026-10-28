/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Minimal Dark Hero Section
   /components/sections/ModernHero.jsx

   Inspired by modern dark avian aesthetic:
   - Deep matte charcoal / dark background (#0B0F14)
   - Large bold minimal typography with vibrant emerald accents (#10B981)
   - Perched Sun Conure on rustic tree branch
   - Mint gradient promo card with pill button
   - Translucent dark glass spec card with live stats
   - Smooth species switcher bar with auto-cycle
   - Component quick-access store hub
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

import perchedHeroImg from "../../assets/hero-perched.jpg";
import sunImg from "../../assets/Sun-conure.jfif";
import greyImg from "../../assets/african.png";
import cockatielImg from "../../assets/cocketail.jpg";
import macawImg from "../../assets/macaw.png";
import pineImg from "../../assets/pineapple.png";
import greenImg from "../../assets/green.jpg";

const BIRDS = [
  {
    id: "sun-conure",
    name: "Sun Conure",
    shortName: "Sun Conure",
    title: "Vibrant Rainbow Companion",
    species: "Aratinga solstitialis",
    price: "₹15,000",
    originalPrice: "₹18,500",
    discount: "Save 19%",
    image: perchedHeroImg,
    thumb: sunImg,
    tagline: "Bursting with sunny personality, acrobatic energy & deep shoulder cuddles.",
    description: "Parrots comprise about 398 species of birds that are seed-eating, affectionate, highly intelligent companions with vibrant plumage and long tapering tails.",
    talking: "Whistle & Words",
    lifespan: "25–30 Years",
    temperament: "Social & Cuddly",
    size: "Medium (30 cm)",
    accentColor: "#10B981",
  },
  {
    id: "african-grey",
    name: "African Grey",
    shortName: "African Grey",
    title: "The Genius Talker",
    species: "Psittacus erithacus",
    price: "₹45,000",
    originalPrice: "₹52,000",
    discount: "Save 14%",
    image: greyImg,
    thumb: greyImg,
    tagline: "World's most intelligent parrot. Masters vocabulary, mimics sounds & bonds for life.",
    description: "Renowned for astonishing cognitive aptitude, vocal mimicry, and deep emotional bonds with their human companions.",
    talking: "Exceptional Talker",
    lifespan: "40–60 Years",
    temperament: "Thoughtful & Loyal",
    size: "Large (33 cm)",
    accentColor: "#10B981",
  },
  {
    id: "cockatiel",
    name: "Cockatiel",
    shortName: "Cockatiel",
    title: "Sweet Whistling Friend",
    species: "Nymphicus hollandicus",
    price: "₹3,500",
    originalPrice: "₹4,500",
    discount: "Save 22%",
    image: cockatielImg,
    thumb: cockatielImg,
    tagline: "Gentle, whistle virtuoso for flats and first-time companion bird parents.",
    description: "Affectionate crested parakeets that serenade their families with melodic whistling and love gentle crest scratches.",
    talking: "Whistle Virtuoso",
    lifespan: "15–20 Years",
    temperament: "Gentle & Musical",
    size: "Small (32 cm)",
    accentColor: "#F59E0B",
  },
  {
    id: "macaw",
    name: "Blue & Gold Macaw",
    shortName: "Macaw",
    title: "Majestic Canopy Sovereign",
    species: "Ara ararauna",
    price: "₹1,20,000",
    originalPrice: "₹1,40,000",
    discount: "Save 15%",
    image: macawImg,
    thumb: macawImg,
    tagline: "Breathtaking sovereign with deep affection, regal colors & lifelong loyalty.",
    description: "The grand sovereign of South American canopies, possessing striking turquoise and gold plumage with a gentle giant disposition.",
    talking: "Commands Joy",
    lifespan: "50–65 Years",
    temperament: "Devoted & Regal",
    size: "Extra Large (85 cm)",
    accentColor: "#0284C7",
  },
  {
    id: "green-cheek",
    name: "Green Cheek Conure",
    shortName: "Green Cheek",
    title: "Pocket Cuddle Champion",
    species: "Pyrrhura molinae",
    price: "₹10,500",
    originalPrice: "₹13,000",
    discount: "Save 19%",
    image: greenImg,
    thumb: greenImg,
    tagline: "Low vocal volume, affectionate personality, and love for shoulder cuddles.",
    description: "Quiet, charming pocket companions that thrive in apartments while showering their owners with boundless curiosity and warmth.",
    talking: "Soft Chirper",
    lifespan: "15–20 Years",
    temperament: "Cuddly & Inquisitive",
    size: "Compact (25 cm)",
    accentColor: "#10B981",
  },
  {
    id: "pineapple",
    name: "Pineapple Conure",
    shortName: "Pineapple",
    title: "Playful Pocket Comedian",
    species: "Pyrrhura molinae mutation",
    price: "₹12,000",
    originalPrice: "₹14,500",
    discount: "Save 17%",
    image: pineImg,
    thumb: pineImg,
    tagline: "Sweet peach hues, non-stop playful antics, and very quiet vocal presence.",
    description: "Vibrant mutation exhibiting glowing sunburst chest tones and a gentle, whimsical temperament perfect for family life.",
    talking: "Quiet Chirper",
    lifespan: "20–25 Years",
    temperament: "Playful & Curious",
    size: "Compact (26 cm)",
    accentColor: "#10B981",
  },
];

// Component Quick-Access Hub
const STORE_HUBS = [
  {
    icon: "🦜",
    title: "Companion Birds",
    count: "6 Certified Species",
    link: "/birds",
  },
  {
    icon: "🏡",
    title: "Cages & Aviaries",
    count: "Spacious Habitats",
    link: "/accessories?category=Cages",
  },
  {
    icon: "🌾",
    title: "Organic Diets",
    count: "Seeds, Nuts & Pellets",
    link: "/accessories?category=Food",
  },
  {
    icon: "🎾",
    title: "Enrichment & Toys",
    count: "Foraging & Swings",
    link: "/accessories?category=Toys",
  },
  {
    icon: "🎯",
    title: "Find Your Bird",
    count: "60-Second Quiz",
    link: "/#quiz",
  },
];

export default function ModernHero() {
  const { settings } = useSettings();
  const waNum = (settings?.whatsapp || "919556747518").replace(/\D/g, "");

  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);

  const activeBird = BIRDS[activeIdx];

  // Auto-cycle through species (6.5s per species)
  useEffect(() => {
    if (isPaused) return;

    setTimerProgress(0);
    const tickMs = 65;
    const totalMs = 6500;
    const stepPercent = (tickMs / totalMs) * 100;

    const timer = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev >= 100) {
          setActiveIdx((curr) => (curr + 1) % BIRDS.length);
          return 0;
        }
        return prev + stepPercent;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [activeIdx, isPaused]);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#F8FAFC",
        color: "#0F172A",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        paddingTop: "clamp(24px, 4vw, 44px)",
        paddingBottom: "clamp(48px, 6vw, 72px)",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Scoped Keyframe Animations ── */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes auraGlowPulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.08); }
        }
        .hero-bird-perched {
          animation: heroFloat 6s ease-in-out infinite;
          will-change: transform;
        }
        .hero-glow-blob {
          animation: auraGlowPulse 6s ease-in-out infinite;
        }
      `}</style>

      {/* ── Ambient Radial Glows (Green & Orange Theme) ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {/* Emerald Aura Center-Right */}
        <div
          className="hero-glow-blob"
          style={{
            position: "absolute",
            width: "clamp(400px, 50vw, 750px)",
            height: "clamp(400px, 50vw, 750px)",
            top: "-10%",
            right: "5%",
            background: "radial-gradient(circle, rgba(22, 163, 74, 0.18) 0%, transparent 68%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
        {/* Warm Sunset Orange Aura Top-Left */}
        <div
          style={{
            position: "absolute",
            width: "clamp(300px, 35vw, 500px)",
            height: "clamp(300px, 35vw, 500px)",
            bottom: "0%",
            left: "-5%",
            background: "radial-gradient(circle, rgba(249, 115, 22, 0.14) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* ── Main Container ── */}
      <div
        style={{
          width: "100%",
          padding: "0 clamp(16px, 4vw, 64px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* ── 2-Column Hero Showcase ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: "clamp(32px, 5vw, 64px)",
            alignItems: "center",
          }}
        >
          {/* ══════════════════════════════════════════
              LEFT COLUMN: Bold Headline & Green Card
             ══════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Tagline / Subtitle Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                color: "#EA580C",
                letterSpacing: 1.1,
                textTransform: "uppercase",
                width: "fit-content",
                marginBottom: 16,
              }}
            >
              <span>🦜</span>
              <span>Ethical Aviary &amp; Bird Marketplace</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(30px, 4.4vw, 54px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#0F172A",
                margin: "0 0 20px 0",
              }}
            >
              <span style={{ color: "#16A34A" }}>Feather</span><span style={{ color: "#EA580C" }}>Town</span> Helps you <br />
              to know &amp; adopt <br />
              <span style={{ color: "#16A34A" }}>Birds</span>
            </h1>

            {/* Green Card with Orange Button */}
            <div
              style={{
                background: "linear-gradient(135deg, #15803D 0%, #16A34A 100%)",
                borderRadius: 22,
                padding: "clamp(18px, 2.8vw, 24px)",
                boxShadow: "0 14px 32px rgba(22, 163, 74, 0.22)",
                maxWidth: 460,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle light sheen overlay */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.12)",
                  pointerEvents: "none",
                }}
              />

              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "#FFFFFF",
                  margin: "0 0 16px 0",
                  fontWeight: 500,
                }}
              >
                Get to know all kinds of healthy hand-tamed companion birds with FeatherTown and be part of our community of bird lovers, verified breeders, and dedicated pet parents.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Link
                  to="/birds"
                  style={{
                    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                    color: "#FFFFFF",
                    padding: "10px 22px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(234, 88, 12, 0.55)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(234, 88, 12, 0.4)";
                  }}
                >
                  <span>Explore Birds</span>
                  <span style={{ color: "#FEF3C7", fontSize: 15 }}>→</span>
                </Link>

                <a
                  href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                    `Hi FeatherTown! I'm interested in adopting a ${activeBird.name} (${activeBird.price}). Could you please share live photos and availability?`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFFFFF",
                    padding: "9px 18px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 700,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span>💬</span>
                  <span>WhatsApp Breeder</span>
                </a>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN: Perched Bird on Branch + Translucent Info Card
             ══════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* The Main Hero Perched Bird Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 520,
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
                border: "1px solid #E2E8F0",
              }}
            >
              <img
                src={activeBird.image}
                alt={activeBird.name}
                className="hero-bird-perched"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 520,
                  objectFit: "cover",
                  display: "block",
                  transition: "opacity 0.4s ease",
                }}
              />

              {/* Translucent Frosted Glass Species Card */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  right: 20,
                  background: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid #E2E8F0",
                  borderRadius: 20,
                  padding: "16px 20px",
                  boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", margin: "0 0 2px 0" }}>
                      {activeBird.name}
                    </h3>
                    <span style={{ fontSize: 10.5, color: "#15803D", fontWeight: 700, fontStyle: "italic" }}>
                      {activeBird.species}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#16A34A" }}>
                      {activeBird.price}
                    </div>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        color: "#C2410C",
                        background: "#FFEDD5",
                        border: "1px solid #FED7AA",
                        padding: "2px 7px",
                        borderRadius: 999,
                      }}
                    >
                      {activeBird.discount}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    lineHeight: 1.5,
                    margin: "0 0 12px 0",
                  }}
                >
                  {activeBird.description}
                </p>

                {/* 3 Quick Spec Badges */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    paddingTop: 10,
                    borderTop: "1px solid #E2E8F0",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase" }}>Mimicry</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{activeBird.talking}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase" }}>Lifespan</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{activeBird.lifespan}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase" }}>Nature</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{activeBird.temperament}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Species Selector Carousel Thumbnails (Clean Light SaaS Bar) */}
            <div
              style={{
                marginTop: 20,
                width: "100%",
                maxWidth: 520,
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* Progress Line */}
              <div
                style={{
                  height: 3,
                  width: "100%",
                  background: "#F1F5F9",
                  borderRadius: 999,
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${timerProgress}%`,
                    background: "linear-gradient(90deg, #16A34A, #F97316)",
                    transition: "width 0.08s linear",
                  }}
                />
              </div>

              {/* Thumbnails Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 6,
                }}
              >
                {BIRDS.map((b, idx) => {
                  const isSelected = idx === activeIdx;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveIdx(idx);
                        setTimerProgress(0);
                      }}
                      style={{
                        background: isSelected ? "#ECFDF5" : "#F8FAFC",
                        border: isSelected ? "1.5px solid #16A34A" : "1px solid #E2E8F0",
                        borderRadius: 14,
                        padding: "6px 2px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                        transition: "all 0.2s",
                        transform: isSelected ? "scale(1.04)" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "#F1F5F9",
                          border: isSelected ? "1.5px solid #16A34A" : "1px solid #CBD5E1",
                        }}
                      >
                        <img
                          src={b.thumb}
                          alt={b.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: isSelected ? 800 : 500,
                          color: isSelected ? "#059669" : "#64748B",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {b.shortName.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Component Quick-Access Hub (Light SaaS Cards) ── */}
        <div
          style={{
            marginTop: "clamp(36px, 5vw, 56px)",
            paddingTop: 24,
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(clamp(140px, 18vw, 200px), 1fr))",
              gap: 12,
            }}
          >
            {STORE_HUBS.map((hub, idx) => (
              <Link
                key={idx}
                to={hub.link}
                className="ft-card-lift"
                style={{
                  textDecoration: "none",
                  background: "#FFFFFF",
                  borderRadius: 18,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                  transition: "transform 0.25s, border-color 0.2s, background 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#10B981";
                  e.currentTarget.style.background = "#F8FAFC";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(15, 23, 42, 0.04)";
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {hub.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0F172A",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {hub.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 2 }}>
                    {hub.count}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
