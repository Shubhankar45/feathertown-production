/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Newsletter Strip
   /components/sections/Newsletter.jsx

   Directly modeled on the reference design:
   - "Join Our Flock!" bold centered header
   - Clean subtitle
   - Inline pill input with Tomato Red (#D9381E) "Subscribe" button
   - Cute companion bird photo accents on sides
   - Spam-protected & validation integrated
═══════════════════════════════════════════════════════════════ */
import { useState, useCallback, useRef } from "react";
import { Heart, CheckCircle2 } from "lucide-react";
import { toast } from "../ui/Toast";
import { isValidEmail, checkBotSubmission } from "../../utils/validation";
import { trackEvent } from "../../utils/analytics";
import conureImg from "../../assets/birds/crop-sun-conure.jpg";
import cockatielImg from "../../assets/birds/crop-cockatiel.jpg";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const formMountTime = useRef(Date.now());

  const handleSubscribe = useCallback(
    async (e) => {
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
          setDone(true);
          setEmail("");
          trackEvent("newsletter_subscribe", { method: "home_banner" });
          toast.success(data.msg || "Welcome to the FeatherTown family!");
        } else {
          toast.error(data.msg || "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Could not reach the server. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [email, honeypot]
  );

  return (
    <section
      style={{
        padding: "clamp(48px, 6vw, 76px) clamp(16px, 4.5vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        fontFamily: "Outfit, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Newsletter Subscription"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(20px, 4vw, 48px)",
          position: "relative",
        }}
      >
        {/* Left Companion Bird Accent (Desktop/Tablet) */}
        <div
          className="hidden md:flex"
          style={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #FFFFFF",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            flexShrink: 0,
          }}
        >
          <img
            src={conureImg}
            alt="Friendly sun conure companion bird"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Center Content & Form */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            maxWidth: 580,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(26px, 3.4vw, 38px)",
              fontWeight: 900,
              color: "#152B17",
              letterSpacing: "-0.025em",
              margin: "0 0 8px 0",
            }}
          >
            Join Our Flock!
          </h2>
          <p
            style={{
              fontSize: "clamp(13.5px, 1.1vw, 15px)",
              color: "#736B5E",
              margin: "0 0 24px 0",
              lineHeight: 1.5,
            }}
          >
            Get exclusive offers, companion bird care tips, and the latest arrivals delivered to your inbox.
          </p>

          {done ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#EAF2EC",
                color: "#1B3B22",
                padding: "12px 24px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              <CheckCircle2 size={18} strokeWidth={2.4} />
              <span>You're in the flock! Thank you for subscribing.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#FFFFFF",
                borderRadius: 999,
                padding: "5px 6px 5px 20px",
                border: "1.5px solid #E2DDD3",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              {/* Bot Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: "#152B17",
                  width: "100%",
                }}
              />

              <button
                type="submit"
                disabled={loading}
                className="t-btn-press"
                style={{
                  background: "#D9381E",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: 999,
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(217, 56, 30, 0.25)",
                  transition: "background 0.15s ease",
                }}
              >
                {loading ? "Joining..." : "Subscribe"}
              </button>
            </form>
          )}
        </div>

        {/* Right Companion Bird Accent (Desktop/Tablet) */}
        <div
          className="hidden md:flex"
          style={{
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #FFFFFF",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <img
              src={cockatielImg}
              alt="Friendly cockatiel companion bird"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#1B3B22",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span>Good Birds, Good People</span>
            <Heart size={12} fill="#D9381E" color="#D9381E" />
          </span>
        </div>
      </div>
    </section>
  );
}
