/* ═══════════════════════════════════════════════════
   BIRDS SHOWCASE — search, filter, grid, lightbox,
   compare-tray. Styled with modern TinyTails aesthetic.
═══════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, ZoomIn } from "lucide-react";
import { SearchIco, WAIco, XIcon } from "../ui/Icons";
import CompatibilityBadge from "../CompatibilityBadge";
import useSavedQuizAnswers from "../../hooks/useSavedQuizAnswers";
import { useSettings } from "../../context/SettingsContext";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function BirdsShowcase({ parrots, standalone = false }) {
  const { settings } = useSettings();
  const waNum = (settings?.whatsapp || "919556747518").replace(/\D/g, "");
  const WA = (n) =>
    `https://wa.me/${waNum}?text=${encodeURIComponent(
      `Hi FeatherTown! I'm interested in the ${n}. Could you share current availability and adoption details?`
    )}`;

  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [lightbox, setLB] = useState(null);
  const [compared, setCompared] = useState([]);
  const savedAnswers = useSavedQuizAnswers();

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") setLB(null);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const cats = [
    "All",
    ...new Set([...(settings?.birdCategories || []), ...parrots.map((p) => p.category)].filter(Boolean)),
  ];
  const cntFor = (c) => (c === "All" ? parrots.length : parrots.filter((p) => p.category === c).length);

  const filtered = parrots
    .filter((p) => cat === "All" || p.category === cat)
    .filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(query.toLowerCase())
    );

  const toggleCompare = (p) =>
    setCompared((prev) => {
      if (prev.find((x) => x.id === p.id)) return prev.filter((x) => x.id !== p.id);
      if (prev.length >= 3) return prev;
      return [...prev, p];
    });

  return (
    <>
      <section id="birds" style={{ position: "relative" }}>
        {!standalone && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#1B3B22",
                textTransform: "uppercase",
                background: "#E7EFE8",
                border: "1px solid #B8D4BA",
                padding: "4px 14px",
                borderRadius: 999,
                display: "inline-block",
                marginBottom: 10,
              }}
            >
              Our Aviary Collection
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 34px)",
                fontWeight: 800,
                color: "#152B17",
                lineHeight: 1.2,
              }}
            >
              Popular Companion Parrots
            </h2>
            <p style={{ color: "#736B5E", fontSize: 13.5, marginTop: 6 }}>
              Select up to 3 birds to compare traits or chat with our aviary specialists.
            </p>
          </div>
        )}

        {/* SEARCH & FILTERS WRAPPER */}
        <div
          className="rv"
          style={{
            background: "#FFFFFF",
            borderRadius: 22,
            padding: "16px 20px",
            border: "1px solid #E2DDD3",
            boxShadow: "0 2px 12px rgba(21, 43, 23, 0.04)",
            marginBottom: 32,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", width: "100%" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#736B5E",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SearchIco />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companion birds by name or breed..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: 999,
                border: "1.5px solid #E2DDD3",
                fontSize: 14,
                fontFamily: "Outfit, system-ui, sans-serif",
                background: "#FAF8F5",
                color: "#152B17",
                outline: "none",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#1B3B22";
                e.target.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E2DDD3";
                e.target.style.background = "#FAF8F5";
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#736B5E",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {cats.map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    cursor: "pointer",
                    border: active ? "1.5px solid #1B3B22" : "1.5px solid #E2DDD3",
                    background: active ? "#1B3B22" : "#FAF8F5",
                    color: active ? "#FFFFFF" : "#152B17",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                  }}
                >
                  {c}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: active ? "rgba(255,255,255,0.25)" : "#E2DDD3",
                      color: active ? "#FFFFFF" : "#736B5E",
                      padding: "1px 6px",
                      borderRadius: 999,
                    }}
                  >
                    {cntFor(c)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "56px 20px",
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <Search size={36} color="#736B5E" strokeWidth={1.8} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>No birds found for "{query}"</p>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
              Try searching by family (e.g., Conure, Cockatiel) or clear search filters.
            </p>
            <button
              style={{
                marginTop: 16,
                background: "#1B3B22",
                color: "#FFFFFF",
                border: "none",
                padding: "8px 20px",
                borderRadius: 999,
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => {
                setQuery("");
                setCat("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* BIRD CARDS GRID */}
        <div
          className="rv-stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 270px), 1fr))",
            gap: 24,
          }}
        >
          {filtered.map((p) => {
            const isCmp = compared.find((x) => x.id === p.id);
            const isAvailable = p.status === "available" || p.status === "Available";

            return (
              <SpotlightCard
                key={p.id}
                spotlightColor="rgba(27, 59, 34, 0.08)"
                borderColor="#E2DDD3"
                className="t-hover-lift flex flex-col h-full"
                style={{
                  borderRadius: 24,
                  boxShadow: "0 4px 18px rgba(21, 43, 23, 0.04)",
                  background: "#FFFFFF",
                }}
              >
                {/* Photo container */}
                <div style={{ position: "relative", height: 220, overflow: "hidden", background: "#FAF8F5" }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      cursor: "zoom-in",
                      transition: "transform 0.4s ease",
                    }}
                    onClick={() => setLB({ img: p.image, name: p.name })}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />

                  {/* Compare checkbox */}
                  <label
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      zIndex: 3,
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(6px)",
                      border: "1px solid #E2DDD3",
                      borderRadius: 8,
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#152B17",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!isCmp}
                      onChange={() => toggleCompare(p)}
                      style={{ accentColor: "#1B3B22", cursor: "pointer" }}
                    />
                    Compare
                  </label>

                  {/* Status pill */}
                  <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                    <span
                      style={{
                        background: isAvailable ? "#E7EFE8" : "#FDECE8",
                        color: isAvailable ? "#1B3B22" : "#D9381E",
                        border: `1px solid ${isAvailable ? "#B8D4BA" : "#F4B8AC"}`,
                        borderRadius: 999,
                        padding: "3px 10px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: isAvailable ? "#1B3B22" : "#D9381E",
                        }}
                      />
                      {isAvailable ? "Available" : "Sold Out"}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      zIndex: 2,
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(6px)",
                      color: "#1B3B22",
                      border: "1px solid #B8D4BA",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 999,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    {p.category}
                  </div>

                  {/* Zoom indicator */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      zIndex: 2,
                      background: "rgba(255, 255, 255, 0.9)",
                      color: "#736B5E",
                      fontSize: 10,
                      padding: "3px 8px",
                      borderRadius: 6,
                      backdropFilter: "blur(4px)",
                      border: "1px solid #E2DDD3",
                      pointerEvents: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ZoomIn size={11} strokeWidth={2.2} />
                    <span>Zoom</span>
                  </div>
                </div>

                {/* Card Content */}
                <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <h3
                      style={{
                        fontFamily: "Outfit, system-ui, sans-serif",
                        fontWeight: 800,
                        fontSize: 18,
                        color: "#152B17",
                        lineHeight: 1.25,
                      }}
                    >
                      {p.name}
                    </h3>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 13,
                        color: "#1B3B22",
                        background: "#E7EFE8",
                        border: "1px solid #B8D4BA",
                        padding: "3px 10px",
                        borderRadius: 8,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {p.price}
                    </span>
                  </div>

                  <p
                    style={{
                      color: "#736B5E",
                      fontSize: 13,
                      lineHeight: 1.6,
                      marginBottom: savedAnswers ? 10 : 16,
                      flex: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {p.description}
                  </p>

                  {savedAnswers && (
                    <div style={{ marginBottom: 14 }}>
                      <CompatibilityBadge parrot={p} answers={savedAnswers} variant="bar" />
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #E2DDD3",
                      paddingTop: 14,
                      gap: 8,
                    }}
                  >
                    <Link
                      to={`/breed/${p.id}`}
                      style={{
                        color: "#1B3B22",
                        fontWeight: 800,
                        fontSize: 13,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      Care Details →
                    </Link>

                    <a
                      href={WA(p.name)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: "#1B3B22",
                        color: "#FFFFFF",
                        padding: "8px 14px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        boxShadow: "0 2px 8px rgba(27, 59, 34, 0.2)",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <WAIco /> Inquire
                    </a>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox && (
        <div
          onClick={() => setLB(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 15, 20, 0.92)",
            backdropFilter: "blur(8px)",
            zIndex: 9000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <button
            onClick={() => setLB(null)}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#FFFFFF",
              width: 44,
              height: 44,
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} strokeWidth={2.2} />
          </button>
          <img
            src={lightbox.img}
            alt={lightbox.name}
            style={{
              maxWidth: "92vw",
              maxHeight: "86vh",
              borderRadius: 20,
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
              objectFit: "contain",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* STICKY COMPARE TRAY */}
      {compared.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "clamp(12px, 3vw, 20px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FFFFFF",
            border: "1.5px solid #1B3B22",
            borderRadius: "clamp(16px, 4vw, 999px)",
            padding: "10px clamp(12px, 3vw, 20px)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 14px 40px rgba(21, 43, 23, 0.15)",
            maxWidth: "calc(100vw - 24px)",
            width: "max-content",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 800, color: "#1B3B22", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Compare ({compared.length}/3)
          </span>

          {compared.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#E7EFE8",
                border: "1px solid #B8D4BA",
                borderRadius: 999,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 700,
                color: "#1B3B22",
              }}
            >
              <span>{p.name}</span>
              <button
                onClick={() => toggleCompare(p)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#1B3B22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <X size={12} strokeWidth={2.2} />
              </button>
            </div>
          ))}

          <a
            href={WA(compared.map((p) => p.name).join(" vs "))}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#1B3B22",
              color: "#FFFFFF",
              padding: "7px 16px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginLeft: "auto",
              boxShadow: "0 2px 8px rgba(27, 59, 34, 0.2)",
            }}
          >
            <WAIco /> Compare on WhatsApp
          </a>

          <button
            onClick={() => setCompared([])}
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              borderRadius: 999,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#64748B",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      )}
    </>
  );
}
