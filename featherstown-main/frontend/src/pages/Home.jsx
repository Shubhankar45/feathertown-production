import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useBirds } from "../context/BirdsContext";
import SEOHead from "../components/SEOHead";
import ModernHero from "../components/sections/ModernHero";
import CategoryPills from "../components/sections/CategoryPills";
import BestSellers from "../components/sections/BestSellers";
import PromoBanners from "../components/sections/PromoBanners";
import FeaturedBreeds from "../components/sections/FeaturedBreeds";
import BirdQuiz from "../components/Quiz/BirdQuiz";
import TrustStrip from "../components/sections/TrustStrip";
import Newsletter from "../components/sections/Newsletter";
import ChatAssistant from "../components/ChatAssistant/ChatAssistant";

export default function Home() {
  const { birds } = useBirds();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/quiz" || location.pathname === "/find-your-bird" || location.hash === "#quiz") {
      const timer = setTimeout(() => {
        const el = document.getElementById("quiz");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  return (
    <div
      style={{
        background: "#FAF8F5",
        color: "#152B17",
        fontFamily: "Outfit, system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      <SEOHead
        title="FeatherTown | Premium Companion Birds, Cages & Avian Supplies in India"
        description="FeatherTown is India's leading ethical avian marketplace. Certified healthy hand-tamed conures, macaws, cockatiels, premium cages, toys, and organic seed blends with fast nationwide delivery."
      />

      {/* 1. Hero Section (Matches Reference: "Everything Your Bird Needs", "Shop Now →", 3 Trust Chips, Badge) */}
      <ModernHero />

      {/* 2. Circular Category Quick-Pills (Matches Reference: 9 Circular Pastel Pills) */}
      <CategoryPills />

      {/* 3. Best Selling Products (Matches Reference: 4-Column Grid with Circular Add-to-Cart Buttons) */}
      <BestSellers />

      {/* 4. Dual Promotional Split Banners (Matches Reference: Peach & Mint Dual Cards) */}
      <PromoBanners />

      {/* 5. Featured Companion Birds (Matches Reference Seasonal Collection: 4 Curated Photo Cards with Chevrons) */}
      <FeaturedBreeds />

      {/* 6. Which Bird Suits You? Quiz (Cleanly integrated avian compatibility matchmaker) */}
      <div
        id="quiz"
        style={{
          background: "#FAF8F5",
          borderTop: "1px solid #E2DDD3",
          padding: "clamp(48px, 6vw, 84px) clamp(16px, 4.5vw, 64px)",
        }}
      >
        <BirdQuiz parrots={birds} />
      </div>

      {/* 7. Value Proposition Trust Strip (Matches Reference: 4 Horizontal Trust Cards) */}
      <TrustStrip />

      {/* 8. Newsletter Strip (Matches Reference: "Join Our Flock!", Inline Input + Subscribe Button) */}
      <Newsletter />

      {/* Avian Care AI Assistant */}
      <ChatAssistant parrots={birds} />
    </div>
  );
}
