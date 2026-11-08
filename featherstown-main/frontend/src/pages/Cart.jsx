import { Link, useNavigate } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useCart } from "../context/CartContext";

const FREE_SHIPPING_THRESHOLD = 999;

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const freeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountNeeded = FREE_SHIPPING_THRESHOLD - subtotal;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Shopping Cart | FeatherTown"
        description="Review your bird cages, organic food, and companion accessories before proceeding to secure checkout."
      />

      <PageBanner eyebrow="Your Order" title="Shopping" accent="Cart" desc="Review your items and proceed to secure checkout." />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        {items.length === 0 ? (
          <div
            className="rv-scale"
            style={{
              textAlign: "center",
              padding: "60px 24px",
              background: "#FFFFFF",
              borderRadius: 28,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div className="ft-animate-float" style={{ fontSize: 52, marginBottom: 14 }}>🛍️</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>
              Your cart is empty
            </h3>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
              Explore our best-selling cages, organic conure blends, and natural java perches!
            </p>
            <Link
              to="/accessories"
              className="ft-btn-hover"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                padding: "13px 28px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14.5,
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
              }}
            >
              Browse Accessories →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 24, alignItems: "start" }}>
            {/* Left: Items List */}
            <div>
              {/* Free Shipping Meter */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 18,
                  padding: "16px 20px",
                  border: "1px solid #E2E8F0",
                  marginBottom: 16,
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  <span style={{ color: "#0F172A" }}>
                    {freeShippingUnlocked ? "🎉 You've unlocked FREE Shipping!" : `🚚 Add ₹${amountNeeded} more for FREE shipping`}
                  </span>
                  <span style={{ color: "#16A34A", fontWeight: 800 }}>{progressPercent}%</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #16A34A, #F97316)",
                      borderRadius: 99,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="rv-stagger" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="ft-card-lift"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#FFFFFF",
                      borderRadius: 20,
                      padding: "clamp(12px, 2.5vw, 16px)",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                      flexWrap: "wrap",
                      transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.2s, box-shadow 0.28s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E2E8F0";
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        overflow: "hidden",
                        background: "#F1F5F9",
                        flexShrink: 0,
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <img
                        src={item.image || item.images?.[0] || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200&auto=format&fit=crop&q=80"}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={item.slug ? `/accessories/${item.slug}` : "/accessories"}
                        style={{
                          textDecoration: "none",
                          fontWeight: 700,
                          color: "#0F172A",
                          fontSize: 14.5,
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.name}
                      </Link>
                      <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                        ₹{item.price?.toLocaleString("en-IN")} each
                      </div>
                    </div>

                    {/* Stepper */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1.5px solid #CBD5E1",
                        borderRadius: 10,
                        background: "#F8FAFC",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: 30, height: 30, border: "none", background: "none", fontWeight: 700, cursor: "pointer", color: "#0F172A" }}
                      >
                        −
                      </button>
                      <span style={{ width: 28, textAlign: "center", fontWeight: 700, fontSize: 13.5, color: "#0F172A" }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: 30, height: 30, border: "none", background: "none", fontWeight: 700, cursor: "pointer", color: "#0F172A" }}
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div style={{ width: 80, textAlign: "right", fontWeight: 800, fontSize: 15, color: "#059669", flexShrink: 0 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#64748B",
                        cursor: "pointer",
                        padding: 6,
                        fontSize: 16,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
                      title="Remove Item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Summary Box */}
            <div
              className="rv"
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                padding: "26px 24px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 18 }}>
                Order Summary
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748B", marginBottom: 12 }}>
                <span>Items Subtotal</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748B", marginBottom: 16 }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 700, color: freeShippingUnlocked ? "#059669" : "#0F172A" }}>
                  {freeShippingUnlocked ? "FREE" : "₹99"}
                </span>
              </div>

              <div
                style={{
                  borderTop: "1px solid #F1F5F9",
                  paddingTop: 16,
                  marginBottom: 22,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#0F172A",
                }}
              >
                <span>Total Amount</span>
                <span style={{ color: "#16A34A" }}>
                  ₹{(subtotal + (freeShippingUnlocked ? 0 : 99)).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="t-btn-press"
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #16A34A, #15803D)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                }}
              >
                Proceed to Checkout →
              </button>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Link to="/accessories" style={{ fontSize: 13, color: "#64748B", textDecoration: "underline" }}>
                  Continue Shopping
                </Link>
              </div>

              <div style={{ borderTop: "1px solid #F1F5F9", marginTop: 20, paddingTop: 16, fontSize: 12, color: "#64748B", textAlign: "center" }}>
                🔒 256-bit encrypted Razorpay SSL Checkout
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
