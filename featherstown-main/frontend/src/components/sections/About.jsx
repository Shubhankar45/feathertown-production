/* ═══════════════════════════════════════════════════
   ABOUT — who-we-are cards grid
═══════════════════════════════════════════════════ */
import { Leaf } from "../ui/Icons";
import { useSettings } from "../../context/SettingsContext";

export default function About({ standalone = false }) {
  const { settings } = useSettings();
  const cards = Array.isArray(settings?.aboutCards) ? settings.aboutCards : [];

  return (
    <section id="about" className="sp" style={{ background: "var(--j0)", position: "relative", overflow: "hidden" }}>
      <Leaf style={{ width: 180, top: "-7%", right: "-3%", transform: "rotate(22deg)" }} />
      <Leaf style={{ width: 100, bottom: "-5%", left: "1%", transform: "rotate(-11deg)" }} />
      {!standalone && (
        <div className="rv" style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="stag">{settings?.aboutTagline || "Who We Are"}</span>
          <h2 style={{ fontFamily: "var(--font-d)", fontSize: "clamp(26px,4vw,52px)", fontWeight: 500, color: "var(--cream)", lineHeight: 1.1, marginTop: 10, marginBottom: 12 }}>
            About <span style={{ color: "var(--leaf)", fontStyle: "italic" }}>Feathers Town</span>
          </h2>
          <p style={{ color: "var(--fog)", fontSize: 14.5, lineHeight: 1.9, maxWidth: 520, margin: "0 auto" }}>
            {settings?.aboutStory || "We go beyond selling birds. Every parrot is raised with care, trained with patience, and placed in a loving home — complete with guidance on behaviour, diet, and lifestyle."}
          </p>
        </div>
      )}
      <div className="ag">
        {cards.map(({ icon, title, color, items, body, link }, idx) => {
          const effectiveLink = link?.href || (title?.toLowerCase().includes("instagram") || title?.toLowerCase().includes("video") ? settings?.instagramUrl : null);
          return (
            <div key={title || idx} className="j-card rv" style={{ padding: "22px 20px", transitionDelay: `${idx * 70}ms` }}>
              <div style={{ width: 46, height: 46, borderRadius: "var(--r)", background: `${color || "#1B3B22"}16`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14, border: `1px solid ${color || "#1B3B22"}26` }}>{icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 11, color: color || "#1B3B22", marginBottom: 12, letterSpacing: 0.6, textTransform: "uppercase" }}>{title}</h3>
              {Array.isArray(items) && items.length > 0 && (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {items.map((it) => (
                    <li key={it} style={{ display: "flex", gap: 8, color: "var(--fog)", fontSize: 13, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--leaf2)", fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>{it}
                    </li>
                  ))}
                </ul>
              )}
              {body && <p style={{ color: "var(--fog)", fontSize: 13, lineHeight: 1.85 }}>{body}</p>}
              {effectiveLink && <a href={effectiveLink} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, color: "var(--leaf2)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>{link?.label || "Visit Instagram →"}</a>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
