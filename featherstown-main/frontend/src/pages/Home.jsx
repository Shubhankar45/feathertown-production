import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useBirds } from "../context/BirdsContext";
import SEOHead from "../components/SEOHead";
import ModernHero from "../components/sections/ModernHero";
import AboutBirdSection from "../components/sections/AboutBirdSection";
import ExploreVideoSection from "../components/sections/ExploreVideoSection";
import ShopByPet from "../components/sections/ShopByPet";
import CommunityPhotos from "../components/sections/CommunityPhotos";
import FeaturedCollections from "../components/sections/FeaturedCollections";
import BirdEssentials from "../components/sections/BirdEssentials";
import BestSellers from "../components/sections/BestSellers";
import CareGuides from "../components/sections/CareGuides";
import PromoBanners from "../components/sections/PromoBanners";
import Reviews from "../components/sections/Reviews";
import Newsletter from "../components/sections/Newsletter";
import BirdQuiz from "../components/Quiz/BirdQuiz";
import ChatAssistant from "../components/ChatAssistant/ChatAssistant";

export default function Home() {
  const { birds } = useBirds();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/quiz" || location.pathname === "/find-your-bird") {
      const timer = setTimeout(() => {
        const el = document.getElementById("quiz");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="FeatherTown | Buy Healthy Hand-Tamed Parrots & Bird Supplies Online in India"
        description="FeatherTown is India's leading ethical avian marketplace. Certified healthy hand-tamed conures, macaws, cockatiels, premium cages, toys, and organic seed blends with fast nationwide delivery."
      />

      {/* 1. Hero Section (Matches Reference Hero with Perched Sun Conure & Mint Card) */}
      <ModernHero />

      {/* 2. About Section (Matches Reference Section 2 with Flying Emerald Hummingbird) */}
      <AboutBirdSection />

      {/* 3. Explore Existing Birds / Aviary Preview (Matches Reference Section 3 with Nature Aviary & Play ▶️) */}
      <ExploreVideoSection />

      {/* 4. Birdpedia Species Information (Matches Reference Section 4 with Cutout Bird Cards & Arrows) */}
      <ShopByPet />

      {/* 5. Top Weekly Community Photos (Matches Reference Section 5 with Bento Photo Grid) */}
      <CommunityPhotos />

      {/* 6. Featured Collections (Cages, Diets, Toys) */}
      <FeaturedCollections />

      {/* 7. Habitat & Care Essentials */}
      <BirdEssentials />

      {/* 8. Best Sellers Product Grid */}
      <BestSellers />

      {/* 9. Care Guides & Tips */}
      <CareGuides />

      {/* 10. Promo Banners */}
      <PromoBanners />

      {/* 11. Interactive Compatibility Quiz */}
      <BirdQuiz parrots={birds} />

      {/* 12. Customer Testimonials */}
      <Reviews />

      {/* 13. Newsletter Subscribe Banner */}
      <Newsletter />

      {/* 14. AI Bird Care Chat Assistant */}
      <ChatAssistant parrots={birds} />
    </div>
  );
}
