import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, X, ShieldCheck, Truck, Sparkles } from "lucide-react";
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
    <div style={{ background: "#F7F5F0", color: "#152B17", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
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
              border: "1px solid #E2DDD3",
              boxShadow: "0 2px 10px rgba(27, 59, 34, 0.04)",
            }}
          >
            <div className="ft-animate-float" style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><ShoppingBag size={52} color="#1B3B22" strokeWidth={1.8} /></div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#152B17", marginBottom: 8 }}>
              Your cart is empty
            </h3>
            <p style={{ color: "#736B5E", fontSize: 14, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
              Explore our best-selling cages, organic conure blends, and natural java perches!
            </p>
            <Link
              to="/accessories"
              className="ft-btn-hover"
              style={{
                background: "#1B3B22",
                color: "#FFFFFF",
                padding: "13px 28px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14.5,
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 4px 14px rgba(27, 59, 34, 0.25)",
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
                  border: "1px solid #E2DDD3",
                  marginBottom: 16,
                  boxShadow: "0 2px 8px rgba(27, 59, 34, 0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  <span style={{ color: "#152B17" }}>
                    {freeShippingUnlocked ? "You've unlocked FREE Shipping!" : `Add ₹${amountNeeded} more for FREE shipping`}
                  </span>
                  <span style={{ color: "#1B3B22", fontWeight: 800 }}>{progressPercent}%</span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#E2DDD3", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: "100%",
                      background: "#1B3B22",
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
                      border: "1px solid #E2DDD3",
                      boxShadow: "0 2px 8px rgba(27, 59, 34, 0.04)",
                      flexWrap: "wrap",
                      transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.2s, box-shadow 0.28s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#1B3B22";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#E2DDD3";
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        overflow: "hidden",
                        background: "#FAF8F5",
                        flexShrink: 0,
                        border: "1px solid #E2DDD3",
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
                          color: "#152B17",
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
                      <div style={{ fontSize: 13, color: "#736B5E", marginTop: 4 }}>
                        ₹{item.price?.toLocaleString("en-IN")} each
                      </div>
                    </div>

                    {/* Stepper */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "1.5px solid #E2DDD3",
                        borderRadius: 10,
                        background: "#FAF8F5",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: 30, height: 30, border: "none", background: "none", fontWeight: 700, cursor: "pointer", color: "#152B17" }}
                      >
                        −
                      </button>
                      <span style={{ width: 28, textAlign: "center", fontWeight: 700, fontSize: 13.5, color: "#152B17" }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: 30, height: 30, border: "none", background: "none", fontWeight: 700, cursor: "pointer", color: "#152B17" }}
                      >
                        +
                      </button>
                    </div>

                    {/* Line Total */}
                    <div style={{ width: 80, textAlign: "right", fontWeight: 800, fontSize: 15, color: "#D9381E", flexShrink: 0 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#736B5E",
                        cursor: "pointer",
                        padding: 6,
                        fontSize: 16,
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#D9381E")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#736B5E")}
                      title="Remove Item"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 4,
                      }}
                    >
                      <X size={15} strokeWidth={2.2} />
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
                border: "1px solid #E2DDD3",
                boxShadow: "0 2px 10px rgba(27, 59, 34, 0.04)",
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#152B17", marginBottom: 18 }}>
                Order Summary
              </h3>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#736B5E", marginBottom: 12 }}>
                <span>Items Subtotal</span>
                <span style={{ fontWeight: 700, color: "#152B17" }}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#736B5E", marginBottom: 16 }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 700, color: freeShippingUnlocked ? "#1B3B22" : "#152B17" }}>
                  {freeShippingUnlocked ? "FREE" : "₹99"}
                </span>
              </div>

              <div
                style={{
                  borderTop: "1px solid #E2DDD3",
                  paddingTop: 16,
                  marginBottom: 22,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#152B17",
                }}
              >
                <span>Total Amount</span>
                <span style={{ color: "#D9381E" }}>
                  ₹{(subtotal + (freeShippingUnlocked ? 0 : 99)).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="t-btn-press"
                style={{
                  width: "100%",
                  background: "#D9381E",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "14px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(217, 56, 30, 0.3)",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#B82E17")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#D9381E")}
              >
                Proceed to Checkout →
              </button>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Link to="/accessories" style={{ fontSize: 13, color: "#1B3B22", fontWeight: 700, textDecoration: "underline" }}>
                  Continue Shopping
                </Link>
              </div>

              <div style={{ borderTop: "1px solid #E2DDD3", marginTop: 20, paddingTop: 16, fontSize: 12, color: "#736B5E", textAlign: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ShieldCheck size={14} strokeWidth={2.2} /> <span>256-bit encrypted Razorpay SSL Checkout</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
