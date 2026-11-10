import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "../components/SEOHead";

export default function NotFound() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/birds?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      style={{
        background: "#F7F5F0",
        color: "#152B17",
        fontFamily: "Outfit, system-ui, sans-serif",
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(32px, 5vh, 60px) clamp(16px, 3.5vw, 24px)",
      }}
    >
      <SEOHead
        title="404 - Page Not Found | FeatherTown"
        description="The page you are looking for has flown away. Browse healthy parrots, accessories, or contact FeatherTown support."
      />

      <div
        className="rv-scale ft-card-lift"
        style={{
          maxWidth: 580,
          width: "100%",
          textAlign: "center",
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "clamp(24px, 4vw, 48px) clamp(16px, 4vw, 36px)",
          boxShadow: "0 12px 32px rgba(27, 59, 34, 0.06)",
          border: "1px solid #E2DDD3",
        }}
      >
        <div
          className="ft-animate-float"
          style={{
            fontSize: 72,
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          
        </div>

        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#1B3B22",
            background: "#E7EFE8",
            border: "1px solid #B8D4BA",
            padding: "4px 14px",
            borderRadius: 99,
            marginBottom: 12,
          }}
        >
          Error 404
        </div>

        <h1
          style={{
            fontSize: "clamp(26px, 3.8vw, 38px)",
            fontWeight: 900,
            color: "#152B17",
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          Looks Like This Bird Has Flown Away!
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "#736B5E",
            lineHeight: 1.6,
            marginBottom: 28,
            maxWidth: 440,
            margin: "0 auto 28px",
          }}
        >
          The page or product you're looking for might have moved or is no longer available. Try searching below or return to the flock!
        </p>

        {/* Quick Search */}
        <form onSubmit={handleSearch} style={{ maxWidth: 420, margin: "0 auto 32px", position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parrots, cages, food..."
            style={{
              width: "100%",
              padding: "12px 100px 12px 18px",
              borderRadius: 999,
              border: "1.5px solid #E2DDD3",
              background: "#FAF8F5",
              color: "#152B17",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="ft-btn-hover t-btn-press"
            style={{
              position: "absolute",
              right: 5,
              top: 5,
              bottom: 5,
              background: "#D9381E",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 999,
              padding: "0 18px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {/* Quick Links */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/"
            className="ft-btn-hover t-btn-press"
            style={{
              background: "#D9381E",
              color: "#FFFFFF",
              padding: "12px 26px",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(217, 56, 30, 0.3)",
            }}
          >
            Return to Aviary
          </Link>
          <Link
            to="/birds"
            className="ft-btn-hover t-btn-press"
            style={{
              background: "#FAF8F5",
              color: "#1B3B22",
              border: "1.5px solid #E2DDD3",
              padding: "12px 22px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Browse Birds
          </Link>
          <Link
            to="/accessories"
            className="ft-btn-hover t-btn-press"
            style={{
              background: "#FAF8F5",
              color: "#1B3B22",
              border: "1.5px solid #E2DDD3",
              padding: "12px 22px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Shop Accessories
          </Link>
        </div>
      </div>
    </div>
  );
}
