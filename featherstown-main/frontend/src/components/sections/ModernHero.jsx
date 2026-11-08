/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Editorial Avian Hero Section
   /components/sections/ModernHero.jsx

   Crafted per tasteskill 2.5 & impeccable standards:
   - One screen fit: balanced vertical proportion, fits above fold
   - Restrained, elegant showcase card (400px max-width, 16:10 ratio)
   - Zero bird occlusion: photo sits in dedicated top stage
   - Plain, confident editorial copy & high-contrast typography
   - Solid modern emerald (#16A34A) & sunset orange (#EA580C) palette
   - Clean micro-interactions: lift, press, smooth species cross-fade
   - Sleek integrated species switcher & category quick-anchors
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

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
    species: "Aratinga solstitialis",
    price: "₹15,000",
    originalPrice: "₹18,500",
    discount: "Save 19%",
    image: sunCrop,
    thumb: sunThumb,
    talking: "Whistle & Words",
    lifespan: "25–30 Yrs",
    temperament: "Social & Cuddly",
    description: "Affectionate, vibrant companion parrots bursting with acrobatic energy and deep shoulder bonding.",
  },
  {
    id: "african-grey",
    name: "African Grey",
    shortName: "African Grey",
    species: "Psittacus erithacus",
    price: "₹45,000",
    originalPrice: "₹52,000",
    discount: "Save 14%",
    image: greyCrop,
    thumb: greyThumb,
    talking: "Exceptional Talker",
    lifespan: "40–60 Yrs",
    temperament: "Thoughtful & Loyal",
    description: "World's most intelligent parrot. Masters huge vocabularies, mimics sounds, and bonds deeply for life.",
  },
  {
    id: "cockatiel",
    name: "Cockatiel",
    shortName: "Cockatiel",
    species: "Nymphicus hollandicus",
    price: "₹3,500",
    originalPrice: "₹4,500",
    discount: "Save 22%",
    image: cockatielCrop,
    thumb: cockatielThumb,
    talking: "Whistle Virtuoso",
    lifespan: "15–20 Yrs",
    temperament: "Gentle & Musical",
    description: "Sweet-tempered, whistle-loving companions perfect for apartments and first-time bird owners.",
  },
  {
    id: "macaw",
    name: "Blue & Gold Macaw",
    shortName: "Macaw",
    species: "Ara ararauna",
    price: "₹1,20,000",
    originalPrice: "₹1,40,000",
    discount: "Save 15%",
    image: macawCrop,
    thumb: macawThumb,
    talking: "Clear & Powerful",
    lifespan: "50–70 Yrs",
    temperament: "Majestic & Bold",
    description: "Magnificent, deeply loyal companion parrots with striking plumage and impressive intelligence.",
  },
  {
    id: "green-cheek",
    name: "Green Cheek Conure",
    shortName: "Green Cheek",
    species: "Pyrrhura molinae",
    price: "₹10,500",
    originalPrice: "₹13,000",
    discount: "Save 19%",
    image: greenCrop,
    thumb: greenThumb,
    talking: "Soft Chirper",
    lifespan: "15–20 Yrs",
    temperament: "Playful & Quiet",
    description: "Quiet, charming pocket companions that thrive in city homes while showering families with warmth.",
  },
  {
    id: "pineapple-conure",
    name: "Pineapple Conure",
    shortName: "Pineapple",
    species: "Pyrrhura m. hypoxantha",
    price: "₹12,000",
    originalPrice: "₹15,000",
    discount: "Save 20%",
    image: pineCrop,
    thumb: pineThumb,
    talking: "Gentle Words",
    lifespan: "20–25 Yrs",
    temperament: "Curious & Cuddly",
    description: "Rare golden-yellow mutation with lime wings, playful acrobatic antics, and sweet disposition.",
  },
];

