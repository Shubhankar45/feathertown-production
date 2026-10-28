/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Modern Clean Editorial Bird Recommendation Quiz
   /components/Quiz/BirdQuiz.jsx
   
   Design Style:
   - Bright warm cream & ivory canvas (#FAF8F5)
   - Cormorant Garamond serif headings with elegant italics
   - Deep forest (#1A3826) and warm stone (#44403C) palette
   - Clean architectural borders (#E7E3DC) & high-fashion layout
   - Zero side-margin blank space, responsive 2-column split
═══════════════════════════════════════════════════════════════ */
import { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { rankParrots } from "../../utils/recommendation";
import { useSettings } from "../../context/SettingsContext";
import { resolveBirdImage } from "../../context/BirdsContext";

/* ─── WhatsApp helper ────────────────────────────────────────── */
const getWALink = (birdName, waNum = "919556747518") => {
  const clean = (waNum || "919556747518").replace(/\D/g, "");
  const text = encodeURIComponent(
    `Hi FeatherTown! I completed the Avian Compatibility Quiz and matched with the ${birdName}. Is this bird available for adoption?`
  );
  return `https://wa.me/${clean}?text=${text}`;
};

/* ─── Quiz steps definition ─────────────────────────────────── */
const STEPS = [
  {
    id: "budget",
    num: "01",
    question: "What is your allocated budget?",
    subtitle: "We only showcase birds within your financial stewardship zone.",
    type: "stacked",
    options: [
      { label: "Under ₹3,000", desc: "Gentle entry companions (Lovebirds, Budgies)", value: 3000 },
      { label: "₹3,000 – ₹8,000", desc: "Popular companion sweet spot (Cockatiels, Conures)", value: 8000 },
      { label: "₹8,000 – ₹20,000", desc: "Specialty color mutations & tame exotic conures", value: 20000 },
      { label: "₹20,000 – ₹50,000", desc: "Exotic large parrots & master talkers (African Grey)", value: 50000 },
      { label: "No limit", desc: "Evaluate all matching birds regardless of reserve", value: 999999 },
    ],
  },
  {
    id: "noise",
    num: "02",
    question: "What vocal volume suits your home?",
    subtitle: "Essential consideration for apartments, flats, and tranquil spaces.",
    type: "grid",
    options: [
      { label: "Whisper quiet 🤫", desc: "Soft morning melodies, delicate chirps, apartment safe", value: "Low" },
      { label: "Gentle chatter 🗣️", desc: "Cheerful whistling, playful tunes, moderate vocalizing", value: "Medium" },
      { label: "Vocal & lively 🎺", desc: "Energetic loud calls, mimicry, commanding joyful presence", value: "High" },
    ],
  },
  {
    id: "experience",
    num: "03",
    question: "What is your experience with birds?",
    subtitle: "Ensures we pair an easy-going temperament suited to your handling.",
    type: "grid",
    options: [
      { label: "Beginner 🌱", desc: "First-time bird parent seeking a gentle, patient bird", value: "Beginner" },
      { label: "Intermediate 🐦", desc: "Prior avian experience, confident with training & care", value: "Intermediate" },
      { label: "Seasoned Keeper 🦅", desc: "Experienced keeper ready for complex social needs", value: "Expert" },
    ],
  },
  {
    id: "purpose",
    num: "04",
    question: "What trait matters most to you?",
    subtitle: "Select the primary bond you wish to cultivate with your bird.",
    type: "grid",
    options: [
      { label: "Vocal Artistry & Mimicry 🗨️", desc: "Loves vocabulary, spoken phrases & whistle melodies", value: "Talking" },
      { label: "Affectionate Companion 🤗", desc: "Shoulder perching, head scritches & calm companionship", value: "Friendly" },
      { label: "Spectacular Showpiece 💎", desc: "Breathtaking plumage, acrobatic energy & joyful charm", value: "Decorative" },
    ],
  },
  {
    id: "space",
    num: "05",
    question: "Describe your living sanctuary.",
    subtitle: "Larger species require ample wingspan flight space and room.",
    type: "grid",
    options: [
      { label: "Apartment / Urban Flat 🏢", desc: "Indoor cage footprint with neighbor-conscious noise", value: "Apartment" },
      { label: "Spacious House & Aviary 🏡", desc: "Room for large flight aviaries and active playtime", value: "House" },
    ],
  },
  {
    id: "time",
    num: "06",
    question: "Daily time available for interaction?",
    subtitle: "Companion parrots are social flock creatures requiring attention.",
    type: "grid",
    options: [
      { label: "Moderate (30–60 mins/day) ⏱️", desc: "Independent companion content with enrichment toys", value: "Low" },
      { label: "Devoted (2+ hours/day) 🏠", desc: "Hands-on bonding, free-flight training & cuddling", value: "High" },
    ],
  },
];

/* ─── Editorial Quiz Styles ──────────────────────────────────── */
const quizEditorialStyles = `
@keyframes edFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes edScaleIn {
  from { opacity: 0; transform: scale(0.97) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.ed-quiz-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
}
@media (min-width: 960px) {
  .ed-quiz-layout {
    display: grid;
    grid-template-columns: minmax(320px, 420px) 1fr;
    gap: 48px;
    align-items: start;
  }
}

.ed-quiz-box {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.06);
  padding: clamp(24px, 4vw, 40px);
  width: 100%;
  position: relative;
}

.ed-quiz-opt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
  border-radius: 14px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  cursor: pointer;
  text-align: left;
  font-family: 'Outfit', sans-serif;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}
.ed-quiz-opt:hover {
  border-color: #059669;
  background: #ECFDF5;
  transform: translateY(-2px);
}
.ed-quiz-opt.active {
  background: #ECFDF5;
  border-color: #059669;
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.12);
}

.ed-radio-mark {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #CBD5E1;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.ed-quiz-opt.active .ed-radio-mark {
  background: #059669;
  border-color: #059669;
}

.ed-btn-next {
  background: linear-gradient(135deg, #F97316, #EA580C);
  color: #FFFFFF;
  border: none;
  padding: 12px 26px;
  border-radius: 999px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.22s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
}
.ed-btn-next:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.45);
}
.ed-btn-next:disabled {
  background: #F1F5F9;
  color: #94A3B8;
  cursor: not-allowed;
  box-shadow: none;
}

.ed-btn-back {
  background: #FFFFFF;
  color: #475569;
  border: 1.5px solid #CBD5E1;
  padding: 13px 22px;
  border-radius: 999px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ed-btn-back:hover:not(:disabled) {
  border-color: #059669;
  color: #059669;
  background: #ECFDF5;
}
.ed-btn-back:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
`;

export default function BirdQuiz({ parrots = [] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [ranked, setRanked] = useState(null);
  const [showOthers, setShowOthers] = useState(false);
  const { settings } = useSettings();

  const currentStep = STEPS[step];

  const selectOption = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        const results = rankParrots(parrots, answers);
        try {
          localStorage.setItem("ft_quiz_answers", JSON.stringify(answers));
        } catch (_) {}
        setRanked(results);
        setLoading(false);
      }, 950);
    }
  }, [step, answers, parrots]);

  const goBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const reset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setRanked(null);
    setLoading(false);
  }, []);

  const canNext = Boolean(answers[currentStep?.id]);
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  const top = ranked?.[0];
  const topImg = top ? resolveBirdImage(top.parrot.image) : "";
  const birdSlug = top ? (top.parrot.slug || top.parrot.id || top.parrot.name?.toLowerCase().replace(/\s+/g, "-")) : "";

  return (
    <section
      id="quiz"
      style={{
        background: "#F8FAFC",
        padding: "clamp(52px, 7vh, 88px) clamp(16px, 4vw, 64px)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        fontFamily: "'Outfit', sans-serif",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      <style>{quizEditorialStyles}</style>

      {/* When Results are Ready: Companion Reveal */}
      {ranked && top ? (
        <div style={{ width: "100%", animation: "edFadeUp 0.4s ease both" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#059669",
                marginBottom: 8,
              }}
            >
              🎉 Perfect Compatibility Match Found
            </div>
            <h2
              style={{
                fontFamily: "Outfit, system-ui, sans-serif",
                fontSize: "clamp(26px, 3.8vw, 42px)",
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Your Ideal{" "}
              <span style={{ color: "#16A34A" }}>Feathered</span>{" "}
              <span style={{ color: "#EA580C" }}>Companion</span>
            </h2>
          </div>

          {/* Winner Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #FED7AA",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 10px 32px rgba(15, 23, 42, 0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              alignItems: "stretch",
              marginBottom: 28,
            }}
          >
            {/* Left: Gallery Cutout Photo */}
            <div
              style={{
                background: "linear-gradient(145deg, #F8FAFC 0%, #FFF7ED 100%)",
                padding: "36px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                minHeight: 320,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  background: "#FFF7ED",
                  color: "#EA580C",
                  border: "1px solid #FED7AA",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {top.score}% Compatibility
              </div>

              <img
                src={topImg}
                alt={top.parrot.name}
                style={{
                  maxWidth: "88%",
                  maxHeight: 280,
                  objectFit: "contain",
                  filter: "drop-shadow(0 12px 20px rgba(15, 23, 42, 0.15))",
                }}
              />
            </div>

            {/* Right: Editorial Profile Details */}
            <div
              style={{
                padding: "clamp(24px, 4vw, 36px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#64748B" }}>
                    Curated Avian Pair
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
                    {top.parrot.price}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(28px, 3.5vw, 40px)",
                    fontWeight: 600,
                    color: "#0F172A",
                    lineHeight: 1.1,
                    marginBottom: 10,
                  }}
                >
                  {top.parrot.name}
                </h3>

                {/* Compatibility Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                  <div style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, color: "#334155" }}>
                    🏠 {answers.space || "Apartment Friendly"}
                  </div>
                  <div style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, color: "#334155" }}>
                    🔊 {answers.noise || "Low"} Noise
                  </div>
                  <div style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, color: "#334155" }}>
                    🎓 {answers.experience || "Beginner Friendly"}
                  </div>
                </div>

                {/* Avian Reason */}
                <div
                  style={{
                    borderLeft: "2px solid #059669",
                    paddingLeft: 14,
                    marginBottom: 24,
                  }}
                >
                  <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
                    &ldquo;{top.reason}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to={`/breed/${birdSlug}`} className="ed-btn-next" style={{ textDecoration: "none", flex: "1 1 auto" }}>
                  <span>View Breed Profile &rarr;</span>
                </Link>

                <a
                  href={getWALink(top.parrot.name, settings?.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="ed-btn-back"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <span>Inquire on WhatsApp 💬</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 18 }}>
            <button type="button" onClick={reset} className="ed-btn-back">
              &larr; Retake Compatibility Quiz
            </button>
            <Link to="/birds" style={{ fontSize: 13, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
              Explore Full Aviary Catalog &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* Full-Width 2-Column Split Question Stepper */
        <div className="ed-quiz-layout">
          {/* Left Column: Editorial Guidance & Live Spec Tracker */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#059669",
                  marginBottom: 10,
                }}
              >
                🎯 60-Second Match &bull; Question {currentStep.num} of 06
              </div>

              <h2
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: 1.15,
                  marginBottom: 12,
                }}
              >
                Which Companion Is{" "}
                <span style={{ color: "#059669" }}>Right for You?</span>
              </h2>

              <p style={{ fontSize: 14.5, color: "#64748B", lineHeight: 1.65, margin: 0 }}>
                Answer 6 lifestyle criteria. Our aviary specialists pair your space, routine, budget, and handling ease with healthy captive-bred companion birds.
              </p>
            </div>

            {/* Live Criteria Spec Sheet */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "20px",
                padding: "20px 22px",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#059669", marginBottom: 14 }}>
                Active Match Parameters:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Budget:</span>
                  <span style={{ fontWeight: 700, color: answers.budget ? "#0F172A" : "#94A3B8" }}>
                    {answers.budget ? (answers.budget >= 999999 ? "No limit" : `Under ₹${answers.budget.toLocaleString()}`) : "Pending"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Vocal Volume:</span>
                  <span style={{ fontWeight: 700, color: answers.noise ? "#0F172A" : "#94A3B8" }}>
                    {answers.noise || "Pending"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Experience:</span>
                  <span style={{ fontWeight: 700, color: answers.experience ? "#0F172A" : "#94A3B8" }}>
                    {answers.experience || "Pending"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B" }}>Living Space:</span>
                  <span style={{ fontWeight: 700, color: answers.space ? "#0F172A" : "#94A3B8" }}>
                    {answers.space || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Question Card */}
          <div className="ed-quiz-box">
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 16px", animation: "edFadeUp 0.3s ease both" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontStyle: "italic", color: "#059669", marginBottom: 8 }}>
                  Calculating Ideal Companion Pair...
                </div>
                <p style={{ fontSize: 13.5, color: "#64748B", maxWidth: 360, margin: "0 auto" }}>
                  Evaluating temperament profiles and nursery records across {parrots.length || "our"} companion breeds.
                </p>
              </div>
            ) : (
              <div key={step} style={{ animation: "edScaleIn 0.3s ease both" }}>
                {/* Stepper Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#059669",
                    }}
                  >
                    Criteria {currentStep.num} / 06
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>
                    {pct}% Completed
                  </span>
                </div>

                {/* Delicate Progress Line */}
                <div style={{ height: 3, background: "#F1F5F9", borderRadius: 999, overflow: "hidden", marginBottom: 24, position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      background: "#10B981",
                      width: `${pct}%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                {/* Question */}
                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: "clamp(24px, 3.2vw, 32px)",
                      fontWeight: 600,
                      color: "#0F172A",
                      lineHeight: 1.15,
                      marginBottom: 6,
                    }}
                  >
                    {currentStep.question}
                  </h3>
                  <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                    {currentStep.subtitle}
                  </p>
                </div>

                {/* Options List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {currentStep.options.map((opt) => {
                    const isSelected = answers[currentStep.id] === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        className={`ed-quiz-opt${isSelected ? " active" : ""}`}
                        onClick={() => selectOption(currentStep.id, opt.value)}
                      >
                        <div>
                          <div style={{ fontSize: 14.5, fontWeight: 700, color: isSelected ? "#059669" : "#0F172A" }}>
                            {opt.label}
                          </div>
                          {opt.desc && (
                            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                              {opt.desc}
                            </div>
                          )}
                        </div>

                        <div className="ed-radio-mark">
                          {isSelected && (
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFFFFF" }} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <button type="button" onClick={goBack} disabled={step === 0} className="ed-btn-back">
                    &larr; Previous
                  </button>

                  <button type="button" onClick={goNext} disabled={!canNext} className="ed-btn-next" style={{ flex: 1 }}>
                    {step === STEPS.length - 1 ? "Reveal Compatible Companion &rarr;" : "Next Step &rarr;"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}