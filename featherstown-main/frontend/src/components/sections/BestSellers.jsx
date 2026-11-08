import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "../ui/Toast";
import { trackAddToCart } from "../../utils/analytics";
import SpotlightCard from "../react-bits/SpotlightCard";

export default function BestSellers() {
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accessories?limit=8")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const enriched = data.map((item, idx) => ({
            ...item,
            id: item._id,
            badge: item.badge || (item.isBestSeller ? "Bestseller" : idx === 0 ? "Popular" : idx === 1 ? "Top Rated" : "In Stock"),
            badgeColor: item.badge?.toLowerCase().includes("top") ? "#EA580C" : idx % 2 === 0 ? "#16A34A" : "#F97316",
            rating: item.rating || 4.9,
            reviewsCount: item.reviewsCount || (250 + idx * 85),
            image: item.images?.[0] || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=80",
          }));
          setItems(enriched.slice(0, 6));
        }
      })
      .catch((err) => console.error("Failed to load best sellers:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    trackAddToCart(product, 1);
    toast.success(`${product.name} added to your cart! 🛍️`);
  };

  return (
    <section
      style={{
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 36,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#EA580C",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <span>PET PARENT FAVORITES</span>
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.6vw, 40px)",
              fontWeight: 900,
              color: "#0F172A",
              lineHeight: 1.15,
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            <span className="text-emerald-600">Best</span> Sellers &amp; Essentials
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
            Most-loved nutrition, spacious habitats, and enrichment chosen by 5,000+ satisfied bird parents.
          </p>
        </div>

        <Link
          to="/accessories"
          className="t-btn-press"
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#16A34A",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
            borderRadius: 999,
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.08)",
          }}
        >
          View all essentials ›
        </Link>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(160px, 44vw, 250px), 1fr))",
            gap: "clamp(14px, 2vw, 22px)",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                height: 330,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="ft-shimmer" style={{ height: 170, width: "100%", background: "#F1F5F9" }} />
              <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="ft-shimmer" style={{ height: 16, width: "75%", borderRadius: 6, background: "#F1F5F9" }} />
                <div className="ft-shimmer" style={{ height: 14, width: "40%", borderRadius: 6, background: "#F1F5F9" }} />
                <div className="ft-shimmer" style={{ height: 38, width: "100%", borderRadius: 12, marginTop: "auto", background: "#F1F5F9" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(160px, 44vw, 250px), 1fr))",
            gap: "clamp(14px, 2vw, 22px)",
          }}
        >
          {items.map((prod) => (
            <SpotlightCard
              key={prod.id || prod._id}
              spotlightColor="rgba(249, 115, 22, 0.12)"
              borderColor="#E2E8F0"
              className="t-hover-lift group flex flex-col h-full"
              style={{
                borderRadius: 24,
                boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* Badge Overlay */}
              {prod.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 20,
                    background: prod.badgeColor || "#16A34A",
                    color: "#FFFFFF",
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    padding: "3px 10px",
                    borderRadius: 999,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                  }}
                >
                  {prod.badge}
                </span>
              )}

              {/* Product Image */}
              <Link
                to={`/accessories/${prod.id || prod._id}`}
                className="t-img-zoom block relative"
                style={{
                  height: 180,
                  background: "#F8FAFC",
                  overflow: "hidden",
                  textDecoration: "none",
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </Link>

              {/* Product Info */}
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flex: 1, zIndex: 10 }}>
                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <span style={{ color: "#F59E0B", fontSize: 13 }}>★</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#0F172A" }}>{prod.rating}</span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>({prod.reviewsCount})</span>
                </div>

                {/* Title */}
                <Link
                  to={`/accessories/${prod.id || prod._id}`}
                  style={{
                    textDecoration: "none",
                    color: "#0F172A",
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    marginBottom: 10,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  className="group-hover:text-emerald-700 transition-colors"
                >
                  {prod.name}
                </Link>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto", marginBottom: 14 }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color: "#16A34A" }}>
                    ₹{Number(prod.price).toLocaleString()}
                  </span>
                  {prod.originalPrice && (
                    <span style={{ fontSize: 12, color: "#94A3B8", textDecoration: "line-through" }}>
                      ₹{Number(prod.originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(prod)}
                  className="t-btn-press"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 14,
                    border: "none",
                    background: "#16A34A",
                    color: "#FFFFFF",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.22)",
                  }}
                >
                  <span>🛍️</span> Add to Cart
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </section>
  );
}
