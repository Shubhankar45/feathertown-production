import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function BreedCard({ parrot }) {
  const { settings } = useSettings();
  const wa = (settings?.whatsapp || "919556747518").replace(/\D/g, "");
  const whatsappLink = `https://wa.me/${wa}?text=${encodeURIComponent(
    `Hi FeatherTown! I'm interested in learning more about the ${parrot.name}. Can you share current availability and care details?`
  )}`;

  const isAvailable = parrot.status === "available" || parrot.status === "Available";

  return (
    <div
      className="ft-card-lift"
      style={{
        background: "#FFFFFF",
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#059669";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(5, 150, 105, 0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E2E8F0";
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(15, 23, 42, 0.05)";
      }}
    >
      {/* IMAGE CONTAINER */}
      <div style={{ position: "relative", height: 230, overflow: "hidden", background: "#F8FAFC" }}>
        <img
          src={parrot.image}
          alt={parrot.name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />

        {/* Soft bottom vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(15,23,42,0.4) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Category Pill */}
          <span
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(8px)",
              color: "#059669",
              border: "1px solid #A7F3D0",
              fontSize: 11,
              fontWeight: 800,
              padding: "4px 12px",
              borderRadius: 999,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              boxShadow: "0 2px 6px rgba(15,23,42,0.06)",
            }}
          >
            {parrot.category}
          </span>

          {/* Availability Pill */}
          <span
            style={{
              background: isAvailable ? "#ECFDF5" : "#FEF2F2",
              color: isAvailable ? "#059669" : "#DC2626",
              border: `1px solid ${isAvailable ? "#A7F3D0" : "#FECACA"}`,
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "0 2px 6px rgba(15,23,42,0.06)",
            }}
          >
            <span
              className={isAvailable ? "ft-animate-badge-pulse" : ""}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isAvailable ? "#059669" : "#DC2626",
                display: "inline-block",
              }}
            />
            {isAvailable ? "Available" : "Waitlist"}
          </span>
        </div>

        {/* Price tag on photo */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid #A7F3D0",
            color: "#059669",
            fontWeight: 800,
            fontSize: 14,
            padding: "5px 14px",
            borderRadius: 999,
            boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
          }}
        >
          {parrot.price}
        </div>
      </div>

      {/* CARD CONTENT */}
      <div style={{ padding: "clamp(14px, 3vw, 20px) clamp(12px, 3vw, 20px)", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3
          style={{
            fontFamily: "Outfit, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 19,
            color: "#0F172A",
            marginBottom: 6,
            lineHeight: 1.25,
          }}
        >
          {parrot.name}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.6,
            marginBottom: 16,
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {parrot.description}
        </p>

        {/* Quick Trait Badges */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            background: "#F8FAFC",
            borderRadius: 14,
            padding: "10px 12px",
            marginBottom: 18,
            border: "1px solid #E2E8F0",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Size</div>
            <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>{parrot.size || "Medium"}</div>
          </div>
          <div style={{ borderLeft: "1px solid #E2E8F0", borderRight: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Lifespan</div>
            <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>{parrot.lifespan || "20-30y"}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>Speech</div>
            <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 700, marginTop: 2 }}>{parrot.talkingAbility || "Good"}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 100px), 1fr))", gap: 8 }}>
          <Link
            to={`/breed/${parrot.id}`}
            style={{
              textAlign: "center",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1.5px solid #CBD5E1",
              color: "#0F172A",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              background: "#FFFFFF",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ECFDF5";
              e.currentTarget.style.borderColor = "#059669";
              e.currentTarget.style.color = "#059669";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.color = "#0F172A";
            }}
          >
            Care Profile →
          </Link>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            style={{
              textAlign: "center",
              padding: "10px 14px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            <span>💬</span> Inquire
          </a>
        </div>
      </div>
    </div>
  );
}