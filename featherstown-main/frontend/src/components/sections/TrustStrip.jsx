/* ═══════════════════════════════════════════════════
   TRUST STRIP — scrolling ticker + trust badge grid
═══════════════════════════════════════════════════ */
import { ShieldCheck, HeartHandshake, Feather, Star } from "lucide-react";

const TICKER = [
  { t: "Hand-Fed Parrots", c: "var(--leaf2)" }, { t: "Expert Training", c: "var(--gold3)" },
  { t: "Ethically Raised", c: "var(--leaf3)" }, { t: "Lifetime Support", c: "var(--leaf2)" },
  { t: "WhatsApp Guidance", c: "var(--gold3)" }, { t: "100+ Happy Owners", c: "var(--leaf2)" },
  { t: "Rare Breeds", c: "var(--leaf3)" }, { t: "Bhubaneswar's Best", c: "var(--gold3)" },
];
const TRUST = [
  { Icon: ShieldCheck, title: "Health Guarantee", desc: "All birds vet-checked before sale" },
  { Icon: HeartHandshake, title: "Lifetime Support", desc: "WhatsApp guidance forever, free" },
  { Icon: Feather, title: "Ethically Raised", desc: "No factory farming, ever" },
  { Icon: Star, title: "5-Star Rated", desc: "100+ happy customers in Odisha" },
];

export default function TrustStrip() {
  return (
    <>
      <div className="t-wrap">
        <div className="t-inner">
          {[...TICKER, ...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="t-item" style={{ color: item.c }}>
              {item.t}<span style={{ color: "rgba(34,197,94,.18)", fontSize: 8, marginLeft: 3 }}>◆</span>
            </span>
          ))}
        </div>
      </div>
      <hr className="jhr" />
      <section className="sp" style={{ background: "var(--j1)", paddingTop: 44, paddingBottom: 44 }}>
        <div className="tg rv">
          {TRUST.map(({ Icon, title, desc }) => (
            <div key={title} className="tbadge">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6, color: "var(--leaf2)" }}>
                <Icon size={26} strokeWidth={2.2} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--cream)" }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--mist)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
