import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useCart } from "../context/CartContext";
import { toast } from "../components/ui/Toast";
import { isValidEmail, isValidPhone, isValidPincode, checkBotSubmission } from "../utils/validation";
import { sanitizeText } from "../utils/security";
import { trackEvent } from "../utils/analytics";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "Odisha",
  pincode: "",
};

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [honeypot, setHoneypot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' or 'cod'
  const [placing, setPlacing] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(true);
  const formMountTime = useRef(Date.now());

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : { paymentsEnabled: false }))
      .then((cfg) => {
        if (cfg.paymentsEnabled !== undefined) {
          setPaymentsEnabled(Boolean(cfg.paymentsEnabled));
          if (!cfg.paymentsEnabled) setPaymentMethod("cod");
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="rv-scale" style={{ background: "#F7F5F0", minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div className="ft-animate-float" style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><ShoppingCart size={56} color="#1B3B22" strokeWidth={1.8} /></div>
        <p style={{ color: "#736B5E", fontSize: 16 }}>Your cart is empty.</p>
        <Link
          to="/accessories"
          className="ft-btn-hover"
          style={{
            background: "#1B3B22",
            color: "#fff",
            padding: "12px 26px",
            borderRadius: 999,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(27, 59, 34, 0.25)",
          }}
        >
          Browse accessories
        </Link>
      </div>
    );
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validateForm = () => {
    // 1. Spam honeypot
    const botCheck = checkBotSubmission(honeypot, formMountTime.current, 1000);
    if (botCheck.isBot) {
      toast.error("Invalid submission");
      return false;
    }

    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.warn("Please enter your full name.");
      return false;
    }
    if (!isValidEmail(form.email)) {
      toast.warn("Please enter a valid email address for order receipts.");
      return false;
    }
    if (!isValidPhone(form.phone)) {
      toast.warn("Please enter a valid 10-digit mobile number for courier delivery updates.");
      return false;
    }
    if (!form.address.trim() || form.address.trim().length < 6) {
      toast.warn("Please provide your complete shipping street address.");
      return false;
    }
    if (!form.city.trim()) {
      toast.warn("Please enter your delivery city.");
      return false;
    }
    if (!isValidPincode(form.pincode)) {
      toast.warn("Please enter a valid 6-digit postal PIN code.");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPlacing(true);
    const sanitizedCustomer = {
      name: sanitizeText(form.name),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      address: sanitizeText(form.address),
      city: sanitizeText(form.city),
      state: sanitizeText(form.state),
      pincode: form.pincode.trim(),
    };

    // If Cash On Delivery selected
    if (paymentMethod === "cod" || !paymentsEnabled) {
      try {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
            customer: sanitizedCustomer,
            paymentMethod: "cod",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.msg || "Failed to create order");

        clearCart();
        trackEvent("purchase", { orderId: data.orderId, value: subtotal, currency: "INR", method: "cod" });
        navigate(`/order-success?orderId=${data.orderId}&cod=1`);
      } catch (err) {
        toast.error(err.message || "Could not place order");
      } finally {
        setPlacing(false);
      }
      return;
    }

    // Online Razorpay Payment
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) throw new Error("Couldn't load payment gateway. Check your internet connection.");

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          customer: sanitizedCustomer,
          paymentMethod: "online",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to initialize order");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "FeatherTown",
        description: "Bird care accessories order",
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#1B3B22" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/orders/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData?.msg || "Payment verification failed");

            clearCart();
            trackEvent("purchase", { orderId: verifyData.orderId, value: subtotal, currency: "INR", method: "razorpay" });
            navigate(`/order-success?orderId=${verifyData.orderId}`);
          } catch (err) {
            toast.error(err.message);
          }
        },
      });

      rzp.on("payment.failed", (resp) => {
        toast.error(`Payment failed: ${resp.error?.description || "Transaction cancelled"}`);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setPlacing(false);
    }
  };

  const freeShipping = subtotal >= 999;
  const shippingFee = freeShipping ? 0 : 99;
  const finalTotal = subtotal + shippingFee;

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Secure Checkout | FeatherTown"
        description="Complete your FeatherTown bird care order securely with Razorpay 256-bit encryption or Cash on Delivery."
      />

      <PageBanner eyebrow="Checkout" title="Secure" accent="Payment" desc="Enter your shipping address and choose your preferred payment option." />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 32, alignItems: "start" }}>
          {/* Left: Form */}
          <div
            className="rv-left ft-card-lift"
            style={{
              background: "#FFFFFF",
              borderRadius: 28,
              padding: "clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>
              1. Shipping Address
            </h3>

            <form onSubmit={handlePlaceOrder}>
              {/* Honeypot trap */}
              <input
                type="text"
                name="user_checkout_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                style={{ display: "none" }}
                aria-hidden="true"
              />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" value={form.name} onChange={update("name")} placeholder="e.g. Ananya Das" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mobile Phone (10 Digits) *</label>
                  <input type="tel" value={form.phone} onChange={update("phone")} maxLength={10} placeholder="9876543210" required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email Address (For Invoices) *</label>
                <input type="email" value={form.email} onChange={update("email")} placeholder="ananya@example.com" required style={inputStyle} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Street Address &amp; House / Flat No. *</label>
                <textarea value={form.address} onChange={update("address")} rows={2} placeholder="House No., Street, Landmark..." required style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: 12, marginBottom: 28 }}>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input type="text" value={form.city} onChange={update("city")} placeholder="e.g. Bhubaneswar" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>State *</label>
                  <input type="text" value={form.state} onChange={update("state")} placeholder="Odisha" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>PIN Code *</label>
                  <input type="text" value={form.pincode} onChange={update("pincode")} maxLength={6} placeholder="751001" required style={inputStyle} />
                </div>
              </div>

              {/* Payment Method Selector */}
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 16 }}>
                2. Payment Method
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                {paymentsEnabled && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 18px",
                      borderRadius: 16,
                      border: paymentMethod === "online" ? "2px solid #1B3B22" : "1.5px solid #E2DDD3",
                      background: paymentMethod === "online" ? "#E7EFE8" : "#FAF8F5",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_choice"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      style={{ accentColor: "#1B3B22", width: 18, height: 18 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#152B17" }}>
                        Online Payment (UPI, Credit/Debit Card, Netbanking)
                      </div>
                      <div style={{ fontSize: 12, color: "#736B5E" }}>
                        Instant verification via Razorpay • 100% Encrypted
                      </div>
                    </div>
                    <Zap size={20} color="#1B3B22" strokeWidth={2.2} />
                  </label>
                )}

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    borderRadius: 16,
                    border: paymentMethod === "cod" ? "2px solid #1B3B22" : "1.5px solid #E2DDD3",
                    background: paymentMethod === "cod" ? "#E7EFE8" : "#FAF8F5",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    style={{ accentColor: "#1B3B22", width: 18, height: 18 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#152B17" }}>
                      Cash on Delivery (COD)
                    </div>
                    <div style={{ fontSize: 12, color: "#736B5E" }}>
                      Pay in cash when your parcel arrives
                    </div>
                  </div>
                  <Banknote size={20} color="#1B3B22" strokeWidth={2.2} />
                </label>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="t-btn-press"
                style={{
                  width: "100%",
                  background: "#D9381E",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "15px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(217, 56, 30, 0.3)",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#B82E17")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#D9381E")}
              >
                {placing ? "Processing Order…" : paymentMethod === "online" ? `Pay ₹${finalTotal.toLocaleString("en-IN")} Securely` : `Confirm Order for ₹${finalTotal.toLocaleString("en-IN")}`}
              </button>
            </form>
          </div>

          {/* Right: Summary */}
          <div
            className="rv-right ft-card-lift"
            style={{
              background: "#FFFFFF",
              borderRadius: 28,
              padding: "28px 24px",
              border: "1px solid #E2DDD3",
              boxShadow: "0 2px 10px rgba(27, 59, 34, 0.04)",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#152B17", marginBottom: 16 }}>
              Order Items ({items.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {items.map((it) => (
                <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13.5 }}>
                  <img
                    src={it.image || it.images?.[0] || "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&auto=format&fit=crop&q=80"}
                    alt={it.name}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "1px solid #E2DDD3" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#152B17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#736B5E" }}>Qty: {it.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#D9381E" }}>
                    ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #E2DDD3", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#736B5E" }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: "#152B17" }}>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#736B5E" }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 700, color: freeShipping ? "#1B3B22" : "#152B17" }}>
                  {freeShipping ? "FREE" : "₹99"}
                </span>
              </div>
              <div style={{ borderTop: "1px solid #E2DDD3", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "#152B17" }}>
                <span>Total</span>
                <span style={{ color: "#D9381E" }}>₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div style={{ background: "#FAF8F5", border: "1px solid #E2DDD3", borderRadius: 16, padding: "14px", marginTop: 20, fontSize: 12.5, color: "#152B17" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Truck size={15} strokeWidth={2.2} /> <strong>Fast Courier Delivery:</strong></span> Dispatches within 24 hours. Tracking link sent via SMS and WhatsApp.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#152B17",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1.5px solid #E2DDD3",
  fontSize: 13.5,
  color: "#152B17",
  outline: "none",
  background: "#FAF8F5",
};
