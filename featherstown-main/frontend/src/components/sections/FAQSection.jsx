import { useState } from "react";
import { Leaf } from "../ui/Icons";
import { useSettings } from "../../context/SettingsContext";

export default function FAQSection({ standalone = false }) {
  const { settings } = useSettings();
  const faqs = Array.isArray(settings?.faqs) ? settings.faqs : [];
  const [openFaq, setFaq] = useState(null);

  if (faqs.length === 0) return null;

  return (
    <section
      className="sp"
      style={{ background: "var(--j1)", position: "relative", overflow: "hidden" }}
    >
      <Leaf style={{ width: 120, top: "5%", left: "-1%", transform: "rotate(-10deg)" }} />
      <Leaf style={{ width: 95, bottom: "5%", right: "1%", transform: "rotate(18deg)" }} />

      {!standalone && (
        <div className="rv" style={{ textAlign: "center", marginBottom: 44 }}>
          <span className="stag">Got Questions?</span>
          <h2
            style={{
              fontFamily: "var(--font-d)",
              fontSize: "clamp(24px,3.8vw,50px)",
              fontWeight: 500,
              color: "var(--cream)",
              marginTop: 10,
              marginBottom: 12,
            }}
          >
            Frequently Asked{" "}
            <span style={{ color: "var(--leaf)", fontStyle: "italic" }}>Questions</span>
          </h2>
          <p
            style={{
              color: "var(--fog)",
              fontSize: 14.5,
              lineHeight: 1.85,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Everything you need to know before bringing your new feathered friend home.
          </p>
        </div>
      )}

      <div style={{ maxWidth: 740, margin: "0 auto" }}>
        {faqs.map((f, i) => {
          const isOpen = openFaq === i;
          return (
            <div
              key={f.id || i}
              className="rv"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                transitionDelay: `${i * 50}ms`,
              }}
            >
              {/* Question button */}
              <button
                onClick={() => setFaq(isOpen ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  padding: "20px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--cream)",
                  fontFamily: "var(--font-b)",
                  fontSize: 15.5,
                  fontWeight: 500,
                  textAlign: "left",
                  lineHeight: 1.5,
                }}
              >
                <span>{f.q}</span>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: 24,
                    fontWeight: 300,
                    color: "var(--leaf)",
                    lineHeight: 1,
                    transition: "transform 0.35s ease",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>

              {/* Answer — inline max-height toggle */}
              <div
                style={{
                  maxHeight: isOpen ? "400px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    paddingBottom: 20,
                    color: "var(--fog)",
                    fontSize: 14.5,
                    lineHeight: 1.85,
                  }}
                >
                  {f.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}