const QUICK_HUBS = [
  { icon: "🦜", title: "6 Companion Breeds", link: "/birds" },
  { icon: "🏡", title: "Spacious Habitats", link: "/accessories?category=Cages" },
  { icon: "🌾", title: "Certified Organic Diets", link: "/accessories?category=Food" },
  { icon: "🎾", title: "Enrichment Toys", link: "/accessories?category=Toys" },
  { icon: "🎯", title: "60s Match Quiz", link: "/#quiz" },
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
        background: "#F8FAFC",
        color: "#0F172A",
        width: "100%",
        paddingTop: "clamp(20px, 3vh, 36px)",
        paddingBottom: "clamp(24px, 3.5vh, 44px)",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          padding: "0 clamp(20px, 4.5vw, 84px)",
        }}
      >
        {/* ── 2-Column Responsive Split ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: "clamp(28px, 5vw, 72px)",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* ══════════════════════════════════════════
              LEFT COLUMN: Confident Editorial Copy
             ══════════════════════════════════════════ */}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
            {/* Pill Label */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#ECFDF5",
                border: "1px solid #BBF7D0",
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                color: "#15803D",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                width: "fit-content",
                marginBottom: 16,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
              <span>Ethical Aviary &amp; Certified Breeders</span>
            </div>

            {/* Master Headline */}
            <h1
              style={{
                fontSize: "clamp(32px, 4.2vw, 56px)",
                fontWeight: 900,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "#0F172A",
                margin: "0 0 16px 0",
              }}
            >
              Companion birds, <br />
              <span style={{ color: "#16A34A" }}>raised with care</span> &amp; devotion.
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(15px, 1.2vw, 17px)",
                lineHeight: 1.6,
                color: "#475569",
                margin: "0 0 24px 0",
                maxWidth: 580,
              }}
            >
              Connect directly with licensed avian breeders in India. Hand-tamed conures,
              macaws, and cockatiels with verified DNA health certification, veterinary screening,
              and climate-controlled safe doorstep delivery.
            </p>

            {/* Dual CTA Button Group */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 28,
              }}
            >
              <Link
                to="/birds"
                className="t-hover-lift t-btn-press"
                style={{
                  background: "#16A34A",
                  color: "#FFFFFF",
                  padding: "13px 28px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                  transition: "background 0.2s, transform 0.2s",
                }}
              >
                <span>Explore Available Birds</span>
                <span style={{ fontSize: 16 }}>→</span>
              </Link>

              <a
                href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                  `Hi FeatherTown! I'd like to consult on adopting a ${activeBird.name} (${activeBird.price}). Could you please share live photos and aviary details?`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="t-hover-lift t-btn-press"
                style={{
                  background: "#FFFFFF",
                  color: "#0F172A",
                  border: "1.5px solid #CBD5E1",
                  padding: "12px 24px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "border-color 0.2s, transform 0.2s",
                }}
              >
                <span style={{ fontSize: 15 }}>💬</span>
                <span>Consult Specialist</span>
              </a>
            </div>

            {/* 3 Trust Strip Proof Points */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px, 3vw, 32px)",
                flexWrap: "wrap",
                paddingTop: 18,
                borderTop: "1px solid #E2E8F0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🛡️</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  DNA &amp; Vet Certified
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🚚</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  Climate-Safe Transit
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>⭐</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                  4.9/5 Lifetime Care
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN: Compact Elevated Showcase Card
             ══════════════════════════════════════════ */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {/* The Restrained, Proportional Card */}
            <div
              className="t-hover-lift"
              style={{
                width: "100%",
                maxWidth: 480,
                background: "#FFFFFF",
                borderRadius: 22,
                overflow: "hidden",
                border: "1px solid #E2E8F0",
                boxShadow: "0 12px 36px -4px rgba(15, 23, 42, 0.08), 0 2px 8px -2px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* STAGE: Compact 16:10 Photo Viewport */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  maxHeight: 270,
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
                    transition: "opacity 0.25s ease, transform 0.3s ease",
                  }}
                />

                {/* Status Pill */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    background: "rgba(255, 255, 255, 0.96)",
                    color: "#15803D",
                    border: "1px solid #BBF7D0",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
                  <span>Available at Aviary</span>
                </div>

                {/* Discount Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "#EA580C",
                    color: "#FFFFFF",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    boxShadow: "0 2px 6px rgba(234, 88, 12, 0.3)",
                  }}
                >
                  {activeBird.discount}
                </div>
              </div>

              {/* CARD BODY: Compact, Clean, Structured */}
              <div style={{ padding: "16px 20px 18px" }}>
                {/* Name & Price Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: 19,
                        fontWeight: 800,
                        color: "#0F172A",
                        letterSpacing: "-0.015em",
                        margin: 0,
                      }}
                    >
                      {activeBird.name}
                    </h3>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#15803D",
                        fontWeight: 600,
                        fontStyle: "italic",
                        marginTop: 2,
                      }}
                    >
                      {activeBird.species}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 21,
                        fontWeight: 900,
                        color: "#16A34A",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {activeBird.price}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#94A3B8",
                        fontWeight: 600,
                        textDecoration: "line-through",
                      }}
                    >
                      {activeBird.originalPrice}
                    </div>
                  </div>
                </div>

                {/* 1-Line Description */}
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#64748B",
                    lineHeight: 1.5,
                    margin: "6px 0 12px 0",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {activeBird.description}
                </p>

                {/* 3 Spec Chips */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: "8px 12px",
                    marginBottom: 14,
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                      Mimicry
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                      {activeBird.talking}
                    </div>
                  </div>
                  <div style={{ borderLeft: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                      Lifespan
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                      {activeBird.lifespan}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                      Nature
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                      {activeBird.temperament}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 10 }}>
                  <a
                    href={`https://wa.me/${waNum}?text=${encodeURIComponent(
                      `Hi FeatherTown! I'm interested in adopting a ${activeBird.name} (${activeBird.price}). Is this bird available at your aviary?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="t-btn-press"
                    style={{
                      background: "#16A34A",
                      color: "#FFFFFF",
                      textAlign: "center",
                      padding: "9px 14px",
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
                    }}
                  >
                    <span>Adopt on WhatsApp</span>
                    <span>💬</span>
                  </a>

                  <Link
                    to="/birds"
                    className="t-btn-press"
                    style={{
                      background: "#F8FAFC",
                      color: "#0F172A",
                      border: "1px solid #CBD5E1",
                      textAlign: "center",
                      padding: "9px 12px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <span>View All</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Species Selector Bar: Compact & Integrated */}
            <div
              style={{
                marginTop: 14,
                width: "100%",
                maxWidth: 480,
                background: "#FFFFFF",
                borderRadius: 16,
                padding: "9px 12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
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

              {/* 6 Thumbnails */}
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
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
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
                          fontSize: 9,
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

        {/* ── Sleek Full-Width Category Anchor Ribbon ── */}
        <div
          style={{
            marginTop: "clamp(28px, 4vh, 44px)",
            paddingTop: 18,
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(10px, 1.8vw, 20px)",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {QUICK_HUBS.map((hub, idx) => (
            <Link
              key={idx}
              to={hub.link}
              className="t-hover-lift"
              style={{
                textDecoration: "none",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 999,
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                fontWeight: 700,
                color: "#334155",
                boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 13 }}>{hub.icon}</span>
              <span>{hub.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
