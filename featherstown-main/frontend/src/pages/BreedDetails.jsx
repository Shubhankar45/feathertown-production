import { useParams, Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useBirds } from "../context/BirdsContext";
import { useSettings } from "../context/SettingsContext";
import CompatibilityBadge from "../components/CompatibilityBadge";
import SEOHead from "../components/SEOHead";
import { calcCompatibility } from "../utils/recommendation";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS — Dark Minimal FeatherTown Theme
   Matching reference aesthetic (#0B0F14, emerald #10B981)
══════════════════════════════════════════════════════════ */
const T = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  forest: "#16A34A",
  leaf: "#16A34A",
  leafLight: "#ECFDF5",
  leafHover: "#15803D",
  amber: "#EA580C",
  amberLight: "#FFEDD5",
  dark: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  shadowSm: "0 2px 10px rgba(15, 23, 42, 0.04)",
  shadowMd: "0 12px 28px rgba(15, 23, 42, 0.08)",
};

/* ══════════════════════════════════════════════════════════
   STAT RING — circular progress
══════════════════════════════════════════════════════════ */
function StatRing({ value, label, icon, color = T.leaf }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#E2E8F0" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r} fill="none" stroke={color}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.16,1,.3,1)" }}
        />
        <text
          x="36" y="36" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 13, fontWeight: 800, fill: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif" }}
        >
          {value}%
        </text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 0.8, textTransform: "uppercase" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CARE ITEM
══════════════════════════════════════════════════════════ */
function CareRow({ text, idx }) {
  const rawIcon = text.match(/^(\u2705|\u26a0\ufe0f|\ud83e\uddf4|\ud83c\udf3f|\ud83c\udfe0|\ud83e\udde0)/)?.[0] ?? "🌿";
  const clean = text.replace(/^(\u2705|\u26a0\ufe0f|\ud83e\uddf4|\ud83c\udf3f|\ud83c\udfe0|\ud83e\udde0)\s*/, "");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 16px",
        background: idx % 2 === 0 ? "#F8FAFC" : "#FFFFFF",
        borderRadius: 12,
        marginBottom: 8,
        border: "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          flexShrink: 0,
          background: "#F1F5F9",
          border: "1px solid #CBD5E1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
        }}
      >
        {rawIcon}
      </div>
      <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, paddingTop: 4 }}>
        {clean}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TRAINING STEP
══════════════════════════════════════════════════════════ */
function TrainingStep({ text, idx, color = T.leaf }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "12px 14px",
        background: "#F8FAFC",
        borderRadius: 12,
        marginBottom: 8,
        border: "1px solid #E2E8F0",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          flexShrink: 0,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          color: "#FFFFFF",
        }}
      >
        {idx + 1}
      </div>
      <span style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.6, paddingTop: 2 }}>
        {text}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PDF GENERATOR HELPERS
══════════════════════════════════════════════════════════ */
function safe(str) {
  if (str == null) return "";
  return String(str).replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}
