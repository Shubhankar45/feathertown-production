import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Phone,
  MessageCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { safeFormatDate, safeFormatCurrency } from "../utils/formatters";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", desc: "Received at FeatherTown Aviary" },
  { key: "confirmed", label: "Confirmed & Packing", desc: "Inspection & safe protective boxing" },
  { key: "shipped", label: "Dispatched / In Transit", desc: "With verified express courier" },
  { key: "out_for_delivery", label: "Out for Delivery", desc: "Courier partner en route to you" },
  { key: "delivered", label: "Delivered", desc: "Handed over safely" },
];

function getActiveStepIndex(orderStatus, trackingStatus) {
  const st = (trackingStatus || orderStatus || "").toLowerCase();
  if (st === "delivered") return 4;
  if (st.includes("out") || st === "out_for_delivery") return 3;
  if (st === "shipped" || st.includes("transit") || st.includes("dispatched")) return 2;
  if (st === "confirmed" || st === "packed" || st.includes("packing")) return 1;
  return 0;
}

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || searchParams.get("ref") || "";

  const [inputVal, setInputVal] = useState(queryParam);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchTracking = async (term) => {
    const clean = (term || "").trim();
    if (!clean) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail?.msg || data?.msg || "No orders found matching this reference.");
      }
      setOrders(Array.isArray(data) ? data : [data]);
      setSearched(true);
    } catch (err) {
      setOrders([]);
      setSearched(true);
      setErrorMsg(err.message || "Could not locate order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      setInputVal(queryParam);
      fetchTracking(queryParam);
    }
  }, [queryParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchParams({ q: inputVal.trim() });
    fetchTracking(inputVal);
  };

  return (
    <div style={{ background: "#FAF8F5", color: "#1B3B22", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Live Order Tracking | FeatherTown"
        description="Track your FeatherTown avian care accessories and cage orders in real time with our live logistics status system."
      />

      <PageBanner
        eyebrow="Real-Time Logistics"
        title="Track Your"
        accent="Order"
        desc="Enter your Order Reference ID or registered 10-digit mobile number to view live transit progress."
      />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px) 80px" }}>
        {/* Search Bar Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: "clamp(20px, 3.5vw, 32px)",
            border: "1px solid #E2DDD3",
            boxShadow: "0 8px 30px rgba(27, 59, 34, 0.05)",
            marginBottom: 32,
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 280px", position: "relative" }}>
              <Search
                size={18}
                color="#64748B"
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="e.g. FT-ORD-2026-0001 or 9876543210"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  borderRadius: 14,
                  border: "1.5px solid #CBD5E1",
                  fontSize: 15,
                  outline: "none",
                  background: "#FAF8F5",
                  color: "#0F172A",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 28px",
                borderRadius: 14,
                background: "#1B3B22",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 14.5,
                border: "none",
                cursor: loading ? "wait" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(27, 59, 34, 0.2)",
              }}
            >
              {loading ? "Searching..." : <><Truck size={17} /> Track Order</>}
            </button>
          </form>

          <div style={{ display: "flex", gap: 20, marginTop: 16, fontSize: 12, color: "#64748B", flexWrap: "wrap" }}>
            <span>* Works with Order IDs, Order numbers, or Customer Phone numbers.</span>
            <span>All shipments insured via verified air/surface couriers.</span>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 16,
              padding: "20px 24px",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              color: "#991B1B",
              marginBottom: 32,
            }}
          >
            <AlertCircle size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Order Not Found</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{errorMsg}</div>
              <div style={{ marginTop: 10, fontSize: 13 }}>
                Need help? <a href="https://wa.me/919556747518" target="_blank" rel="noreferrer" style={{ color: "#1B3B22", fontWeight: 700, textDecoration: "underline" }}>Chat with FeatherTown Dispatch on WhatsApp</a>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {orders.map((ord) => {
          const activeIndex = getActiveStepIndex(ord.orderStatus, ord.tracking?.currentStatus);
          const carrier = ord.tracking?.courier || "Express Surface Partner";
          const awb = ord.tracking?.trackingNumber;
          const trackUrl = ord.tracking?.trackingUrl;
          const estDelivery = ord.tracking?.estimatedDelivery || "3 – 5 Business Days";

          return (
            <div
              key={ord.id || ord.orderNumber}
              style={{
                background: "#FFFFFF",
                borderRadius: 24,
                border: "1px solid #E2DDD3",
                boxShadow: "0 10px 30px rgba(27, 59, 34, 0.05)",
                padding: "clamp(20px, 3.5vw, 32px)",
                marginBottom: 32,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 16,
                  paddingBottom: 20,
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EAF2EC", color: "#1B3B22", padding: "4px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 800, marginBottom: 8 }}>
                    <ShieldCheck size={13} color="#166534" /> Verified FeatherTown Order
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1B3B22", margin: 0 }}>
                    Order #{ord.orderNumber || ord.id.slice(-8).toUpperCase()}
                  </h2>
                  <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 4 }}>
                    Placed on {safeFormatDate(ord.createdAt)} • Recipient: <strong style={{ color: "#0F172A" }}>{ord.customer?.name}</strong> ({ord.customer?.city || "India"})
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#1B3B22" }}>
                    ₹{Number(ord.amount || 0).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748B", textTransform: "uppercase", fontWeight: 700, marginTop: 2 }}>
                    Mode: {ord.paymentMethod || "COD"}
                  </div>
                </div>
              </div>

              {/* Courier & AWB Banner */}
              <div
                style={{
                  background: "#FAF8F5",
                  border: "1px solid #E2DDD3",
                  borderRadius: 16,
                  padding: "16px 20px",
                  margin: "24px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "#1B3B22",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Truck size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Logistics Courier
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>
                      {carrier} {awb && <span style={{ color: "#0284C7", fontFamily: "monospace", fontSize: 13, marginLeft: 6 }}>AWB: {awb}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#166534", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={12} /> Estimated Delivery: <strong>{estDelivery}</strong>
                    </div>
                  </div>
                </div>

                {trackUrl && (
                  <a
                    href={trackUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: "#0284C7",
                      color: "#FFFFFF",
                      fontSize: 12.5,
                      fontWeight: 700,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    Track on Carrier Portal <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* Progress Stepper */}
              <div style={{ margin: "32px 0 24px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>
                  Live Transit Status
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx < activeIndex;
                    const isCurrent = idx === activeIndex;
                    return (
                      <div
                        key={step.key}
                        style={{
                          background: isCurrent ? "#EAF2EC" : isDone ? "#FAF8F5" : "#FFFFFF",
                          border: isCurrent ? "1.5px solid #1B3B22" : "1px solid #E2E8F0",
                          borderRadius: 14,
                          padding: "14px 12px",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          {isDone ? (
                            <CheckCircle2 size={16} color="#166534" />
                          ) : isCurrent ? (
                            <Clock size={16} color="#1B3B22" />
                          ) : (
                            <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #CBD5E1" }} />
                          )}
                          <span style={{ fontSize: 11, fontWeight: 800, color: isCurrent ? "#1B3B22" : isDone ? "#166534" : "#94A3B8" }}>
                            Step {idx + 1}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: isCurrent ? "#1B3B22" : "#0F172A", lineHeight: 1.3 }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 4, lineHeight: 1.3 }}>
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking History Log */}
              {Array.isArray(ord.tracking?.history) && ord.tracking.history.length > 0 && (
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 20, marginTop: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                    Transit Milestones & Updates
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {ord.tracking.history.map((h, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 13 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1B3B22", marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 800, color: "#0F172A" }}>{h.status || "Milestone"}</span>
                          {h.location && <span style={{ color: "#64748B" }}> • {h.location}</span>}
                          <div style={{ color: "#475569", marginTop: 2 }}>{h.description}</div>
                          {h.timestamp && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{safeFormatDate(h.timestamp)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ordered Products Breakdown */}
              {Array.isArray(ord.items) && ord.items.length > 0 && (
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 20, marginTop: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                    Shipment Contents ({ord.items.length} items)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ord.items.map((it, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: "#FAF8F5",
                          border: "1px solid #E2DDD3",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Package size={16} color="#1B3B22" />
                          <span style={{ fontWeight: 700, color: "#0F172A" }}>{it.name}</span>
                          <span style={{ color: "#64748B" }}>× {it.quantity}</span>
                        </div>
                        <div style={{ fontWeight: 800, color: "#1B3B22" }}>
                          ₹{Number(it.price * it.quantity).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link
            to="/accessories"
            style={{
              color: "#1B3B22",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Return to Aviary Store
          </Link>
        </div>
      </div>
    </div>
  );
}
