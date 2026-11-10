import { useState, useCallback, useRef } from "react";
import { toast } from "../ui/Toast";
import { isValidEmail, checkBotSubmission } from "../../utils/validation";
import { trackEvent } from "../../utils/analytics";
import sunImg from "../../assets/Sun-conure.jfif";
import Magnet from "../react-bits/Magnet";

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
        padding: "clamp(56px, 7vw, 84px) clamp(16px, 4vw, 64px) clamp(64px, 8vw, 96px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div
        className="t-hover-lift"
        style={{
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "clamp(28px, 4vw, 42px) clamp(20px, 4vw, 42px)",
          color: "#152B17",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "clamp(20px, 3vw, 32px)",
          boxShadow: "0 12px 36px rgba(21, 43, 23, 0.05)",
          border: "1px solid #E2DDD3",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Side: Mail icon + Text */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, maxWidth: 540, zIndex: 2 }}>
          <div
            className="ft-animate-sway"
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "#E7EFE8",
              border: "1.5px solid #B8D4BA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            ✉️
          </div>
          <div>
            <div style={{ marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: "#1B3B22",
                }}
              >
                VIP HATCH ALERTS &amp; COMMUNITY
              </span>
            </div>
            <h3
              style={{
                fontSize: "clamp(22px, 2.6vw, 28px)",
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: 6,
                color: "#152B17",
              }}
            >
              Join the <span style={{ color: "#1B3B22" }}>Feather</span><span style={{ color: "#D9381E" }}>Town</span> Family
            </h3>
            <p style={{ fontSize: 14, color: "#736B5E", margin: 0, lineHeight: 1.5 }}>
              Receive avian nutritional guides, certified veterinarian care tips &amp; priority clutch adoption alerts.
            </p>
          </div>
        </div>

        {/* Center / Right: Form & Bird Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, justifyContent: "flex-end", minWidth: "min(100%, 300px)", zIndex: 2 }}>
          {done ? (
            <div
              style={{
                background: "#E7EFE8",
                border: "1px solid #B8D4BA",
                padding: "14px 28px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 14,
                color: "#1B3B22",
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
                gap: 10,
                width: "100%",
                maxWidth: 460,
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
                  padding: "12px 20px",
                  borderRadius: 999,
                  background: "#FAF8F5",
                  border: "1.5px solid #E2DDD3",
                  color: "#152B17",
                  fontSize: 14,
                  outline: "none",
                }}
              />

              <Magnet padding={30} magnetStrength={3}>
                <button
                  type="submit"
                  disabled={loading}
                  className="t-btn-press"
                  style={{
                    background: "#D9381E",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 999,
                    padding: "12px 26px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(217, 56, 30, 0.3)",
                    flex: "0 0 auto",
                  }}
                >
                  {loading ? "Subscribing…" : "Subscribe →"}
                </button>
              </Magnet>
            </form>
          )}

          {/* Bird avatar circle */}
          <div
            className="hidden sm:block ft-animate-float"
            style={{
              width: 62,
              height: 62,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #E2DDD3",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            }}
          >
            <img
              src={sunImg}
              alt="FeatherTown companion conure bird"
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
