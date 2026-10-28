/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Newsletter (Dark Minimal)
   /components/sections/Newsletter.jsx
═══════════════════════════════════════════════════════════════ */
import { useState, useCallback, useRef } from "react";
import { toast } from "../ui/Toast";
import { isValidEmail, checkBotSubmission } from "../../utils/validation";
import { trackEvent } from "../../utils/analytics";
import sunImg from "../../assets/Sun-conure.jfif";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState(false);
  const formMountTime = useRef(Date.now());

  const handleSubscribe = useCallback(async (e) => {
    e.preventDefault();

    const botCheck = checkBotSubmission(honeypot, formMountTime.current, 800);
    if (botCheck.isBot) {
      setDone(true);
      return;
    }

    if (!isValidEmail(email)) {
      toast.warn("Please enter a valid email address (e.g. name@example.com)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), hp: honeypot }),
      });
      const data = await res.json();
      if (res.ok) {
        const isAlr = /already/i.test(data.msg || "");
        setAlready(isAlr);
        setDone(true);
        setEmail("");
        trackEvent("newsletter_subscribe", { method: "home_banner" });
        toast.success(data.msg ?? "Welcome to the FeatherTown family! 🌿");
      } else {
        toast.error(data.msg ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [email, honeypot]);

  return (
    <section
      style={{
        padding: "clamp(48px, 6vw, 72px) clamp(16px, 4vw, 64px) clamp(56px, 7vw, 84px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FFFFFF",
        borderTop: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        className="rv-scale"
        style={{
          background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #F8FAFC 100%)",
          borderRadius: 28,
          padding: "clamp(26px, 4vw, 38px) clamp(20px, 4vw, 38px)",
          color: "#0F172A",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "clamp(18px, 3vw, 28px)",
          boxShadow: "0 8px 32px rgba(15, 23, 42, 0.06)",
          border: "1px solid #A7F3D0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Side: Mail icon + Text */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, maxWidth: 520, zIndex: 2 }}>
          <div
            className="ft-animate-sway"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "1px solid #A7F3D0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.1)",
            }}
          >
            ✉️
          </div>
          <div>
            <h3
              style={{
                fontSize: "clamp(22px, 2.6vw, 28px)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 4,
                color: "#0F172A",
              }}
            >
              Join the <span style={{ color: "#059669" }}>FeatherTown</span> Family
            </h3>
            <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>
              Get expert bird care tips, exclusive discounts &amp; spring hatch alerts!
            </p>
          </div>
        </div>

        {/* Center / Right: Form & Bird Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, justifyContent: "flex-end", minWidth: "min(100%, 280px)", zIndex: 2 }}>
          {done ? (
            <div
              style={{
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14,
                color: "#059669",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🎉</span>
              <span>{already ? "You're already subscribed!" : "You're subscribed! Welcome."}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{
                display: "flex",
                gap: 8,
                width: "100%",
                maxWidth: 440,
                position: "relative",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                name="user_confirm_hp"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                style={{
                  flex: "1 1 200px",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: 999,
                  padding: "12px 22px",
                  fontSize: 14,
                  color: "#0F172A",
                  outline: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="ft-btn-hover"
                style={{
                  background: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 26px",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)",
                  flex: "0 0 auto",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#047857")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#059669")}
              >
                {loading ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}

          {/* Bird avatar circle */}
          <div
            className="hidden sm:block ft-animate-float"
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #FFFFFF",
              flexShrink: 0,
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
            }}
          >
            <img
              src={sunImg}
              alt="FeatherTown Bird"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
