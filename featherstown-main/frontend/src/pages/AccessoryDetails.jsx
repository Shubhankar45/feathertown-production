import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useCart } from "../context/CartContext";
import { toast } from "../components/ui/Toast";
import { trackAddToCart } from "../utils/analytics";

export default function AccessoryDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/accessories/${idOrSlug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && (data._id || data.name)) {
          setItem(data);
        } else {
          setItem(null);
        }
      })
      .catch(() => {
        setItem(null);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#059669", fontWeight: 700 }}>Loading product details…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ minHeight: "60vh", background: "#F8FAFC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <p style={{ color: "#64748B" }}>We couldn't find that accessory.</p>
        <Link to="/accessories" style={{ background: "#16A34A", color: "#fff", padding: "10px 22px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}>
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
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
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
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 32px rgba(15, 23, 42, 0.06)",
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
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
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
                      border: activeImg === i ? "2px solid #059669" : "2px solid #E2E8F0",
                      background: "#F8FAFC",
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
                color: "#059669",
                textTransform: "uppercase",
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
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
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.2,
                marginBottom: 14,
              }}
            >
              {item.name}
            </h1>

            {/* Price Box */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: "#16A34A" }}>
                ₹{item.price?.toLocaleString("en-IN")}
              </span>
              {item.mrp && item.mrp > item.price && (
                <span style={{ fontSize: 16, color: "#94A3B8", textDecoration: "line-through" }}>
                  ₹{item.mrp?.toLocaleString("en-IN")}
                </span>
              )}
              {item.mrp && item.mrp > item.price && (
                <span style={{ fontSize: 12, fontWeight: 800, color: "#C2410C", background: "#FFEDD5", border: "1px solid #FED7AA", padding: "3px 10px", borderRadius: 999 }}>
                  Save {Math.round(((item.mrp - item.price) / item.mrp) * 100)}%
                </span>
              )}
            </div>

            {/* Stock Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#16A34A" }}>
                {item.stock > 0 ? `In Stock (Ships in 24 Hours)` : "Out of Stock"}
              </span>
            </div>

            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.75, marginBottom: 24 }}>
              {item.description}
            </p>

            {/* Quantity Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "#475569" }}>Quantity:</span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: 12,
                  background: "#F8FAFC",
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
                    color: "#0F172A",
                  }}
                >
                  −
                </button>
                <span style={{ width: 36, textAlign: "center", fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{qty}</span>
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
                    color: "#0F172A",
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
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(22, 163, 74, 0.3)",
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
                  background: "#EA580C",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px 24px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(249, 115, 22, 0.35)",
                  minWidth: "min(100%, 160px)",
                }}
              >
                Buy Now ⚡
              </button>
            </div>

            {/* Trust Assurances */}
            <div
              style={{
                borderTop: "1px solid #E2E8F0",
                paddingTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 12,
                fontSize: 12.5,
                color: "#64748B",
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
