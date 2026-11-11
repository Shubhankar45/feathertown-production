/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Value Proposition Trust Strip
   /components/sections/TrustStrip.jsx

   Directly modeled on the reference design:
   - 4 horizontal trust badges on clean Oat Milk canvas
   - Minimal Lucide line icons
   - 100% responsive grid (4 columns on desktop, 2x2 on tablet/mobile)
   - Zero old dark classes, completely clean styling
═══════════════════════════════════════════════════════════════ */
import { Truck, ShieldCheck, RotateCcw, Heart } from "lucide-react";

const VALUE_PROPS = [
  {
    icon: Truck,
    title: "Free Shipping",
    subtitle: "On all orders over ₹999",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    subtitle: "100% safe & encrypted checkout",
  },
  {
    icon: RotateCcw,
    title: "Health Guarantee",
    subtitle: "48-hour veterinary backed check",
  },
  {
    icon: Heart,
    title: "Trusted by Bird Parents",
    subtitle: "10,000+ happy companion flocks",
  },
];

export default function TrustStrip() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        padding: "clamp(36px, 5vw, 56px) clamp(16px, 4.5vw, 64px)",
        background: "#FAF8F5",
        borderTop: "1px solid #E2DDD3",
        borderBottom: "1px solid #E2DDD3",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
      aria-label="Store Guarantees"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: "clamp(20px, 3vw, 32px)",
          alignItems: "center",
        }}
      >
        {VALUE_PROPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#EAF2EC",
                  border: "1px solid #CCE0D0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B3B22",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} strokeWidth={2.2} />
              </div>

              <div>
                <h4
                  style={{
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: "#152B17",
                    margin: "0 0 2px 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#736B5E",
                    margin: 0,
                  }}
                >
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
