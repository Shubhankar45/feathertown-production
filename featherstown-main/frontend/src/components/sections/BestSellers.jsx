import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingBag } from "lucide-react";
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
            badgeColor: item.badge?.toLowerCase().includes("top") ? "#D9381E" : "#1B3B22",
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
    toast.success(`${product.name} added to your cart!`);
  };

  return (
    <section
      style={{
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
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
              background: "#E7EFE8",
              border: "1px solid #B8D4BA",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#1B3B22",
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
              color: "#152B17",
              lineHeight: 1.15,
              margin: "0 0 6px 0",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#1B3B22" }}>Best</span> Sellers &amp; Essentials
          </h2>
          <p style={{ fontSize: 14, color: "#736B5E", margin: 0 }}>
            Most-loved nutrition, spacious habitats, and enrichment chosen by 5,000+ satisfied bird parents.
          </p>
        </div>

        <Link
          to="/accessories"
          className="t-btn-press"
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#1B3B22",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 20px",
            borderRadius: 999,
            background: "#E7EFE8",
            border: "1px solid #B8D4BA",
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
                border: "1px solid #E2DDD3",
                overflow: "hidden",
                height: 330,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="ft-shimmer" style={{ height: 170, width: "100%", background: "#FAF8F5" }} />
              <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="ft-shimmer" style={{ height: 16, width: "75%", borderRadius: 6, background: "#FAF8F5" }} />
                <div className="ft-shimmer" style={{ height: 14, width: "40%", borderRadius: 6, background: "#FAF8F5" }} />
                <div className="ft-shimmer" style={{ height: 38, width: "100%", borderRadius: 12, marginTop: "auto", background: "#FAF8F5" }} />
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
              spotlightColor="rgba(27, 59, 34, 0.08)"
              borderColor="#E2DDD3"
              className="t-hover-lift group flex flex-col h-full"
              style={{
                borderRadius: 24,
                boxShadow: "0 4px 18px rgba(21, 43, 23, 0.04)",
                background: "#FFFFFF",
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
                    background: prod.badgeColor || "#D9381E",
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
                  background: "#FAF8F5",
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
                  <Star size={13} fill="#1B3B22" strokeWidth={0} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#152B17" }}>{prod.rating}</span>
                  <span style={{ fontSize: 11, color: "#736B5E" }}>({prod.reviewsCount})</span>
                </div>

                {/* Title */}
                <Link
                  to={`/accessories/${prod.id || prod._id}`}
                  style={{
                    textDecoration: "none",
                    color: "#152B17",
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    marginBottom: 10,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {prod.name}
                </Link>

                {/* Price */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto", marginBottom: 14 }}>
                  <span style={{ fontSize: 17, fontWeight: 900, color: "#1B3B22" }}>
                    ₹{Number(prod.price).toLocaleString()}
                  </span>
                  {prod.originalPrice && (
                    <span style={{ fontSize: 12, color: "#736B5E", textDecoration: "line-through" }}>
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
                    borderRadius: 999,
                    border: "none",
                    background: "#D9381E",
                    color: "#FFFFFF",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 3px 10px rgba(217, 56, 30, 0.25)",
                  }}
                >
                  <ShoppingBag size={14} strokeWidth={2.2} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </section>
  );
}
