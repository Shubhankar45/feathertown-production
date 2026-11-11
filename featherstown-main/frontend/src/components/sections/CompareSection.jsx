/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Side-by-Side Bird Comparison Tool
   /components/sections/CompareSection.jsx

   Restyled for clean modern e-commerce:
   - 60% Oat Milk (#FAF8F5 canvas, #FFFFFF cards, #E2DDD3 borders)
   - 30% Forest Green (#1B3B22 headers, tags, score bars)
   - 10% Tomato Red (#D9381E primary CTAs & badges)
   - 100% Lucide React icons, zero emojis
═══════════════════════════════════════════════════════════════ */
import { useState, useMemo } from "react";
import { X, Award, Compass, Check, Plus, MessageCircle, Scale } from "lucide-react";
import CompatibilityBadge from "../CompatibilityBadge";
import { calcCompatibility } from "../../utils/recommendation";
import useSavedQuizAnswers from "../../hooks/useSavedQuizAnswers";
import { useSettings } from "../../context/SettingsContext";

const SCORE_LABELS = {
  intelligence: "Intelligence",
  tamability: "Tamability",
  talkativeness: "Talkativeness",
  noise: "Low Noise",
  lifespan: "Longevity",
  beginner: "Beginner Friendly",
};

const SPEC_ROWS = [
  { key: "price", label: "Price" },
  { key: "category", label: "Size" },
  { key: "temperament", label: "Temperament" },
  { key: "noise", label: "Noise Level" },
  { key: "lifespan", label: "Lifespan" },
  { key: "difficulty", label: "Experience Needed" },
  { key: "talker", label: "Talking Ability" },
];

const CMP_COLORS = ["#1B3B22", "#D9381E", "#3A7D44"];

export default function CompareSection({ parrots = [], standalone = false }) {
  const savedAnswers = useSavedQuizAnswers();
  const { settings } = useSettings();
  const waNumber = settings?.whatsapp || "919556747518";

  const CB = useMemo(() => {
    if (!Array.isArray(parrots) || parrots.length === 0) return [];
    return parrots.map((p) => {
      const talkVal = (p.talkingAbility || "").toLowerCase();
      const diffVal = (p.difficulty || "").toLowerCase();
      const noiseVal = (p.noiseLevel || "").toLowerCase();
      const sizeVal = (p.size || "").toLowerCase();

      const intelligence =
        talkVal.includes("high") || talkVal.includes("excellent")
          ? 10
          : talkVal.includes("medium") || talkVal.includes("good")
          ? 7
          : 5;
      const tamability =
        diffVal.includes("easy")
          ? 9
          : diffVal.includes("moderate") || diffVal.includes("medium")
          ? 8
          : 6;
      const talkativeness =
        talkVal.includes("high") || talkVal.includes("excellent")
          ? 10
          : talkVal.includes("good")
          ? 6
          : 4;
      const noise = noiseVal.includes("low") ? 9 : noiseVal.includes("medium") ? 6 : 3;
      const lifespan = sizeVal.includes("large") ? 10 : sizeVal.includes("medium") ? 7 : 5;
      const beginner = diffVal.includes("easy") ? 10 : diffVal.includes("moderate") ? 7 : 4;

      return {
        id: p._id || p.id || p.slug || p.name,
        name: p.name,
        category: p.size || p.category || "Medium",
        price:
          typeof p.price === "number"
            ? `₹${p.price.toLocaleString("en-IN")}`
            : p.price || "₹5,000",
        image: p.image || p.images?.[0] || "",
        description: p.description
          ? p.description.length > 100
            ? p.description.slice(0, 100) + "..."
            : p.description
          : "Loyal, intelligent companion bird.",
        temperament: p.behavior || "Gentle & Playful",
        noise: p.noiseLevel || "Medium",
        lifespan: p.lifespan || "20-30 years",
        difficulty: p.difficulty || "Easy",
        talker: p.talkingAbility || "Good",
        scores: { intelligence, tamability, talkativeness, noise, lifespan, beginner },
      };
    });
  }, [parrots]);

  const [selected, setSel] = useState([]);
  const [pickerOpen, setPO] = useState(false);
  const [pickerTemp, setPT] = useState([]);
  const [activeCat, setAC] = useState("All");
  const [activeTab, setAT] = useState("overview");

  const cats = ["All", ...new Set(CB.map((b) => b.category).filter(Boolean))];

  const remove = (id) => setSel((p) => p.filter((b) => b.id !== id));
  const clearAll = () => {
    setSel([]);
    setAT("overview");
  };

  const openPicker = () => {
    if (selected.length >= 3) return;
    setPT(selected.map((b) => b.id));
    setPO(true);
  };

  const confirm = () => {
    const nb = [];
    pickerTemp.forEach((id) => {
      if (!selected.find((b) => b.id === id)) {
        const bird = CB.find((b) => b.id === id);
        if (bird && selected.length + nb.length < 3) nb.push(bird);
      }
    });
    setSel((p) => [...p, ...nb]);
    setPO(false);
  };

  const togglePick = (id) => {
    if (selected.find((b) => b.id === id)) return;
    setPT((p) =>
      p.includes(id)
        ? p.filter((x) => x !== id)
        : p.length + selected.length < 3
        ? [...p, id]
        : p
    );
  };

  const shareWA = () => {
    window.open(
      `https://wa.me/${waNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        "Hi! I'd like to compare: " + selected.map((b) => b.name).join(" vs ") + ". Help me choose?"
      )}`,
      "_blank"
    );
  };

  const has2 = selected.length >= 2;
  const totals = selected.map((b) => ({
    b,
    total: Object.values(b.scores).reduce((a, v) => a + v, 0),
  }));
  const winner = totals.length
    ? totals.reduce((best, cur) => (cur.total > best.total ? cur : best))
    : null;

  const tip = () => {
    const names = selected.map((b) => b.name);
    if (names.includes("African Grey"))
      return "African Greys are the top choice for a long-term intelligent companion — budget for 50+ years of care. For first-timers, a Cockatiel offers a gentler start.";
    if (names.some((n) => n.includes("Conure")))
      return "Conures are social, affectionate birds — Green Cheek Conures are the quietest and perfect for apartments. Sun Conures are more vibrant with higher energy.";
    if (selected.every((b) => b.category === "Small"))
      return "All selected birds are small breeds — wonderful for apartment living. Cockatiels are consistently the most beginner-friendly.";
    return "Each species brings a unique flock dynamic. Contact our aviary on WhatsApp for personalized match guidance.";
  };

  const pList = activeCat === "All" ? CB : CB.filter((b) => b.category === activeCat);
  const cbToParrot = (b) => ({ name: b.name, price: b.price, category: b.category });

  return (
    <section
      id="compare"
      style={{
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      {!standalone && (
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#EAF2EC",
              border: "1px solid #CCE0D0",
              padding: "4px 14px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              color: "#1B3B22",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            <Scale size={14} strokeWidth={2.4} />
            <span>Side by Side</span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.4vw, 38px)",
              fontWeight: 900,
              color: "#152B17",
              letterSpacing: "-0.025em",
              margin: "0 0 8px 0",
            }}
          >
            Compare Parrot Breeds
          </h2>
          <p style={{ color: "#736B5E", fontSize: 14.5, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            Select up to 3 companion birds and evaluate their noise level, talking ability, lifespan, and compatibility head-to-head.
          </p>
        </div>
      )}

      {/* Selected Birds Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            selected.length === 0
              ? "repeat(auto-fill, minmax(280px, 1fr))"
              : `repeat(${Math.min(selected.length + (selected.length < 3 ? 1 : 0), 3)}, 1fr)`,
          gap: 20,
          marginBottom: 24,
        }}
      >
        {selected.map((b) => (
          <div
            key={b.id}
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2DDD3",
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            }}
          >
            {/* Image */}
            <div style={{ width: "100%", height: 140, background: "#FAF8F5", position: "relative" }}>
              <img
                src={b.image}
                alt={b.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 10,
                  fontSize: 10,
                  fontWeight: 800,
                  background: "rgba(21, 43, 23, 0.75)",
                  color: "#FAF8F5",
                  padding: "3px 8px",
                  borderRadius: 999,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {b.category}
              </span>
            </div>

            {/* Info */}
            <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                <h4 style={{ fontSize: 17, fontWeight: 800, color: "#152B17", margin: 0 }}>
                  {b.name}
                </h4>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#1B3B22",
                    background: "#EAF2EC",
                    padding: "3px 8px",
                    borderRadius: 8,
                  }}
                >
                  {b.price}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: "#736B5E", lineHeight: 1.5, margin: "0 0 10px 0" }}>
                {b.description}
              </p>
              {savedAnswers && (
                <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid #EFECE4" }}>
                  <CompatibilityBadge parrot={cbToParrot(b)} answers={savedAnswers} variant="bar" />
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={() => remove(b.id)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#D9381E",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
              aria-label={`Remove ${b.name}`}
            >
              <X size={15} strokeWidth={2.4} />
            </button>
          </div>
        ))}

        {/* Empty Slot Card */}
        {selected.length < 3 && (
          <div
            onClick={openPicker}
            style={{
              background: "#FAF8F5",
              border: "2px dashed #CCE0D0",
              borderRadius: 20,
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 24,
              textAlign: "center",
              gap: 8,
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            className="hover:border-[#1B3B22] hover:bg-[#FFFFFF]"
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#EAF2EC",
                color: "#1B3B22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={22} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#1B3B22" }}>
              Add a Bird
            </span>
            <span style={{ fontSize: 12, color: "#736B5E" }}>
              {3 - selected.length} slot{3 - selected.length !== 1 ? "s" : ""} remaining
            </span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
        <button
          onClick={openPicker}
          disabled={selected.length >= 3}
          className="t-btn-press"
          style={{
            background: "#D9381E",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 999,
            padding: "10px 24px",
            fontSize: 13.5,
            fontWeight: 800,
            cursor: selected.length >= 3 ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(217, 56, 30, 0.25)",
          }}
        >
          + Add a Bird
        </button>

        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="t-btn-press"
            style={{
              background: "#FFFFFF",
              color: "#152B17",
              border: "1px solid #E2DDD3",
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <X size={14} strokeWidth={2.4} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Detailed Side-by-Side Comparison Panels */}
      {has2 && (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2DDD3",
            borderRadius: 24,
            padding: "24px clamp(16px, 3vw, 32px)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: "1px solid #E2DDD3",
              paddingBottom: 14,
              marginBottom: 20,
            }}
          >
            {["overview", "specs", "scores", "verdict"].map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setAT(tab)}
                  style={{
                    background: active ? "#1B3B22" : "#FAF8F5",
                    color: active ? "#FAF8F5" : "#152B17",
                    border: `1px solid ${active ? "#1B3B22" : "#E2DDD3"}`,
                    padding: "7px 18px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "capitalize",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${selected.length}, 1fr)`,
                gap: 16,
              }}
            >
              {selected.map((b, i) => (
                <div
                  key={b.id}
                  style={{
                    background: "#FAF8F5",
                    border: "1px solid #E2DDD3",
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: CMP_COLORS[i] }} />
                    <h5 style={{ fontSize: 16, fontWeight: 800, color: "#152B17", margin: 0 }}>
                      {b.name}
                    </h5>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(SCORE_LABELS).map(([k, label]) => (
                      <div key={k}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#736B5E", marginBottom: 4 }}>
                          <span>{label}</span>
                          <span style={{ color: "#1B3B22" }}>{b.scores[k]}/10</span>
                        </div>
                        <div style={{ height: 6, width: "100%", background: "#EAE6DE", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${b.scores[k] * 10}%`, background: CMP_COLORS[i], borderRadius: 999 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Specs Table */}
          {activeTab === "specs" && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #E2DDD3" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "#736B5E" }}>Specification</th>
                    {selected.map((b, i) => (
                      <th key={b.id} style={{ textAlign: "left", padding: "10px 14px", color: "#1B3B22", fontWeight: 800 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: CMP_COLORS[i] }} />
                          <span>{b.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_ROWS.map(({ key, label }) => (
                    <tr key={key} style={{ borderBottom: "1px solid #EFECE4" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#152B17" }}>{label}</td>
                      {selected.map((b) => (
                        <td key={b.id} style={{ padding: "12px 14px", color: "#736B5E" }}>
                          {b[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Scores */}
          {activeTab === "scores" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(SCORE_LABELS).map(([k, label]) => (
                <div key={k} style={{ background: "#FAF8F5", borderRadius: 12, padding: "12px 16px", border: "1px solid #E2DDD3" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#152B17", marginBottom: 8, textTransform: "uppercase" }}>
                    {label}
                  </div>
                  {selected.map((b, i) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#736B5E", minWidth: 120 }}>{b.name}</span>
                      <div style={{ flex: 1, height: 8, background: "#EAE6DE", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${b.scores[k] * 10}%`, background: CMP_COLORS[i], borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#1B3B22", minWidth: 28, textAlign: "right" }}>
                        {b.scores[k]}/10
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Verdict */}
          {activeTab === "verdict" && winner && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#EAF2EC",
                  border: "1px solid #CCE0D0",
                  padding: "6px 16px",
                  borderRadius: 999,
                  color: "#1B3B22",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 14,
                }}
              >
                <Award size={16} strokeWidth={2.4} />
                <span>Highest Overall Score: {winner.b.name} ({winner.total}/60)</span>
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: "#152B17", margin: "0 0 10px 0" }}>
                {winner.b.name}
              </h3>
              <p style={{ maxWidth: 600, margin: "0 auto 24px", color: "#736B5E", fontSize: 14, lineHeight: 1.6 }}>
                {tip()}
              </p>
              <button
                onClick={shareWA}
                className="t-btn-press"
                style={{
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(27, 59, 34, 0.2)",
                }}
              >
                <MessageCircle size={16} strokeWidth={2.4} />
                <span>Discuss This Match on WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bird Selection Modal */}
      {pickerOpen && (
        <div
          onClick={() => setPO(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2DDD3",
              width: "100%",
              maxWidth: 680,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "24px clamp(16px, 3vw, 28px)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#152B17", margin: "0 0 4px 0" }}>
                  Select a Bird to Compare
                </h3>
                <p style={{ fontSize: 12.5, color: "#736B5E", margin: 0 }}>
                  Choose up to 3 companion birds
                </p>
              </div>
              <button
                onClick={() => setPO(false)}
                style={{
                  background: "#FAF8F5",
                  border: "1px solid #E2DDD3",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setAC(c)}
                  style={{
                    background: activeCat === c ? "#1B3B22" : "#FAF8F5",
                    color: activeCat === c ? "#FFFFFF" : "#152B17",
                    border: `1px solid ${activeCat === c ? "#1B3B22" : "#E2DDD3"}`,
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Birds Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {pList.map((b) => {
                const inS = !!selected.find((s) => s.id === b.id);
                const inT = pickerTemp.includes(b.id);
                const isSelected = inS || inT;
                return (
                  <div
                    key={b.id}
                    onClick={() => !inS && togglePick(b.id)}
                    style={{
                      background: isSelected ? "#EAF2EC" : "#FAF8F5",
                      border: `1.5px solid ${isSelected ? "#1B3B22" : "#E2DDD3"}`,
                      borderRadius: 14,
                      padding: 10,
                      cursor: inS ? "default" : "pointer",
                      position: "relative",
                    }}
                  >
                    <img
                      src={b.image}
                      alt={b.name}
                      style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 10, marginBottom: 8 }}
                    />
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#152B17" }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#1B3B22", fontWeight: 700 }}>
                      {b.price}
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          background: "#1B3B22",
                          color: "#FFFFFF",
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setPO(false)}
                style={{
                  background: "#FAF8F5",
                  border: "1px solid #E2DDD3",
                  padding: "9px 18px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                style={{
                  background: "#D9381E",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "9px 24px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
