import { Link, useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const isCod = params.get("cod") === "1";

  return (
    <div style={{ background: "#F7F5F0", color: "#152B17", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Order Confirmed! | FeatherTown"
        description="Your order with FeatherTown has been confirmed! We are getting your bird accessories packed and ready."
      />

      <PageBanner eyebrow="Order Placed" title="Order" accent="Confirmed!" desc="We have received your order and started preparing your items." />

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "0 clamp(16px, 3.5vw, 24px) 100px", textAlign: "center" }}>
        <div
          className="rv-scale ft-card-lift"
          style={{
            background: "#FFFFFF",
            borderRadius: 28,
            padding: "clamp(24px, 4vw, 44px) clamp(16px, 4vw, 32px)",
            border: "1px solid #E2DDD3",
            boxShadow: "0 12px 32px rgba(27, 59, 34, 0.06)",
          }}
        >
          <div
            className="ft-animate-float"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#E7EFE8",
              border: "1px solid #B8D4BA",
              color: "#1B3B22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 32,
              boxShadow: "0 4px 16px rgba(27, 59, 34, 0.12)",
            }}
          >
            🎉
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#152B17", marginBottom: 12 }}>
            Thank You for Your Order!
          </h2>

          <p style={{ color: "#736B5E", lineHeight: 1.7, fontSize: 14.5, marginBottom: 20 }}>
            {isCod
              ? "Your Cash on Delivery order has been registered. Please keep the exact amount ready when our delivery partner arrives."
              : "Your payment was verified successfully. We are now packing your cages and accessories with care."}
          </p>

          {orderId && (
            <div
              style={{
                display: "inline-block",
                background: "#FAF8F5",
                border: "1px solid #E2DDD3",
                borderRadius: 12,
                padding: "8px 18px",
                fontSize: 13,
                color: "#736B5E",
                marginBottom: 28,
              }}
            >
              Order Reference: <strong style={{ color: "#152B17", letterSpacing: 0.5 }}>{orderId}</strong>
            </div>
          )}

          <div
            style={{
              background: "#E7EFE8",
              border: "1px solid #B8D4BA",
              borderRadius: 16,
              padding: "16px",
              marginBottom: 32,
              textAlign: "left",
              fontSize: 13,
              color: "#1B3B22",
            }}
          >
            <div>🚚 <strong style={{ color: "#152B17" }}>Estimated Delivery:</strong> 3 – 5 Business Days across India.</div>
            <div style={{ marginTop: 4, color: "#1B3B22" }}>📲 Tracking details will be shared on your registered phone number.</div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/my-orders"
              className="ft-btn-hover t-btn-press"
              style={{
                background: "#D9381E",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(217, 56, 30, 0.3)",
              }}
            >
              View My Orders
            </Link>

            <Link
              to="/accessories"
              className="ft-btn-hover t-btn-press"
              style={{
                background: "#FAF8F5",
                color: "#1B3B22",
                border: "1px solid #E2DDD3",
                padding: "12px 22px",
                borderRadius: 999,
                fontWeight: 700,
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
