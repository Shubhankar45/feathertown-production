import { useState } from "react";
import { Star } from "lucide-react";

export default function Stars({ onSelect, initial = 5 }) {
  const [h, setH] = useState(0);
  const [s, setS] = useState(initial);
  const lbl = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
      <span style={{ fontSize: 10, color: "var(--mist)", fontWeight: 700, marginRight: 6, letterSpacing: 1, textTransform: "uppercase" }}>Rating</span>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (h || s);
        return (
          <button key={n} type="button"
            style={{
              background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: "0 2px",
              color: active ? "var(--gold3)" : "var(--j4)",
              transform: active ? "scale(1.2)" : "scale(1)",
              transition: "color .14s,transform .2s var(--ease-spring)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={() => setH(n)} onMouseLeave={() => setH(0)}
            onClick={() => { setS(n); onSelect(n); }}
          >
            <Star size={18} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} />
          </button>
        );
      })}
      {s > 0 && <span style={{ fontSize: 10, color: "var(--leaf2)", fontWeight: 800, marginLeft: 4, letterSpacing: 1, textTransform: "uppercase" }}>{lbl[s]}</span>}
    </div>
  );
}
