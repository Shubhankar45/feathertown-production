import { useState, useEffect, useCallback, useRef } from "react";
import Avatar from "../ui/Avatar";
import AvatarPicker from "../ui/AvatarPicker";
import Stars from "../ui/Stars";
import { toast } from "../ui/Toast";
import { sanitizeText } from "../../utils/security";
import SpotlightCard from "../react-bits/SpotlightCard";
import Magnet from "../react-bits/Magnet";

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
  }, [reviewName, reviewComment, rating, reviewAvatar, honeypot]);

  const displayedReviews = standalone ? reviews : reviews.slice(0, 4);

  return (
    <section
      id="reviews"
      style={{
        padding: "clamp(56px, 7vw, 96px) clamp(16px, 4vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            padding: "4px 12px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.2,
            color: "#059669",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          <span>VERIFIED STORIES</span>
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 3.6vw, 40px)",
            fontWeight: 900,
            color: "#0F172A",
            lineHeight: 1.2,
            margin: "0 0 8px 0",
            letterSpacing: "-0.02em",
          }}
        >
          What <span className="text-emerald-600">Pet Parents</span> Say
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", margin: 0, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
          Authentic stories from happy companion bird families who found their feathered souls through FeatherTown.
        </p>
      </div>

      {/* Reviews Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          gap: "clamp(16px, 2.5vw, 24px)",
          marginBottom: 52,
        }}
      >
        {displayedReviews.map((r, i) => (
          <SpotlightCard
            key={r._id || i}
            spotlightColor="rgba(22, 163, 74, 0.12)"
            borderColor="#E2E8F0"
            className="t-hover-lift flex flex-col justify-between p-6"
            style={{
              borderRadius: 24,
              boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div>
              {/* Header with 5 Gold Stars & Verified Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ color: "#F59E0B", fontSize: 15, letterSpacing: 2 }}>
                  {"★".repeat(r.rating || 5)}
                </div>
                <span
                  style={{
                    background: "#ECFDF5",
                    color: "#059669",
                    border: "1px solid #A7F3D0",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  ✓ Verified Parent
                </span>
              </div>

              {/* Review Quote */}
              <p
                style={{
                  fontSize: 13.5,
                  color: "#334155",
                  lineHeight: 1.65,
                  fontStyle: "italic",
                  marginBottom: 20,
                }}
              >
                "{r.comment}"
              </p>
            </div>

            {/* Author Strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #F1F5F9", paddingTop: 14 }}>
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
          </SpotlightCard>
        ))}
      </div>

      {/* Review Submission Form */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "clamp(24px, 4vw, 44px) clamp(18px, 4vw, 40px)",
          maxWidth: 680,
          margin: "0 auto",
          boxShadow: "0 4px 28px rgba(15, 23, 42, 0.06)",
          border: "1px solid #E2E8F0",
        }}
      >
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0F172A",
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          Share your experience with <span className="text-emerald-600">Feather</span><span className="text-orange-500">Town</span>
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

          <div style={{ marginBottom: 14 }}>
            <input
              type="text"
              placeholder="Your Full Name"
              value={reviewName}
              onChange={(e) => setRN(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all"
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <textarea
              placeholder="Tell other pet families about your bird adoption, aviary consultation, or premium bird care supplies..."
              value={reviewComment}
              onChange={(e) => setRC(e.target.value)}
              rows={3}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all resize-none"
            />
          </div>

          {/* Star Rating Select */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Your Rating:</span>
              <Stars rating={rating} onRate={(n) => setRating(n)} editable />
            </div>

            <AvatarPicker selected={reviewAvatar} onSelect={(av) => setReviewAvatar(av)} />
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: "center" }}>
            <Magnet padding={40} magnetStrength={3}>
              <button
                type="submit"
                disabled={reviewLoading}
                className="t-btn-press"
                style={{
                  background: "#16A34A",
                  color: "#FFFFFF",
                  padding: "12px 32px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13,
                  border: "none",
                  cursor: reviewLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(22, 163, 74, 0.3)",
                }}
              >
                {reviewLoading ? "Submitting..." : "Post Verified Review ✨"}
              </button>
            </Magnet>
          </div>
        </form>
      </div>
    </section>
  );
}
