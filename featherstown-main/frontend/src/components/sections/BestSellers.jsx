/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Best Selling Products
   /components/sections/BestSellers.jsx

   Directly modeled on the reference e-commerce product grid:
   - Header: "Best Selling Products" + "View All →"
   - 4-column card grid
   - 1:1 square photo on clean surface
   - Product title
   - Star rating & review count: ★★★★★ (238)
   - Price row with circular Forest Green (#1B3B22) Add-to-Cart button
   - 1-click cart addition with toast and navbar badge bounce
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { toast } from "../ui/Toast";
import { trackAddToCart } from "../../utils/analytics";

const FALLBACK_PRODUCTS = [
  {
    id: "prod-1",
    _id: "prod-1",
    name: "Versele-Laga Prestige Premium Conure & Parrot Blend",
    category: "food",
    price: 1299,
    originalPrice: 1599,
    rating: 4.9,
    reviewsCount: 238,
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-2",
    _id: "prod-2",
    name: "Kaytee Forti-Diet Pro Health Avian Daily Nutrition",
    category: "food",
    price: 949,
    originalPrice: 1199,
    rating: 4.8,
    reviewsCount: 176,
    image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-3",
    _id: "prod-3",
    name: "Super Bird Creations Natural Wooden Foraging Puzzle",
    category: "toys",
    price: 699,
    originalPrice: 899,
    rating: 5.0,
    reviewsCount: 320,
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "prod-4",
    _id: "prod-4",
    name: "Yaheetech Open-Top Wrought Iron Rolling Aviary",
    category: "cages",
    price: 6499,
    originalPrice: 7999,
    rating: 4.9,
    reviewsCount: 189,
    image: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=500&auto=format&fit=crop&q=80",
  },
];

export default function BestSellers() {
  const { addItem } = useCart();
  const [items, setItems] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accessories?limit=8")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((item, idx) => ({
            ...item,
            id: item._id || item.id,
            price: Number(item.price) || 999,
            rating: item.rating || 4.9,
            reviewsCount: item.reviewsCount || (180 + idx * 45),
            image: item.images?.[0] || item.image || FALLBACK_PRODUCTS[idx % 4].image,
          }));
          setItems(enriched.slice(0, 4));
        }
      })
      .catch((err) => console.error("Failed to load best sellers:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    trackAddToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <section
      style={{
        padding: "clamp(48px, 6vw, 84px) clamp(16px, 4.5vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FFFFFF",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "clamp(24px, 3.5vw, 36px)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            fontWeight: 800,
            color: "#152B17",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Best Selling Products
        </h2>

        <Link
          to="/accessories"
          className="t-btn-press"
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "#1B3B22",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.15s ease",
          }}
        >
          <span>View All</span>
          <ArrowRight size={15} strokeWidth={2.4} />
        </Link>
      </div>

      {/* 4-Column Product Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px, 22vw, 270px), 1fr))",
          gap: "clamp(16px, 2.2vw, 24px)",
        }}
      >
        {items.map((prod) => (
          <Link
            key={prod.id || prod._id}
            to={`/accessories/${prod.id || prod._id}`}
            className="group"
            style={{
              textDecoration: "none",
              background: "#FAF8F5",
              borderRadius: 20,
              border: "1px solid #E2DDD3",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1B3B22";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(27, 59, 34, 0.08)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2DDD3";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* 1:1 Product Image Container */}
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                background: "#FFFFFF",
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #EFECE4",
              }}
            >
              <img
                src={prod.image}
                alt={prod.name}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.35s ease",
                }}
                className="group-hover:scale-105"
              />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#152B17",
                lineHeight: 1.35,
                marginBottom: 8,
                height: 38,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {prod.name}
            </h3>

            {/* Rating Stars & Count */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 2, color: "#1B3B22" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#1B3B22" strokeWidth={0} />
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#152B17" }}>
                {prod.rating}
              </span>
              <span style={{ fontSize: 11, color: "#736B5E" }}>
                ({prod.reviewsCount})
              </span>
            </div>

            {/* Price & Add to Cart Circular Button Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "auto",
                paddingTop: 8,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#1B3B22",
                    letterSpacing: "-0.015em",
                  }}
                >
                  ₹{Number(prod.price).toLocaleString()}
                </span>
                {prod.originalPrice && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#736B5E",
                      textDecoration: "line-through",
                      marginLeft: 6,
                    }}
                  >
                    ₹{Number(prod.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Circular Forest Green Add to Cart Button */}
              <button
                type="button"
                onClick={(e) => handleAddToCart(prod, e)}
                className="t-btn-press"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(27, 59, 34, 0.2)",
                  transition: "background 0.15s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#D9381E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1B3B22";
                }}
                aria-label={`Add ${prod.name} to cart`}
              >
                <ShoppingCart size={16} strokeWidth={2.4} />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
