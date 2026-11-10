import { useBirds } from "../context/BirdsContext";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import CompareSection from "../components/sections/CompareSection";

export default function ComparePage() {
  const { birds } = useBirds();

  return (
    <div style={{ background: "#F7F5F0", color: "#152B17", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Compare Parrot Breeds Side-by-Side | FeatherTown"
        description="Compare Conures, Cockatiels, African Grey, and Macaws on noise level, talking ability, lifespan, care difficulty, and price."
      />

      <PageBanner
        eyebrow="Side by Side"
        title="Compare"
        accent="Species"
        desc="Select up to 3 birds and evaluate their noise level, talking ability, diet, and lifespan head-to-head."
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        <CompareSection parrots={birds} standalone />
      </div>
    </div>
  );
}
