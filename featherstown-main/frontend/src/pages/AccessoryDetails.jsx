import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useCart } from "../context/CartContext";
import { toast } from "../components/ui/Toast";
import { trackAddToCart } from "../utils/analytics";

export default function AccessoryDetails() {
  const { idOrSlug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/accessories/${idOrSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setItem(data);
      })
      .catch(() => {
        setItem(null);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#1B3B22", fontWeight: 700 }}>Loading product details…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ minHeight: "60vh", background: "#F7F5F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <p style={{ color: "#736B5E" }}>We couldn't find that accessory.</p>
        <Link to="/accessories" style={{ background: "#1B3B22", color: "#fff", padding: "10px 22px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}>
          Back to shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(item, qty);
    trackAddToCart(item, qty);
    toast.success(`${qty}x ${item.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addItem(item, qty);
    trackAddToCart(item, qty);
    navigate("/checkout");
  };

  const images = item.images && item.images.length > 0 ? item.images : ["https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=700&auto=format&fit=crop&q=80"];

  return (
    <div style={{ background: "#F7F5F0", color: "#152B17", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title={`${item.name} | FeatherTown Accessories`}
        description={item.description?.slice(0, 160) || `Buy ${item.name} online at FeatherTown India.`}
      />

      <PageBanner
        eyebrow="Shop / Accessories"
        title={item.name}
        accent=""
        desc={item.category}
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        <div
          className="rv-scale"
          style={{
            background: "#FFFFFF",
            borderRadius: 28,
            padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)",
            border: "1px solid #E2DDD3",
            boxShadow: "0 10px 32px rgba(21, 43, 23, 0.05)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(24px, 4vw, 40px)",
            alignItems: "start",
          }}
        >
          {/* Left: Gallery */}
          <div>
            <div
              style={{
                aspectRatio: "1/1",
                borderRadius: 20,
                overflow: "hidden",
                background: "#FAF8F5",
                border: "1px solid #E2DDD3",
                marginBottom: 14,
              }}
            >
              <img
                src={images[activeImg] || images[0]}
                alt={item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
              />
            </div>

            {images.length > 1 && (
              <div style={{ display: "flex", gap: 10 }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      overflow: "hidden",
                      padding: 0,
                      cursor: "pointer",
                      border: activeImg === i ? "2px solid #1B3B22" : "2px solid #E2DDD3",
                      background: "#FAF8F5",
                    }}
                  >
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info, Price & Buy Buttons */}
          <div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: 1.2,
                color: "#1B3B22",
                textTransform: "uppercase",
                background: "#E7EFE8",
                border: "1px solid #B8D4BA",
                padding: "4px 12px",
                borderRadius: 99,
                display: "inline-block",
                marginBottom: 12,
              }}
            >
              {item.category}
            </span>

            <h1
              style={{
                fontSize: "clamp(22px, 3.2vw, 32px)",
                fontWeight: 800,
                color: "#152B17",
                lineHeight: 1.25,
                marginBottom: 12,
              }}
            >
              {item.name}
            </h1>

            {/* Price Box */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: "#1B3B22" }}>
                ₹{item.price?.toLocaleString("en-IN")}
              </span>
              {item.mrp && item.mrp > item.price && (
                <span style={{ fontSize: 16, color: "#736B5E", textDecoration: "line-through" }}>
                  ₹{item.mrp?.toLocaleString("en-IN")}
                </span>
              )}
              {item.mrp && item.mrp > item.price && (
                <span style={{ fontSize: 12, fontWeight: 800, color: "#D9381E", background: "#FDECE8", border: "1px solid #F4B8AC", padding: "3px 10px", borderRadius: 999 }}>
                  Save {Math.round(((item.mrp - item.price) / item.mrp) * 100)}%
                </span>
              )}
            </div>

            {/* Stock Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1B3B22" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1B3B22" }}>
                {item.stock > 0 ? `In Stock (Ships in 24 Hours)` : "Out of Stock"}
              </span>
            </div>

            <p style={{ fontSize: 14, color: "#736B5E", lineHeight: 1.75, marginBottom: 24 }}>
              {item.description}
            </p>

            {/* Quantity Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#736B5E" }}>Quantity:</span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1.5px solid #E2DDD3",
                  borderRadius: 12,
                  background: "#FAF8F5",
                }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: 36,
                    height: 36,
                    border: "none",
                    background: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "#152B17",
                  }}
                >
                  −
                </button>
                <span style={{ width: 36, textAlign: "center", fontWeight: 700, fontSize: 14, color: "#152B17" }}>{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{
                    width: 36,
                    height: 36,
                    border: "none",
                    background: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: "#152B17",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <button
                onClick={handleAdd}
                className="t-btn-press"
                style={{
                  flex: 1,
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(27, 59, 34, 0.25)",
                  minWidth: "min(100%, 160px)",
                }}
              >
                Add to Cart 🛍️
              </button>
              <button
                onClick={handleBuyNow}
                className="t-btn-press"
                style={{
                  flex: 1,
                  background: "#D9381E",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(217, 56, 30, 0.3)",
                  minWidth: "min(100%, 160px)",
                }}
              >
                Buy Now ⚡
              </button>
            </div>

            {/* Trust Assurances */}
            <div
              style={{
                borderTop: "1px solid #E2DDD3",
                paddingTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 12,
                fontSize: 12.5,
                color: "#736B5E",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🚚</span>
                <span>Free shipping over ₹999</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🔒</span>
                <span>Secure Razorpay checkout</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🌿</span>
                <span>Non-toxic avian certified</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🔄</span>
                <span>7-Day Easy Return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
