/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Reviews & Testimonials (Dark Minimal)
   /components/sections/Reviews.jsx
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useRef } from "react";
import Avatar from "../ui/Avatar";
import AvatarPicker from "../ui/AvatarPicker";
import Stars from "../ui/Stars";
import { toast } from "../ui/Toast";
import { sanitizeText } from "../../utils/security";

export default function Reviews({ standalone = false }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewName, setRN] = useState("");
  const [reviewComment, setRC] = useState("");
  const [reviewAvatar, setReviewAvatar] = useState("/avatars/cockatiel.svg");
  const [honeypot, setHoneypot] = useState("");
  const [reviewLoading, setRL] = useState(false);
  const formMountTime = useRef(Date.now());

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/reviews", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setReviews(data);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleReviewSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (honeypot && honeypot.trim().length > 0) {
      toast.success("Review submitted 🎉");
      return;
    }

    if (!reviewName.trim() || reviewName.trim().length < 2) {
      toast.warn("Please enter your name (at least 2 characters).");
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      toast.warn("Please write a short review comment.");
      return;
    }

    setRL(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeText(reviewName.trim()),
          rating,
          comment: sanitizeText(reviewComment.trim()),
          avatar: reviewAvatar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Failed to submit");
      setReviews((prev) => [data, ...prev]);
      setRN("");
      setRC("");
      setRating(5);
      toast.success("Review submitted 🎉 Thank you for supporting FeatherTown!");
    } catch {
      toast.error("Could not reach the server right now.");
    } finally {
      setRL(false);
    }
  }, [reviewName, reviewComment, rating, honeypot]);

  const displayedReviews = standalone ? reviews : reviews.slice(0, 4);

  return (
    <section
      id="reviews"
      style={{
        padding: "clamp(48px, 6vw, 80px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2
          style={{
            fontSize: "clamp(26px, 3.5vw, 38px)",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1.2,
            margin: "0 0 6px 0",
            letterSpacing: "-0.01em",
          }}
        >
          What <span style={{ color: "#059669" }}>Pet Parents</span> Say
        </h2>
        <p style={{ fontSize: 14.5, color: "#64748B", margin: 0 }}>
          Real feedback from happy companion bird families across India.
        </p>
      </div>

      {/* Reviews Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
          marginBottom: 44,
        }}
      >
        {displayedReviews.map((r, i) => (
          <div
            key={r._id || i}
            className="ft-card-lift"
            style={{
              background: "#FFFFFF",
              borderRadius: 22,
              padding: "clamp(20px, 3vw, 26px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), border-color 0.2s, box-shadow 0.28s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#059669";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(5, 150, 105, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(15, 23, 42, 0.04)";
            }}
          >
            <div>
              {/* 5 Gold Stars */}
              <div style={{ color: "#F59E0B", fontSize: 16, marginBottom: 12, letterSpacing: 2 }}>
                {"★".repeat(r.rating || 5)}
              </div>

              {/* Review Quote */}
              <p
                style={{
                  fontSize: 14,
                  color: "#334155",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  marginBottom: 20,
                }}
              >
                "{r.comment}"
              </p>
            </div>

            {/* Author Strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #E2E8F0", paddingTop: 12 }}>
              <Avatar name={r.name} avatar={r.avatar} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: "#0F172A" }}>
                  — {r.name}
                </div>
                {r.location && (
                  <div style={{ fontSize: 11.5, color: "#64748B" }}>
                    {r.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Form with Spam Protection */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "clamp(24px, 4vw, 40px) clamp(18px, 4vw, 36px)",
          maxWidth: 720,
          margin: "0 auto",
          boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
          border: "1px solid #E2E8F0",
        }}
      >
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0F172A",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Leave a Review for <span style={{ color: "#059669" }}>FeatherTown</span>
        </h3>

        <form onSubmit={handleReviewSubmit}>
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            style={{ display: "none" }}
            aria-hidden="true"
          />

          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Your Name"
              value={reviewName}
              onChange={(e) => setRN(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#CBD5E1";
                e.target.style.background = "#F8FAFC";
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <textarea
              placeholder="Tell others about your companion bird, cage, or accessories..."
              value={reviewComment}
              onChange={(e) => setRC(e.target.value)}
              rows={3}
              required
              style={{
                width: "100%",
                padding: "11px 16px",
                borderRadius: 12,
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#CBD5E1";
                e.target.style.background = "#F8FAFC";
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <AvatarPicker
              compact
              selected={reviewAvatar}
              onSelect={setReviewAvatar}
              title="Select Your Bird Avatar"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Rating:</span>
            <Stars onSelect={setRating} initial={rating} />
          </div>

          <button
            type="submit"
            disabled={reviewLoading}
            style={{
              width: "100%",
              background: "#059669",
              color: "#FFFFFF",
              border: "none",
              padding: "12px",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#047857")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#059669")}
          >
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
}
