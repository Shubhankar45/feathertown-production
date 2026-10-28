import { useBirds } from "../context/BirdsContext";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import BirdsShowcase from "../components/sections/BirdsShowcase";

export default function BirdsPage() {
  const { birds } = useBirds();

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Companion Birds &amp; Parrots for Sale in India | FeatherTown"
        description="Browse certified healthy, hand-tamed companion parrots including Sun Conures, Cockatiels, African Grey, and Macaws with nationwide doorstep delivery."
      />

      <PageBanner
        eyebrow="Our Aviary Collection"
        title="Companion"
        accent="Birds &amp; Parrots"
        desc="Hand-fed, human-socialized, and vet-screened companion birds ready for loving families."
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        <BirdsShowcase parrots={birds} standalone />
      </div>
    </div>
  );
}
