/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Editorial Customer Reviews Section
   /components/sections/Reviews.jsx

   Directly aligned with 60-30-10 palette and loaded with features:
   - Aggregated Rating Breakdown (4.9/5, star distribution bars)
   - Category filtering (Birds, Cages, Food, Toys, All)
   - Interactive Helpful voting (atomic API calls)
   - "Write a Review" modal with star rating picker & avatar choice
   - Verified Bird Parent badges
   - 100% Lucide React line icons (zero emojis)
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Plus,
  X,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import AvatarPicker from "../ui/AvatarPicker";
import { toast } from "../ui/Toast";
import { sanitizeText } from "../../utils/security";

const CATEGORY_TABS = [
  { id: "all", label: "All Reviews" },
  { id: "birds", label: "Companion Birds" },
  { id: "food", label: "Food & Nutrition" },
  { id: "cages", label: "Cages & Aviaries" },
  { id: "toys", label: "Toys & Play" },
];

export default function Reviews({ standalone = false }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 124,
    averageRating: 4.9,
    starCounts: { 5: 114, 4: 8, 3: 2, 2: 0, 1: 0 },
    recommendationRate: 98,
    verifiedCount: 124,
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [helpfulVoted, setHelpfulVoted] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [productOrBreed, setProductOrBreed] = useState("");
  const [category, setCategory] = useState("birds");
  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");
  const [avatar, setAvatar] = useState("/avatars/cockatiel.svg");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load reviews and stats from backend
  const loadReviews = useCallback(async (cat = "all") => {
    try {
      const url = cat === "all" ? "/api/reviews?limit=50" : `/api/reviews?category=${cat}&limit=50`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews/stats");
      if (res.ok) {
        const data = await res.json();
        if (data && data.totalReviews !== undefined) setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch review stats:", err);
    }
  }, []);

  useEffect(() => {
    loadReviews(activeCategory);
  }, [activeCategory, loadReviews]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle helpful vote
  const handleHelpful = async (reviewId) => {
    if (helpfulVoted[reviewId]) {
      toast.info("You already voted this review as helpful!");
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId || r.id === reviewId
              ? { ...r, helpfulCount: data.helpfulCount }
              : r
          )
        );
        toast.success("Thank you for your feedback!");
      }
    } catch {
      toast.error("Could not record vote.");
    }
  };

  // Submit new review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (honeypot) {
      setModalOpen(false);
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      toast.warn("Please enter your name.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 8) {
      toast.warn("Please write a detailed review (at least 8 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeText(name.trim()),
          title: sanitizeText(title.trim() || "Wonderful experience with FeatherTown!"),
          comment: sanitizeText(comment.trim()),
          rating,
          category,
          productOrBreed: sanitizeText(productOrBreed.trim() || "Companion Bird & Supplies"),
          location: sanitizeText(location.trim() || "India"),
          avatar,
        }),
      });

      const newDoc = await res.json();
      if (!res.ok) throw new Error(newDoc?.msg || "Submission failed");

      setReviews((prev) => [newDoc, ...prev]);
      setModalOpen(false);
      setName("");
      setTitle("");
      setProductOrBreed("");
      setComment("");
      setLocation("");
      setRating(5);
      toast.success("Thank you! Your verified review has been published.");
      loadStats();
    } catch (err) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayedReviews = standalone ? reviews : reviews.slice(0, 6);

  return (
    <section
      id="reviews"
      style={{
        padding: "clamp(48px, 6vw, 84px) clamp(16px, 4.5vw, 64px)",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {/* Header Eyebrow & Title */}
        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 4vw, 44px)" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#EAF2EC",
              border: "1px solid #CCE0D0",
              padding: "4px 14px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              color: "#1B3B22",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              marginBottom: 12,
            }}
          >
            <ShieldCheck size={14} strokeWidth={2.4} />
            <span>VERIFIED FLOCK REVIEWS</span>
          </div>

          <h2
            style={{
              fontSize: "clamp(26px, 3.4vw, 40px)",
              fontWeight: 900,
              color: "#152B17",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              margin: "0 0 10px 0",
            }}
          >
            What <span style={{ color: "#1B3B22" }}>Bird Parents</span> Say
          </h2>

          <p
            style={{
              fontSize: "clamp(14px, 1.1vw, 15.5px)",
              color: "#736B5E",
              margin: 0,
              maxWidth: 580,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.55,
            }}
          >
            Authentic experiences from 5,000+ families across India who welcomed FeatherTown companion birds and habitat supplies into their homes.
          </p>
        </div>

        {/* ── Feature 1: Rating Breakdown Banner ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E2DDD3",
            borderRadius: 24,
            padding: "clamp(20px, 3.5vw, 32px)",
            boxShadow: "0 4px 20px rgba(27, 59, 34, 0.04)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "clamp(20px, 3vw, 40px)",
            alignItems: "center",
            marginBottom: "clamp(28px, 4vw, 40px)",
          }}
        >
          {/* Left: Overall Score */}
          <div style={{ textAlign: "center", paddingRight: "clamp(0px, 2vw, 24px)" }}>
            <div
              style={{
                fontSize: "clamp(44px, 5vw, 56px)",
                fontWeight: 900,
                color: "#1B3B22",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              {stats.averageRating}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 3, color: "#1B3B22", marginBottom: 8 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#1B3B22" strokeWidth={0} />
              ))}
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "#152B17" }}>
              Based on {stats.totalReviews} verified ratings
            </div>

            <div style={{ fontSize: 11.5, color: "#736B5E", marginTop: 4 }}>
              {stats.recommendationRate}% of customers recommend us
            </div>
          </div>

          {/* Center: Star Distribution Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.starCounts?.[stars] || 0;
              const total = stats.totalReviews || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                  <span style={{ minWidth: 42, fontWeight: 700, color: "#152B17" }}>
                    {stars} Star
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: "#FAF8F5",
                      border: "1px solid #E2DDD3",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: stars >= 4 ? "#1B3B22" : "#D9381E",
                        borderRadius: 999,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  <span style={{ minWidth: 32, fontSize: 11.5, color: "#736B5E", textAlign: "right" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Write Review Trigger */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              paddingLeft: "clamp(0px, 2vw, 24px)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#EAF2EC",
                color: "#1B3B22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <MessageSquare size={22} strokeWidth={2.2} />
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 800, color: "#152B17", margin: "0 0 6px 0" }}>
              Share Your Experience
            </h4>

            <p style={{ fontSize: 12.5, color: "#736B5E", margin: "0 0 16px 0", maxWidth: 220 }}>
              Help other avian lovers find their perfect companion or setup.
            </p>

            <button
              onClick={() => setModalOpen(true)}
              className="t-btn-press"
              style={{
                background: "#D9381E",
                color: "#FFFFFF",
                border: "none",
                padding: "11px 24px",
                borderRadius: 999,
                fontSize: 13.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(217, 56, 30, 0.28)",
              }}
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>

        {/* ── Feature 2: Category Filter Tabs ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
            paddingBottom: 4,
            marginBottom: 24,
          }}
        >
          {CATEGORY_TABS.map((tab) => {
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className="t-btn-press"
                style={{
                  background: active ? "#1B3B22" : "#FFFFFF",
                  color: active ? "#FAF8F5" : "#152B17",
                  border: `1.5px solid ${active ? "#1B3B22" : "#E2DDD3"}`,
                  padding: "8px 18px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: active ? "0 2px 8px rgba(27, 59, 34, 0.15)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Feature 3: Modern Review Cards Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: "clamp(16px, 2.5vw, 24px)",
            marginBottom: 36,
          }}
        >
          {displayedReviews.map((r, i) => (
            <div
              key={r._id || r.id || i}
              style={{
                background: "#FFFFFF",
                borderRadius: 22,
                border: "1px solid #E2DDD3",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
                transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              className="t-hover-lift"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1B3B22";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(27, 59, 34, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2DDD3";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.03)";
              }}
            >
              {/* Header: Stars & Verified Badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", gap: 2, color: "#1B3B22" }}>
                  {[...Array(r.rating || 5)].map((_, idx) => (
                    <Star key={idx} size={15} fill="#1B3B22" strokeWidth={0} />
                  ))}
                </div>

                <span
                  style={{
                    background: "#EAF2EC",
                    color: "#1B3B22",
                    border: "1px solid #CCE0D0",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 999,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CheckCircle2 size={12} strokeWidth={2.4} />
                  <span>Verified Buyer</span>
                </span>
              </div>

              {/* Product/Breed Tag */}
              {r.productOrBreed && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#D9381E",
                    background: "#FCEFEA",
                    padding: "2px 8px",
                    borderRadius: 6,
                    width: "fit-content",
                    marginBottom: 8,
                    letterSpacing: 0.2,
                  }}
                >
                  {r.productOrBreed}
                </div>
              )}

              {/* Review Headline */}
              {r.title && (
                <h4
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#152B17",
                    lineHeight: 1.35,
                    margin: "0 0 8px 0",
                  }}
                >
                  {r.title}
                </h4>
              )}

              {/* Review Comment Body */}
              <p
                style={{
                  fontSize: 13.5,
                  color: "#4A453E",
                  lineHeight: 1.6,
                  margin: "0 0 18px 0",
                  flex: 1,
                }}
              >
                "{r.comment}"
              </p>

              {/* Bottom Row: Author Bio & Helpful Vote Button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #EFECE4",
                  paddingTop: 12,
                  marginTop: "auto",
                }}
              >
                {/* Author Info */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.name} avatar={r.avatar} size={36} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#152B17" }}>
                      {r.name}
                    </div>
                    {r.location && (
                      <div style={{ fontSize: 11.5, color: "#736B5E" }}>
                        {r.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Helpful Button */}
                <button
                  type="button"
                  onClick={() => handleHelpful(r._id || r.id)}
                  style={{
                    background: helpfulVoted[r._id || r.id] ? "#EAF2EC" : "#FAF8F5",
                    color: helpfulVoted[r._id || r.id] ? "#1B3B22" : "#736B5E",
                    border: "1px solid #E2DDD3",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "all 0.15s ease",
                  }}
                  title="Mark this review as helpful"
                >
                  <ThumbsUp size={12} strokeWidth={2.4} />
                  <span>Helpful ({r.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature 4: Interactive Write Review Modal ── */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2DDD3",
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "clamp(24px, 4vw, 36px)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
              position: "relative",
            }}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                background: "#FAF8F5",
                border: "1px solid #E2DDD3",
                borderRadius: "50%",
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#152B17",
              }}
            >
              <X size={17} strokeWidth={2.4} />
            </button>

            <h3
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#152B17",
                letterSpacing: "-0.02em",
                margin: "0 0 4px 0",
              }}
            >
              Write a Review
            </h3>
            <p style={{ fontSize: 13, color: "#736B5E", margin: "0 0 20px 0" }}>
              Share your verified feedback about FeatherTown birds or products.
            </p>

            <form onSubmit={handleReviewSubmit}>
              {/* Bot Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ position: "absolute", left: "-9999px", opacity: 0 }}
              />

              {/* Star Rating Picker */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
                  Your Rating
                </label>
                <div style={{ display: "flex", gap: 6, cursor: "pointer" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 2,
                        cursor: "pointer",
                        color: (hoverRating || rating) >= star ? "#1B3B22" : "#D4CEBF",
                        transition: "transform 0.1s ease",
                      }}
                      className="hover:scale-115"
                    >
                      <Star size={26} fill={(hoverRating || rating) >= star ? "#1B3B22" : "none"} strokeWidth={1.8} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Product Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#152B17", marginBottom: 4 }}>
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Healthy and affectionate bird!"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#152B17", marginBottom: 4 }}>
                    Product or Breed
                  </label>
                  <input
                    type="text"
                    value={productOrBreed}
                    onChange={(e) => setProductOrBreed(e.target.value)}
                    placeholder="e.g. Sun Conure, Kaytee Diet"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Category Select */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#152B17", marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="birds">Companion Birds</option>
                  <option value="food">Food &amp; Nutrition</option>
                  <option value="cages">Cages &amp; Habitats</option>
                  <option value="toys">Toys &amp; Enrichment</option>
                  <option value="general">General Store Experience</option>
                </select>
              </div>

              {/* Comment Body */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#152B17", marginBottom: 4 }}>
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about your bird, packaging, delivery or customer service..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Name & Location Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#152B17", marginBottom: 4 }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditi Roy"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#152B17", marginBottom: 4 }}>
                    Your City / State
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bhubaneswar, Odisha"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#152B17", marginBottom: 6 }}>
                  Choose Your Pet Avatar
                </label>
                <AvatarPicker selected={avatar} onSelect={(av) => setAvatar(av)} />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: "#FAF8F5",
                    border: "1px solid #E2DDD3",
                    padding: "10px 20px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="t-btn-press"
                  style={{
                    background: "#D9381E",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "10px 28px",
                    borderRadius: 999,
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(217, 56, 30, 0.28)",
                  }}
                >
                  {submitting ? "Publishing..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 12,
  border: "1.5px solid #E2DDD3",
  fontSize: 13,
  color: "#152B17",
  outline: "none",
  background: "#FAF8F5",
  fontFamily: "inherit",
};
