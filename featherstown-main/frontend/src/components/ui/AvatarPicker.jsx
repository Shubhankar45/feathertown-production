import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { BIRD_AVATARS, PARROT_CATEGORIES } from "../../config/birdAvatars";

export default function AvatarPicker({
  selected,
  onSelect,
  compact = false,
  showCategoryTabs = true,
  title = "",
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hovered, setHovered] = useState(null);

  const currentSelection = selected || BIRD_AVATARS[0].path;

  const filteredAvatars = useMemo(() => {
    if (compact || activeCategory === "all") return BIRD_AVATARS;
    return BIRD_AVATARS.filter((a) => a.category === activeCategory);
  }, [activeCategory, compact]);

  return (
    <div style={{ width: "100%" }}>
      {/* Optional Title */}
      {title && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "var(--ink, #0F172A)" }}>
            {title}
          </label>
        </div>
      )}

      {/* Pill Capsule Category Selector */}
      {!compact && showCategoryTabs && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              padding: "4px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              maxWidth: "100%",
              overflowX: "auto",
              boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.05)",
            }}
          >
            {PARROT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: isActive ? "#1B3B22" : "transparent",
                    color: isActive ? "#FFFFFF" : "#736B5E",
                    border: "none",
                    padding: "7px 16px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: isActive ? 700 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of Avatars (4 columns) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact
            ? "repeat(auto-fill, minmax(46px, 1fr))"
            : "repeat(4, 1fr)",
          gap: compact ? 10 : 20,
          maxHeight: compact ? 140 : 380,
          overflowY: "auto",
          padding: "4px 8px 12px",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {filteredAvatars.map((avatar) => {
          const isSelected =
            currentSelection === avatar.path ||
            currentSelection === avatar.id ||
            (currentSelection.includes(avatar.id) && currentSelection.endsWith(".svg"));
          const isHovered = hovered === avatar.id;

          const avatarSize = compact ? 42 : 72;

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.path)}
              onMouseEnter={() => setHovered(avatar.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: "transparent",
                border: "none",
                padding: compact ? 2 : 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                position: "relative",
                transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: isHovered ? "scale(1.1)" : isSelected ? "scale(1.04)" : "scale(1)",
                outline: "none",
              }}
              title={`${avatar.name} (${avatar.tagline})`}
            >
              {/* Circular Avatar Container */}
              <div
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: isSelected
                    ? "0 0 0 3px #1B3B22, 0 6px 16px rgba(27, 59, 34, 0.3)"
                    : isHovered
                    ? "0 6px 18px rgba(15, 23, 42, 0.12)"
                    : "0 2px 6px rgba(15, 23, 42, 0.06)",
                  transition: "box-shadow 0.18s ease",
                  background: "#FAF8F5",
                  border: "1px solid #E2DDD3",
                }}
              >
                <img
                  src={avatar.path}
                  alt={avatar.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              {/* Name label (in full mode) */}
              {!compact && (
                <div style={{ textAlign: "center", maxWidth: 84 }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? "#1B3B22" : "#736B5E",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {avatar.name}
                  </div>
                </div>
              )}

              {/* Selected Checkmark Badge */}
              {isSelected && (
                <span
                  style={{
                    position: "absolute",
                    top: compact ? -2 : 2,
                    right: compact ? -2 : 8,
                    background: "#1B3B22",
                    color: "#FFFFFF",
                    width: compact ? 16 : 20,
                    height: compact ? 16 : 20,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: compact ? 10 : 12,
                    fontWeight: 900,
                    border: "2px solid #FFFFFF",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                >
                  <Check size={compact ? 10 : 12} strokeWidth={2.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
