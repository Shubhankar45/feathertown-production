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
import ShinyText from "../react-bits/ShinyText";
import BlurText from "../react-bits/BlurText";
import Magnet from "../react-bits/Magnet";
import SpotlightCard from "../react-bits/SpotlightCard";

import sunCrop from "../../assets/birds/crop-sun-conure.jpg";
import sunThumb from "../../assets/birds/thumb-sun-conure.jpg";
import greyCrop from "../../assets/birds/crop-african-grey.jpg";
import greyThumb from "../../assets/birds/thumb-african-grey.jpg";
import cockatielCrop from "../../assets/birds/crop-cockatiel.jpg";
import cockatielThumb from "../../assets/birds/thumb-cockatiel.jpg";
import macawCrop from "../../assets/birds/crop-macaw.jpg";
import macawThumb from "../../assets/birds/thumb-macaw.jpg";
import greenCrop from "../../assets/birds/crop-green-cheek.jpg";
import greenThumb from "../../assets/birds/thumb-green-cheek.jpg";
import pineCrop from "../../assets/birds/crop-pineapple-conure.jpg";
import pineThumb from "../../assets/birds/thumb-pineapple-conure.jpg";

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
    image: sunCrop,
    thumb: sunThumb,
    tagline: "Bursting with sunny personality, acrobatic energy & deep shoulder cuddles.",
    description: "Affectionate, highly intelligent companion birds known for radiant orange-yellow plumage and joyful social nature.",
    talking: "Whistle & Words",
    lifespan: "25–30 Years",
    temperament: "Social & Cuddly",
    size: "Medium (30 cm)",
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
    image: greyCrop,
    thumb: greyThumb,
    tagline: "World's most intelligent parrot. Masters vocabulary, mimics sounds & bonds for life.",
    description: "Renowned for astonishing cognitive aptitude, vocal mimicry, and deep emotional bonds with their human companions.",
    talking: "Exceptional Talker",
    lifespan: "40–60 Years",
    temperament: "Thoughtful & Loyal",
    size: "Large (33 cm)",
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
    image: cockatielCrop,
    thumb: cockatielThumb,
    tagline: "Gentle, whistle virtuoso for flats and first-time companion bird parents.",
    description: "Affectionate crested parakeets that serenade their families with melodic whistling and love gentle crest scratches.",
    talking: "Whistle Virtuoso",
    lifespan: "15–20 Years",
    temperament: "Gentle & Musical",
    size: "Small (32 cm)",
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
    image: macawCrop,
    thumb: macawThumb,
    tagline: "Breathtaking sovereign with deep affection, regal colors & lifelong loyalty.",
    description: "The grand sovereign of South American canopies, possessing striking turquoise and gold plumage with a gentle giant disposition.",
    talking: "Commands Joy",
    lifespan: "50–65 Years",
    temperament: "Devoted & Regal",
    size: "Extra Large (85 cm)",
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
    image: greenCrop,
    thumb: greenThumb,
    tagline: "Low vocal volume, affectionate personality, and love for shoulder cuddles.",
    description: "Quiet, charming pocket companions that thrive in apartments while showering their owners with boundless curiosity and warmth.",
    talking: "Soft Chirper",
    lifespan: "15–20 Years",
    temperament: "Cuddly & Inquisitive",
    size: "Compact (25 cm)",
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
    image: pineCrop,
    thumb: pineThumb,
    tagline: "Sweet peach hues, non-stop playful antics, and very quiet vocal presence.",
    description: "Vibrant mutation exhibiting glowing sunburst chest tones and a gentle, whimsical temperament perfect for family life.",
    talking: "Quiet Chirper",
    lifespan: "20–25 Years",
    temperament: "Playful & Curious",
    size: "Compact (26 cm)",
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
            {/* Tagline / Subtitle Pill with ShinyText */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255, 247, 237, 0.95)",
                backdropFilter: "blur(8px)",
                border: "1px solid #FED7AA",
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                color: "#EA580C",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                width: "fit-content",
                marginBottom: 16,
                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.08)",
              }}
            >
              <span>🦜</span>
              <ShinyText text="Ethical Aviary & Certified Marketplace" speed={3.5} />
            </div>

            {/* Headline with Clean Typography & Staggered Reveal */}
            <h1
              style={{
                fontSize: "clamp(32px, 4.5vw, 56px)",
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: "#0F172A",
                margin: "0 0 22px 0",
              }}
            >
              <span style={{ color: "#16A34A" }}>Feather</span><span style={{ color: "#EA580C" }}>Town</span> Helps you <br />
              to know &amp; adopt <br />
              <span style={{ color: "#16A34A" }}>Healthy Companion Birds</span>
            </h1>

            {/* Green Card with Orange Button */}
            <div
              className="t-hover-lift"
              style={{
                background: "#15803D",
                borderRadius: 24,
                padding: "clamp(20px, 3vw, 26px)",
                boxShadow: "0 18px 36px rgba(21, 128, 61, 0.2)",
                maxWidth: 480,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "#FFFFFF",
                  margin: "0 0 18px 0",
                  fontWeight: 500,
                  opacity: 0.95,
                }}
              >
                Get to know certified hand-tamed companion birds with FeatherTown. Connect directly with licensed avian breeders, DNA certification, and lifetime nutritional care.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Magnet padding={40} magnetStrength={3}>
                  <Link
                    to="/birds"
                    className="t-btn-press"
                    style={{
                      background: "#EA580C",
                      color: "#FFFFFF",
                      padding: "11px 24px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(234, 88, 12, 0.4)",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    }}
                  >
                    <span>Explore Birds</span>
                    <span style={{ color: "#FEF3C7", fontSize: 15 }}>→</span>
                  </Link>
                </Magnet>

                <Magnet padding={30} magnetStrength={4}>
                  <a
                    href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                      `Hi FeatherTown! I'm interested in adopting a ${activeBird.name} (${activeBird.price}). Could you please share live photos and availability?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="t-btn-press"
                    style={{
                      background: "rgba(255, 255, 255, 0.15)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      color: "#FFFFFF",
                      padding: "10px 20px",
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>💬</span>
                    <span>WhatsApp Breeder</span>
                  </a>
                </Magnet>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN: Dedicated Bird Showcase Card
             ══════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {/* The Main Elevated Showcase Card */}
            <div
              className="t-hover-lift"
              style={{
                width: "100%",
                maxWidth: 520,
                background: "#FFFFFF",
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid #E2E8F0",
                boxShadow: "0 16px 40px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)",
              }}
            >
              {/* STAGE: Dedicated Fixed 4:3 Aspect Ratio Image Viewport (Bird is NEVER covered!) */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  background: "#0F172A",
                  overflow: "hidden",
                }}
              >
                <img
                  key={activeBird.id}
                  src={activeBird.image}
                  alt={activeBird.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                    transition: "opacity 0.3s ease, transform 0.4s ease",
                  }}
                />

                {/* Top-Left Status Pill */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    background: "#FFFFFF",
                    color: "#16A34A",
                    border: "1px solid #BBF7D0",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
                  <span>Available at Aviary</span>
                </div>

                {/* Top-Right Discount Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "#EA580C",
                    color: "#FFFFFF",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
                  }}
                >
                  {activeBird.discount}
                </div>
              </div>

              {/* METADATA: Clean Structured Info Directly Below (100% visible, perfectly aligned) */}
              <div style={{ padding: "20px 22px 22px" }}>
                {/* Title & Price Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0F172A",
                        letterSpacing: "-0.02em",
                        margin: "0 0 3px 0",
                      }}
                    >
                      {activeBird.name}
                    </h3>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#16A34A",
                        fontWeight: 600,
                        fontStyle: "italic",
                      }}
                    >
                      {activeBird.species}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        color: "#16A34A",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {activeBird.price}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#94A3B8",
                        fontWeight: 600,
                        textDecoration: "line-through",
                      }}
                    >
                      {activeBird.originalPrice}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: 13,
                    color: "#475569",
                    lineHeight: 1.55,
                    margin: "0 0 16px 0",
                  }}
                >
                  {activeBird.description}
                </p>

                {/* 3 Specifications Grid with Clean Slate Styling */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 14,
                    padding: "10px 14px",
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Mimicry
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                      {activeBird.talking}
                    </div>
                  </div>
                  <div style={{ borderLeft: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Lifespan
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                      {activeBird.lifespan}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Nature
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                      {activeBird.temperament}
                    </div>
                  </div>
                </div>

                {/* Action Button Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Link
                    to="/birds"
                    className="t-btn-press"
                    style={{
                      background: "#16A34A",
                      color: "#FFFFFF",
                      textAlign: "center",
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>Adopt Bird</span>
                    <span>→</span>
                  </Link>
                  <a
                    href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                      `Hi FeatherTown! I'm interested in adopting a ${activeBird.name} (${activeBird.price}). Is it available?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="t-btn-press"
                    style={{
                      background: "#F8FAFC",
                      color: "#0F172A",
                      border: "1px solid #CBD5E1",
                      textAlign: "center",
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontSize: 12.5,
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>💬 WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Species Selector Carousel (Clean Light SaaS Bar) */}
            <div
              style={{
                marginTop: 16,
                width: "100%",
                maxWidth: 520,
                background: "#FFFFFF",
                borderRadius: 18,
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
                    background: "#16A34A",
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
                        background: isSelected ? "#F0FDF4" : "#FFFFFF",
                        border: isSelected ? "1.5px solid #16A34A" : "1px solid #E2E8F0",
                        borderRadius: 12,
                        padding: "6px 2px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 0.18s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "#F8FAFC",
                          border: isSelected ? "1.5px solid #16A34A" : "1px solid #E2E8F0",
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
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? "#16A34A" : "#64748B",
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
              gridTemplateColumns: "repeat(auto-fit, minmax(clamp(150px, 18vw, 210px), 1fr))",
              gap: 14,
            }}
          >
            {STORE_HUBS.map((hub, idx) => (
              <Link
                key={idx}
                to={hub.link}
                style={{ textDecoration: "none" }}
              >
                <SpotlightCard
                  spotlightColor="rgba(22, 163, 74, 0.15)"
                  borderColor="#E2E8F0"
                  className="t-hover-lift"
                  style={{
                    borderRadius: 20,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: "#ECFDF5",
                      border: "1px solid #BBF7D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(22, 163, 74, 0.1)",
                    }}
                  >
                    {hub.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: "#0F172A",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {hub.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#16A34A", fontWeight: 700, marginTop: 2 }}>
                      {hub.count}
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
