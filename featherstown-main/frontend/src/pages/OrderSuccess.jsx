import { Link, useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const isCod = params.get("cod") === "1";

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Order Confirmed! | FeatherTown"
        description="Your order with FeatherTown has been confirmed! We are getting your bird accessories packed and ready."
      />

      <PageBanner eyebrow="Order Placed" title="Order" accent="Confirmed!" desc="We have received your order and started preparing your items." />

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "0 clamp(16px, 3.5vw, 24px) 100px", textAlign: "center" }}>
        <div
          className="rv-scale"
          style={{
            background: "#FFFFFF",
            borderRadius: 28,
            padding: "clamp(24px, 4vw, 44px) clamp(16px, 4vw, 32px)",
            border: "1px solid #E2E8F0",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            className="ft-animate-float ft-animate-pulse-glow"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32,
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.15)",
            }}
          >
            🎉
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
            Thank You for Your Order!
          </h2>

          <p style={{ color: "#64748B", lineHeight: 1.7, fontSize: 14.5, marginBottom: 20 }}>
            {isCod
              ? "Your Cash on Delivery order has been registered. Please keep the exact amount ready when our delivery partner arrives."
              : "Your payment was verified successfully. We are now packing your cages and accessories with care."}
          </p>

          {orderId && (
            <div
              style={{
                display: "inline-block",
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                borderRadius: 12,
                padding: "8px 18px",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 28,
              }}
            >
              Order Reference: <strong style={{ color: "#0F172A", letterSpacing: 0.5 }}>{orderId}</strong>
            </div>
          )}

          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              borderRadius: 16,
              padding: "16px",
              marginBottom: 32,
              textAlign: "left",
              fontSize: 13,
              color: "#065F46",
            }}
          >
            <div>🚚 <strong style={{ color: "#047857" }}>Estimated Delivery:</strong> 3 – 5 Business Days across India.</div>
            <div style={{ marginTop: 4, color: "#059669" }}>📲 Tracking details will be shared on your registered phone number.</div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/my-orders"
              className="ft-btn-hover"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
              }}
            >
              View My Orders
            </Link>

            <Link
              to="/accessories"
              className="ft-btn-hover"
              style={{
                background: "#F1F5F9",
                color: "#475569",
                border: "1px solid #CBD5E1",
                padding: "12px 22px",
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