function cleanBullet(str) {
  return safe(str).replace(/^[^a-zA-Z0-9(["']+/, "").trim();
}
async function loadJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("jsPDF CDN failed"));
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

async function generateParrotPDF(parrot, helpline = "+91 95567 47518") {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const PW = 210, PH = 297, ML = 15, MR = 15, CW = PW - ML - MR, BOT = PH - 16;
  const G = { fill: [20, 83, 45], dark: [20, 83, 45], light: [220, 252, 231], border: [134, 239, 172] };
  const A = { fill: [234, 88, 12], bg: [255, 247, 237], border: [253, 186, 116] };
  const N = { dark: [15, 23, 42], body: [51, 65, 85], muted: [100, 116, 139], light: [148, 163, 184], bgCard: [248, 250, 252], border: [226, 232, 240], white: [255, 255, 255] };
  let y = 0, page = 1;
  const tc = (...rgb) => doc.setTextColor(...rgb);
  const fc = (...rgb) => doc.setFillColor(...rgb);
  const dc = (...rgb) => doc.setDrawColor(...rgb);
  const lw = (w) => doc.setLineWidth(w);
  const ft = (weight, size) => { doc.setFont("helvetica", weight); doc.setFontSize(size); };

  function stampFooter() {
    ft("normal", 7.5);
    tc(...N.muted);
    doc.text(`FeatherTown \u2014 Certified Ethical Aviary \u2022 Helpline: ${helpline}`, ML, BOT);
    doc.text(`Page ${page}`, PW - MR, BOT, { align: "right" });
    dc(...N.border);
    lw(0.2);
    doc.line(ML, BOT - 2.5, PW - MR, BOT - 2.5);
  }

  function newPage() {
    stampFooter();
    doc.addPage();
    page++;
    y = 16;
  }

  function guard(need) {
    if (y + need > BOT - 5) newPage();
  }

  fc(...G.fill);
  doc.rect(0, 0, PW, 40, "F");
  ft("bold", 9);
  tc(180, 240, 200);
  doc.text("FEATHERTOWN AVIARY", ML, 10);
  ft("normal", 7);
  tc(160, 230, 185);
  doc.text("Certified Hand-Tamed Companion Bird Guide", ML, 15);
  ft("bold", 22);
  tc(...N.white);
  doc.text(safe(parrot.name), ML, 28);
  ft("bold", 14);
  tc(253, 186, 116);
  doc.text(safe(parrot.price || ""), PW - MR, 22, { align: "right" });
  ft("normal", 7);
  tc(255, 255, 255);
  doc.text("ESTIMATED PRICE", PW - MR, 28, { align: "right" });

  y = 48;
  ft("bold", 12);
  tc(...G.dark);
  doc.text("1. Species Information", ML, y);
  y += 8;

  ft("normal", 9);
  tc(...N.body);
  const desc = doc.splitTextToSize(safe(parrot.description || "Certified healthy companion parrot."), CW);
  doc.text(desc, ML, y);
  y += desc.length * 5 + 6;

  const pairs = [
    ["Category", parrot.category || "Parrot"],
    ["Size", parrot.size || "Medium"],
    ["Lifespan", parrot.lifespan || "20-30 years"],
    ["Speech Ability", parrot.talkingAbility || "Good"],
    ["Origin", parrot.origin || "Tropical"],
    ["Diet", parrot.diet || "Seeds, Pellets & Fresh Fruits"],
  ];

  pairs.forEach(([l, v]) => {
    guard(8);
    fc(...N.bgCard);
    dc(...N.border);
    lw(0.15);
    doc.rect(ML, y, CW, 7, "FD");
    ft("bold", 8);
    tc(...N.muted);
    doc.text(l.toUpperCase(), ML + 3, y + 5);
    ft("normal", 8.5);
    tc(...N.dark);
    doc.text(safe(v), ML + 50, y + 5);
    y += 7;
  });

  y += 8;
  guard(25);
  ft("bold", 12);
  tc(...G.dark);
  doc.text("2. Daily Care & Feeding", ML, y);
  y += 8;

  const careItems = parrot.care || [
    "Offer high-quality fortified pellets and fresh organic fruit daily.",
    "Provide safe wooden perches and interactive foraging toys.",
    "Ensure at least 2 hours of daily out-of-cage human socialization.",
    "Clean drinking water must be replenished daily.",
  ];

  careItems.forEach((c) => {
    guard(7);
    fc(...G.fill);
    doc.circle(ML + 3, y - 1, 1, "F");
    ft("normal", 8.5);
    tc(...N.body);
    const lines = doc.splitTextToSize(cleanBullet(c), CW - 10);
    doc.text(lines, ML + 8, y);
    y += lines.length * 4.8 + 2;
  });

  stampFooter();
  doc.save(`${safe(parrot.name).toLowerCase().replace(/\s+/g, "-")}-care-guide.pdf`);
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function BreedDetails() {
  const { id } = useParams();
  const { birds, getBirdByIdOrSlug } = useBirds();
  const { settings } = useSettings();
  const waNumber = (settings?.whatsapp || "919556747518").replace(/\D/g, "");
  const phoneDisplay = settings?.phone || "+91 95567 47518";
  const parrot = getBirdByIdOrSlug(id) || birds.find(
    (p) =>
      String(p.id) === String(id) ||
      p.slug === id ||
      p.name?.toLowerCase().replace(/\s+/g, "-") === id
  );

  const [tab, setTab] = useState("overview");
  const [activeImg, setActiveImg] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!parrot) return;
    try {
      const prev = JSON.parse(localStorage.getItem("ft_recently_viewed") || "[]");
      const next = [parrot.id, ...prev.filter((i) => i !== parrot.id)].slice(0, 6);
      localStorage.setItem("ft_recently_viewed", JSON.stringify(next));
    } catch {}
  }, [parrot]);

  const recentIds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ft_recently_viewed") || "[]").filter(
        (i) => i !== parrot?.id
      );
    } catch {
      return [];
    }
  }, [parrot]);

  const savedAnswers = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("ft_quiz_answers") || "null");
    } catch {
      return null;
    }
  }, []);

  if (!parrot) {
    return (
      <div
        style={{
          minHeight: "70vh",
          background: T.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "Outfit, system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 48 }}>🦜</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: T.forest }}>Breed Not Found</h2>
        <p style={{ color: T.muted }}>We couldn't find the bird species you're looking for.</p>
        <Link
          to="/breeds"
          style={{
            background: "#16A34A",
            color: "#FFFFFF",
            padding: "10px 24px",
            borderRadius: 999,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Browse All Breeds
        </Link>
      </div>
    );
  }

  const score = savedAnswers ? calcCompatibility(savedAnswers, parrot) : null;
  const whatsappLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi FeatherTown! I'm interested in adopting/purchasing the ${parrot.name}. Please share current availability, DNA sexing status, and adoption pricing.`
  )}`;
  const galleryImages = parrot.gallery?.length ? parrot.gallery : [parrot.image, parrot.image, parrot.image];
  const ownerTips = parrot.ownerTips ?? [
    "Needs at least 2 hours of daily human interaction",
    "Feed fortified pellets, seeds, and fresh chopped vegetables",
    "Provide non-toxic java wood and foraging toys",
    "Maintain a calm sleeping routine with 10-12 hours of quiet darkness",
  ];

  const stats = [
    { label: "Intelligence", icon: "🧠", value: parrot.intelligence ?? 75, color: "#10B981" },
    { label: "Low Noise", icon: "🔊", value: parrot.noiseLevelScore ?? 65, color: "#F59E0B" },
    { label: "Friendliness", icon: "🤝", value: parrot.friendliness ?? 85, color: "#34D399" },
    { label: "Care Ease", icon: "🧹", value: parrot.maintenanceScore ?? 60, color: "#06B6D4" },
  ];

  async function handleDownloadPDF() {
    if (exporting) return;
    setExporting(true);
    try {
      await generateParrotPDF(parrot, phoneDisplay);
    } catch (err) {
      console.error(err);
      alert("Could not generate PDF. Please try again or message us on WhatsApp.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div style={{ background: T.bg, color: T.dark, fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title={`${parrot.name} Care Guide & Availability | FeatherTown India`}
        description={`${parrot.name} price, lifespan, noise level, and dietary requirements. Certified vet-inspected captive bred companion parrots with doorstep delivery.`}
        image={parrot.image}
      />

      {/* BREADCRUMB STRIP */}
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "24px clamp(16px, 4vw, 64px) 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.muted }}>
          <Link to="/" style={{ color: T.leaf, textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>/</span>
          <Link to="/breeds" style={{ color: T.leaf, textDecoration: "none", fontWeight: 600 }}>Parrot Breeds</Link>
          <span>/</span>
          <span style={{ color: T.dark, fontWeight: 700 }}>{parrot.name}</span>
        </div>
      </div>

      {/* MAIN TOP SECTION: GALLERY + KEY INFO CARD */}
      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "12px clamp(16px, 4vw, 64px) 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(24px, 4vw, 36px)",
            alignItems: "start",
          }}
        >
          {/* LEFT: GALLERY */}
          <div>
            {/* Main Image */}
            <div
              style={{
                borderRadius: 24,
                overflow: "hidden",
                position: "relative",
                background: "#F1F5F9",
                boxShadow: T.shadowMd,
                border: `1px solid ${T.border}`,
                height: "clamp(260px, 45vw, 420px)",
              }}
            >
              <img
                src={galleryImages[activeImg]}
                alt={parrot.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.4s ease",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  background: "rgba(15, 23, 42, 0.75)",
                  backdropFilter: "blur(6px)",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Photo {activeImg + 1} of {galleryImages.length}
              </div>
            </div>

            {/* Thumbnail Row */}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    flex: 1,
                    height: 72,
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: activeImg === i ? `2px solid #059669` : `1.5px solid ${T.border}`,
                    padding: 0,
                    background: "#F1F5F9",
                    opacity: activeImg === i ? 1 : 0.65,
                    transition: "all 0.2s ease",
                  }}
                >
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>

            {/* Trust Assurance Strip */}
            <div
              style={{
                marginTop: 20,
                background: "#FFFFFF",
                borderRadius: 18,
                padding: "16px 20px",
                border: `1px solid ${T.border}`,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 12,
                boxShadow: T.shadowSm,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#059669" }}>
                <span>🩺</span>
                <strong>Avian Vet Inspected</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#059669" }}>
                <span>📜</span>
                <strong>Legal Non-Native Bird</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#059669" }}>
                <span>🚚</span>
                <strong>Doorstep Live Bird Escort</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#059669" }}>
                <span>📞</span>
                <strong>Lifetime Diet Guidance</strong>
              </div>
            </div>
          </div>

          {/* RIGHT: SPECIES OVERVIEW & ACTIONS */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadowSm,
            }}
          >
            {/* Category & Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span
                style={{
                  background: "#ECFDF5",
                  color: "#059669",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  border: "1px solid #A7F3D0",
                }}
              >
                {parrot.category}
              </span>

              <span
                style={{
                  background: "#ECFDF5",
                  color: "#059669",
                  border: "1px solid #A7F3D0",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                {parrot.status || "Available"}
              </span>
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 38px)",
                fontWeight: 800,
                color: T.dark,
                lineHeight: 1.15,
                marginBottom: 8,
              }}
            >
              {parrot.name}
            </h1>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#059669" }}>
                {parrot.price}
              </span>
              <span style={{ fontSize: 12, color: T.muted }}>*Hand-tamed starting price</span>
            </div>

            {/* Description */}
            <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.75, marginBottom: 20 }}>
              {parrot.description}
            </p>

            {/* Trait Pills */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
                background: "#F8FAFC",
                borderRadius: 16,
                padding: "14px 16px",
                marginBottom: 24,
                border: "1px solid #E2E8F0",
              }}
            >
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Size</span>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{parrot.size || "Medium"}</p>
              </div>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Lifespan</span>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{parrot.lifespan || "20-30 years"}</p>
              </div>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Talking Ability</span>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{parrot.talkingAbility || "Moderate"}</p>
              </div>
              <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.muted, textTransform: "uppercase" }}>Experience Level</span>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{parrot.difficulty || "Beginner Friendly"}</p>
              </div>
            </div>

            {/* Compatibility Quiz Result if Available */}
            {savedAnswers && (
              <div
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: 16,
                  padding: "14px 16px",
                  marginBottom: 22,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#065F46", textTransform: "uppercase", marginBottom: 6 }}>
                  Your Lifestyle Match
                </div>
                <CompatibilityBadge parrot={parrot} answers={savedAnswers} />
                <p style={{ fontSize: 12.5, color: "#065F46", fontWeight: 600, marginTop: 6 }}>
                  {score >= 80 ? "Perfect Match for your home! 🏆" : score >= 60 ? "Great choice with routine bonding 👍" : "Requires experienced avian handling ⚠️"}
                </p>
              </div>
            )}

            {/* Primary Action: WhatsApp Consultation */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "16px 24px",
                borderRadius: 999,
                background: "#16A34A",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(16, 185, 129, 0.25)",
                marginBottom: 12,
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <span style={{ fontSize: 20 }}>💬</span>
              Inquire via WhatsApp ({phoneDisplay})
            </a>

            {/* Secondary Action: Download Care PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={exporting}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 999,
                border: "1.5px solid #CBD5E1",
                background: "#F8FAFC",
                color: "#0F172A",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: exporting ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.borderColor = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F8FAFC";
                e.currentTarget.style.borderColor = "#CBD5E1";
              }}
            >
              <span>📄</span>
              {exporting ? "Generating PDF Care Guide..." : "Download Official Care Guide (PDF)"}
            </button>
          </div>
        </div>

        {/* SECTION: TRAIT CIRCLES */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: "36px 32px",
            border: `1px solid ${T.border}`,
            boxShadow: T.shadowSm,
            marginTop: 36,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>Breed Temperament & Attributes</h3>
            <p style={{ fontSize: 13, color: T.muted }}>Based on avian behavioral data and home socialization.</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 64px)", flexWrap: "wrap" }}>
            {stats.map((s) => (
              <StatRing key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* SECTION: TABS (OVERVIEW / TRAINING / CARE) */}
        <div style={{ marginTop: 36 }}>
          {/* Tab Navigation */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { id: "overview", label: "🌿 Overview & Diet" },
              { id: "training", label: "🎓 Training Steps" },
              { id: "care", label: "🍃 Daily Care Checklist" },
            ].map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="ft-btn-hover"
                  style={{
                    padding: "10px 22px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: active ? "1.5px solid #059669" : "1.5px solid #E2E8F0",
                    background: active ? "#16A34A" : "#FFFFFF",
                    color: active ? "#FFFFFF" : "#64748B",
                    boxShadow: active ? "0 4px 14px rgba(16,185,129,0.25)" : "none",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panel */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "36px 32px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadowSm,
            }}
          >
            {tab === "overview" && (
              <div className="ft-tab-content">
                <h3 style={{ fontSize: 20, fontWeight: 800, color: T.dark, marginBottom: 16 }}>
                  Species Specifics for {parrot.name}
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 16,
                  }}
                >
                  {[
                    { icon: "📍", label: "Origin", value: parrot.origin || "South America / Australia" },
                    { icon: "🥗", label: "Diet", value: parrot.diet || "Fortified pellets, fresh organic fruits & nuts" },
                    { icon: "🧠", label: "Behavior", value: parrot.behavior || "Curious, affectionate, bonds strongly" },
                    { icon: "🔊", label: "Noise Level", value: parrot.noiseLevel || "Moderate vocal calls at dawn/dusk" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#F8FAFC",
                        borderRadius: 16,
                        padding: "18px 20px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: "uppercase" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginTop: 4 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "training" && (
              <div className="ft-tab-content">
                <h3 style={{ fontSize: 20, fontWeight: 800, color: T.dark, marginBottom: 16 }}>
                  Step-by-Step Bonding & Step-Up Training
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#059669", marginBottom: 12 }}>
                      🌱 Foundation Training
                    </h4>
                    {(parrot.training?.basic ?? [
                      "Allow 3-4 days in a quiet room to acclimate to new home environment.",
                      "Hand-feed sweet sunflower treats through cage bars to build trust.",
                      "Teach the classic 'Step-Up' command onto your index finger gently.",
                      "Reward calm perching with positive verbal praise.",
                    ]).map((item, i) => (
                      <TrainingStep key={i} text={item} idx={i} color="#059669" />
                    ))}
                  </div>

                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#D97706", marginBottom: 12 }}>
                      🚀 Advanced Tricks & Speech
                    </h4>
                    {(parrot.training?.advanced ?? [
                      "Introduce repeat words in an upbeat, clear tone during morning meals.",
                      "Teach recall flight: call bird across the living room to perch on your arm.",
                      "Introduce puzzle forage toys requiring lid lifting for sunflower seeds.",
                    ]).map((item, i) => (
                      <TrainingStep key={i} text={item} idx={i} color="#D97706" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "care" && (
              <div className="ft-tab-content">
                <h3 style={{ fontSize: 20, fontWeight: 800, color: T.dark, marginBottom: 16 }}>
                  Daily Health & Habitat Requirements
                </h3>
                <div>
                  {(parrot.care ?? [
                    "Clean fresh drinking water must be changed twice daily.",
                    "70% formulated pellet base + 30% fresh veggies (kale, carrots, apple slices). Avoid avocado, chocolate, or caffeine.",
                    "Cage minimum size: at least 2x the wingspan with varied diameter perches to exercise feet.",
                    "Provide at least 10 hours of uninterrupted, quiet darkness for restful sleep.",
                    "Spray mist lightly with lukewarm water 3 times a week for healthy feather sheen.",
                  ]).map((item, i) => (
                    <CareRow key={i} text={item} idx={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: SIMILAR BIRDS */}
        <div style={{ marginTop: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Other Companion Birds You Might Love</h3>
              <p style={{ fontSize: 13, color: T.muted }}>Hand-tamed and available with nationwide delivery.</p>
            </div>
            <Link
              to="/birds"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#059669",
                textDecoration: "none",
              }}
            >
              View Aviary →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {birds
              .filter((p) => p.id !== parrot.id)
              .slice(0, 3)
              .map((b) => (
                <Link
                  key={b.id}
                  to={`/breed/${b.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 20,
                      overflow: "hidden",
                      border: `1px solid ${T.border}`,
                      boxShadow: T.shadowSm,
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = T.shadowMd;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = T.shadowSm;
                    }}
                  >
                    <div style={{ height: 160, overflow: "hidden", background: "#F1F5F9" }}>
                      <img
                        src={b.image}
                        alt={b.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ padding: "16px 18px" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#059669",
                          background: "#ECFDF5",
                          padding: "2px 8px",
                          borderRadius: 999,
                          textTransform: "uppercase",
                          border: "1px solid #A7F3D0",
                        }}
                      >
                        {b.category}
                      </span>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 6, marginBottom: 4 }}>
                        {b.name}
                      </h4>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>{b.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
