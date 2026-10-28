import { useState, useMemo } from "react";
import { useBirds } from "../context/BirdsContext";
import { useSettings } from "../context/SettingsContext";
import BreedCard from "../components/BreedCard";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";

export default function Breeds() {
  const { birds } = useBirds();
  const { settings } = useSettings();
  const [selectedCat, setSelectedCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const categories = useMemo(() => {
    const configured = settings?.birdCategories || [];
    const fromBirds = birds.map((p) => p.category).filter(Boolean);
    const combined = Array.from(new Set([...configured, ...fromBirds]));
    return ["All", ...combined];
  }, [settings?.birdCategories, birds]);

  const filtered = useMemo(() => {
    let list = birds.filter((p) => {
      const matchCat = selectedCat === "All" || p.category === selectedCat;
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });

    if (sortBy === "price-low") {
      list.sort((a, b) => {
        const pa = parseInt((a.price || "0").replace(/\D/g, "")) || 0;
        const pb = parseInt((b.price || "0").replace(/\D/g, "")) || 0;
        return pa - pb;
      });
    } else if (sortBy === "price-high") {
      list.sort((a, b) => {
        const pa = parseInt((a.price || "0").replace(/\D/g, "")) || 0;
        const pb = parseInt((b.price || "0").replace(/\D/g, "")) || 0;
        return pb - pa;
      });
    }

    return list;
  }, [selectedCat, searchQuery, sortBy]);

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Parrot Breeds & Species Guide | FeatherTown India"
        description="Explore comprehensive parrot breed profiles — Cockatiels, Sun Conures, African Greys, and Macaws. Compare care difficulty, lifespans, speech capabilities, and adoption costs."
      />

      <PageBanner
        eyebrow="Species Encyclopedia"
        title="Parrot"
        accent="Breeds & Care"
        desc="Explore hand-tamed, captive-bred companion birds — from playful Conures to intelligent Greys with certified health guarantees."
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        {/* FILTERS & SEARCH BAR */}
        <div
          className="rv"
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: "clamp(16px, 3vw, 20px) clamp(16px, 3vw, 24px)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            marginBottom: 36,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: "min(100%, 260px)" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748B",
                  fontSize: 16,
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Search breeds by name, size, or personality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  borderRadius: 999,
                  border: "1.5px solid #CBD5E1",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "Outfit, sans-serif",
                  background: "#F8FAFC",
                  color: "#0F172A",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#10B981";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#CBD5E1";
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748B",
                    fontSize: 14,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "1.5px solid #CBD5E1",
                  background: "#F8FAFC",
                  color: "#0F172A",
                  fontSize: 13,
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              borderTop: "1px solid #F1F5F9",
              paddingTop: 14,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Category:
            </span>
            {categories.map((c) => {
              const active = selectedCat === c;
              const count = c === "All" ? birds.length : birds.filter((p) => p.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCat(c)}
                  className="ft-btn-hover"
                  style={{
                    padding: "7px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: active ? "1.5px solid #059669" : "1.5px solid #E2E8F0",
                    background: active ? "linear-gradient(135deg, #10B981, #059669)" : "#F8FAFC",
                    color: active ? "#FFFFFF" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {c}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: active ? "rgba(255,255,255,0.25)" : "#E2E8F0",
                      color: active ? "#FFFFFF" : "#64748B",
                      padding: "1px 7px",
                      borderRadius: 999,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: "#64748B" }}>
            Showing <strong style={{ color: "#0F172A" }}>{filtered.length}</strong> breed profiles
          </p>
          {(selectedCat !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCat("All");
                setSearchQuery("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#059669",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Reset Filters ✕
            </button>
          )}
        </div>

        {/* BREED GRID */}
        {filtered.length === 0 ? (
          <div
            className="rv-scale"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div className="ft-animate-float" style={{ fontSize: 44, marginBottom: 12 }}>🦜</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
              No breeds found matching your criteria
            </h3>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 20 }}>
              Try searching for "Conure", "Cockatiel", or reset the active filters.
            </p>
            <button
              onClick={() => {
                setSelectedCat("All");
                setSearchQuery("");
              }}
              className="ft-btn-hover"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 24px",
                borderRadius: 999,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Show All Breeds
            </button>
          </div>
        ) : (
          <div
            className="rv-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "clamp(16px, 2.5vw, 24px)",
            }}
          >
            {filtered.map((parrot) => (
              <BreedCard key={parrot.id} parrot={parrot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}