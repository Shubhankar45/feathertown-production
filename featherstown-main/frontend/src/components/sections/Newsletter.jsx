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
          background: "linear-gradient(135deg, #F0FDF4 0%, #FFF7ED 50%, #FFFFFF 100%)",
          borderRadius: 24,
          padding: "clamp(24px, 3.5vw, 34px) clamp(18px, 3.5vw, 34px)",
          color: "#0F172A",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "clamp(16px, 2.5vw, 24px)",
          boxShadow: "0 8px 32px rgba(15, 23, 42, 0.06)",
          border: "1px solid #FED7AA",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Side: Mail icon + Text */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 520, zIndex: 2 }}>
          <div
            className="ft-animate-sway"
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "1px solid #FED7AA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(249, 115, 22, 0.12)",
            }}
          >
            ✉️
          </div>
          <div>
            <h3
              style={{
                fontSize: "clamp(20px, 2.4vw, 25px)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 4,
                color: "#0F172A",
              }}
            >
              Join the <span style={{ color: "#16A34A" }}>Feather</span><span style={{ color: "#EA580C" }}>Town</span> Family
            </h3>
            <p style={{ fontSize: 13.5, color: "#475569", margin: 0 }}>
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
                  background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 999,
                  padding: "11px 22px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
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
