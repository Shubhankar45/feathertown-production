import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import Reviews from "../components/sections/Reviews";

export default function ReviewsPage() {
  return (
    <div style={{ background: "#F7F5F0", color: "#152B17", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Customer Reviews &amp; Testimonials | FeatherTown"
        description="Read verified ratings and heartfelt reviews from 5,000+ bird parents who bought companion parrots and accessories from FeatherTown."
      />

      <PageBanner
        eyebrow="Verified Testimonials"
        title="What Bird Parents"
        accent="Say"
        desc="Real feedback from families who welcomed FeatherTown parrots and accessories into their homes."
      />

      <Reviews standalone />
    </div>
  );
}
