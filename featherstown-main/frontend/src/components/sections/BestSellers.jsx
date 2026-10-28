/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Best Sellers (Dark Minimal)
   /components/sections/BestSellers.jsx
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "../ui/Toast";
import { trackAddToCart } from "../../utils/analytics";

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
            badgeColor: item.badge?.toLowerCase().includes("top") ? "#E11D48" : idx % 2 === 0 ? "#EA580C" : "#10B981",
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
        padding: "clamp(48px, 6vw, 80px) clamp(16px, 4vw, 64px)",
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
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.15,
              margin: "0 0 6px 0",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "#059669" }}>Best</span> Sellers
          </h2>
          <p style={{ fontSize: 14.5, color: "#64748B", margin: 0 }}>
            Most-loved essentials chosen by 5,000+ satisfied bird parents across India.
          </p>
        </div>

        <Link
          to="/accessories"
          className="ft-btn-hover"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#059669",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 18px",
            borderRadius: 999,
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
          }}
        >
          View all accessories ›
        </Link>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px, 44vw, 240px), 1fr))",
            gap: "clamp(12px, 2vw, 20px)",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: 22,
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                height: 320,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="ft-shimmer" style={{ height: 160, width: "100%", background: "#F1F5F9" }} />
              <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="ft-shimmer" style={{ height: 16, width: "75%", borderRadius: 6, background: "#F1F5F9" }} />
                <div className="ft-shimmer" style={{ height: 14, width: "40%", borderRadius: 6, background: "#F1F5F9" }} />
                <div className="ft-shimmer" style={{ height: 36, width: "100%", borderRadius: 10, marginTop: "auto", background: "#F1F5F9" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px, 44vw, 240px), 1fr))",
            gap: "clamp(12px, 2vw, 20px)",
          }}
        >
          {items.map((prod) => (
            <div
              key={prod.id || prod._id}
              className="ft-card-lift"
              style={{
                background: "#FFFFFF",
                borderRadius: 22,
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                position: "relative",
                transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.25s, box-shadow 0.28s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#059669";
                e.currentTarget.style.boxShadow = "0 10px 24px rgba(5, 150, 105, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.04)";
              }}
            >
              {/* Badge Overlay */}
              {prod.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 2,
                    background: prod.badgeColor || "#059669",
                    color: "#FFFFFF",
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    padding: "3px 10px",
                    borderRadius: 999,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  {prod.badge}
                </span>
              )}

              {/* Product Image */}
              <Link
                to={prod.slug ? `/accessories/${prod.slug}` : "/accessories"}
                style={{
                  display: "block",
                  aspectRatio: "1/1",
                  background: "#F8FAFC",
                  overflow: "hidden",
                  position: "relative",
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
              </Link>

              {/* Details */}
              <div style={{ padding: "clamp(14px, 2.5vw, 18px)", display: "flex", flexDirection: "column", flex: 1 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#059669",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                  }}
                >
                  {prod.category}
                </span>

                <Link
                  to={prod.slug ? `/accessories/${prod.slug}` : "/accessories"}
                  style={{
                    fontSize: "clamp(13.5px, 2vw, 15px)",
                    fontWeight: 700,
                    color: "#0F172A",
                    textDecoration: "none",
                    lineHeight: 1.35,
                    marginBottom: 8,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {prod.name}
                </Link>

                {/* Price & Rating */}
                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "clamp(15px, 2.2vw, 18px)", fontWeight: 900, color: "#059669" }}>
                      ₹{prod.price}
                    </span>
                    {prod.mrp && prod.mrp > prod.price && (
                      <span style={{ fontSize: 12, color: "#94A3B8", textDecoration: "line-through" }}>
                        ₹{prod.mrp}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#F59E0B", marginBottom: 12 }}>
                    <span>★★★★★</span>
                    <span style={{ color: "#64748B" }}>({prod.reviewsCount || 120})</span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(prod)}
                    style={{
                      width: "100%",
                      background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "9px 12px",
                      borderRadius: 999,
                      fontSize: "clamp(11.5px, 1.7vw, 12.5px)",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      boxShadow: "0 3px 12px rgba(22, 163, 74, 0.25)",
                      transition: "transform 0.18s, box-shadow 0.18s, background 0.18s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #F97316 0%, #EA580C 100%)";
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(234, 88, 12, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = "linear-gradient(135deg, #16A34A 0%, #15803D 100%)";
                      e.currentTarget.style.boxShadow = "0 3px 12px rgba(22, 163, 74, 0.25)";
                    }}
                  >
                    <span>🛒</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
