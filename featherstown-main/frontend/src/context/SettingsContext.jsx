import { createContext, useContext, useState, useEffect, useCallback } from "react";

const DEFAULT_SETTINGS = {
  // Store info
  phone: "+91 95567 47518",
  whatsapp: "919556747518",
  email: "care@feathertown.online",
  address: "FeatherTown Aviary, Sundargarh, Odisha 770001, India",
  businessHours: "Mon - Sun: 9:00 AM - 8:00 PM IST",
  instagramUrl: "https://www.instagram.com/feather_town__?igsh=MWV2ZXdqbzlidmk4aw==",
  facebookUrl: "",
  youtubeUrl: "",
  // Announcement
  announcementText: "🦜 Certified healthy hand-tamed companion birds & organic supplies across India. WhatsApp support 7 days a week.",
  announcementActive: true,
  // Shipping
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  // Hero Section
  heroTitle: "Everything for their best life",
  heroSubtitle: "Premium hand-tamed parrots, healthy organic treats, and cozy custom habitats for conures, macaws, cockatiels, lovebirds & more.",
  heroBadgeText: "Certified Avian Aviary",
  heroFeatures: [
    "100% Hand-Fed & Tamed",
    "Certified Vet Checked",
    "Free Lifetime Advice",
  ],
  heroCtaText: "Browse Parrots",
  heroCtaLink: "/birds",
  heroSecondaryCtaText: "Explore Cages & Food",
  heroSecondaryCtaLink: "/accessories",
  // Promo Banners
  promoBanners: [
    {
      id: "banner-1",
      title: "Save More, Love More",
      subtitle: "Up to 20% off starter cages, flight harness & daily seed bundles.",
      link: "/accessories?category=Bundles",
      buttonText: "Shop Bundles",
      bgGradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      active: true,
    },
    {
      id: "banner-2",
      title: "Treats They'll Love",
      subtitle: "Handmade organic foraging toys & healthy seed sticks from ₹199.",
      link: "/accessories?category=Food",
      buttonText: "Explore Treats",
      bgGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      active: true,
    },
  ],
  // Species / Shop By Pet
  petCategories: [
    {
      id: "pet-1",
      name: "Sun Conures",
      tagline: "Vibrant & Playful",
      bg: "#FFEDD5",
      accent: "#C2410C",
      image: "/assets/Sun-conure.jfif",
      link: "/birds?category=Conure",
    },
    {
      id: "pet-2",
      name: "Cockatiels",
      tagline: "Gentle Whistlers",
      bg: "#FEF3C7",
      accent: "#B45309",
      image: "/assets/cocketail.jpg",
      link: "/birds?category=Cockatiel",
    },
    {
      id: "pet-3",
      name: "African Grey",
      tagline: "Genius Talkers",
      bg: "#DCFCE7",
      accent: "#15803D",
      image: "/assets/african.png",
      link: "/birds?category=African%20Grey",
    },
    {
      id: "pet-4",
      name: "Macaws",
      tagline: "Majestic & Loyal",
      bg: "#E0F2FE",
      accent: "#0369A1",
      image: "/assets/macaw.png",
      link: "/birds?category=Macaw",
    },
    {
      id: "pet-5",
      name: "Green Cheek",
      tagline: "Cuddle Lovers",
      bg: "#F3E8FF",
      accent: "#7E22CE",
      image: "/assets/green.jpg",
      link: "/birds?category=Conure",
    },
    {
      id: "pet-6",
      name: "Pineapple Conure",
      tagline: "Sweet & Cheerful",
      bg: "#FCE7F3",
      accent: "#BE185D",
      image: "/assets/pineapple.jpeg",
      link: "/birds?category=Conure",
    },
  ],
  // Featured Collections
  featuredCollections: [
    {
      id: "col-1",
      title: "Cozy Habitats & Cages",
      subtitle: "Create the perfect home",
      icon: "🏠",
      emoji: "🏰",
      link: "/accessories?category=Cages",
      bgGradient: "linear-gradient(135deg, #1E3A8A 0%, #0369A1 100%)",
      accent: "#38BDF8",
    },
    {
      id: "col-2",
      title: "Nutritious Food & Treats",
      subtitle: "Healthy, organic & delicious",
      icon: "🌾",
      emoji: "🥜",
      link: "/accessories?category=Food",
      bgGradient: "linear-gradient(135deg, #78350F 0%, #D97706 100%)",
      accent: "#FDE68A",
    },
    {
      id: "col-3",
      title: "Toys & Enrichment",
      subtitle: "Fun, foraging & mental exercise",
      icon: "🧩",
      emoji: "🪅",
      link: "/accessories?category=Toys",
      bgGradient: "linear-gradient(135deg, #831843 0%, #DB2777 100%)",
      accent: "#FBCFE8",
    },
    {
      id: "col-4",
      title: "Bedding & Hygiene",
      subtitle: "Clean, fresh, safe & odor-free",
      icon: "🌿",
      emoji: "🧼",
      link: "/accessories?category=Bedding",
      bgGradient: "linear-gradient(135deg, #14532D 0%, #15803D 100%)",
      accent: "#86EFAC",
    },
  ],
  // Habitat Essentials
  habitatEssentials: [
    { id: "ess-1", icon: "💧", label: "Water Drinkers", link: "/accessories?category=Waterers" },
    { id: "ess-2", icon: "🪵", label: "Natural Perches", link: "/accessories?category=Perches" },
    { id: "ess-3", icon: "🌾", label: "Seed Blends", link: "/accessories?category=Food" },
    { id: "ess-4", icon: "🪜", label: "Swings & Ladders", link: "/accessories?category=Toys" },
    { id: "ess-5", icon: "🥣", label: "Feeding Bowls", link: "/accessories?category=Bowls" },
    { id: "ess-6", icon: "🧼", label: "Hygiene Care", link: "/accessories?category=Hygiene" },
  ],
  // Care Guides
  careGuides: [
    {
      id: "cg-1",
      title: "New Bird Checklist",
      desc: "Everything you need before bringing home your first feathered family member.",
      bg: "#EFF6FF",
      image: "/assets/Sun-conure.jfif",
      readTime: "4 min read",
      link: "/contact",
    },
    {
      id: "cg-2",
      title: "Conure Nutrition 101",
      desc: "Balanced seed-to-pellet ratio, safe fruits, and plumage vitality guidelines.",
      bg: "#FEF3C7",
      image: "/assets/green.jpg",
      readTime: "5 min read",
      link: "/contact",
    },
    {
      id: "cg-3",
      title: "Parrot Bonding & Trust",
      desc: "Gentle step-up training, head scratches, and human-friendly socialization.",
      bg: "#DCFCE7",
      image: "/assets/african.png",
      readTime: "6 min read",
      link: "/contact",
    },
    {
      id: "cg-4",
      title: "Bird Housing & Safety",
      desc: "Optimal cage dimensions, bar spacing, perch placement, and sun exposure.",
      bg: "#FEE2E2",
      image: "/assets/cocketail.jpg",
      readTime: "4 min read",
      link: "/contact",
    },
  ],
  // FAQs
  faqs: [
    {
      id: "faq-1",
      q: "Are your parrots hand-fed from birth?",
      a: "Yes, every parrot we raise is hand-fed from hatch. This makes them exceptionally tame, social, and comfortable with human interaction from day one.",
    },
    {
      id: "faq-2",
      q: "What species do you currently have available?",
      a: "We stock a rotating selection including African Greys, Cockatiels, Lovebirds, Conures, and more. Use our birds filter to see what's currently listed.",
    },
    {
      id: "faq-3",
      q: "Do you provide training support after purchase?",
      a: "Absolutely. Every purchase includes one-to-one WhatsApp guidance from our experts for the lifetime of your bird — from diet and taming to health checks and behaviour.",
    },
    {
      id: "faq-4",
      q: "Can I request a breed not listed?",
      a: "Yes! Contact us on WhatsApp and we'll do our best to source it. We're continually expanding our collection and love taking requests.",
    },
    {
      id: "faq-5",
      q: "Do you offer delivery or in-person pickup only?",
      a: "Currently we operate from Bhubaneswar & Sundargarh, Odisha. Local pickup is welcomed, and we coordinate safe verified bird transport options across major regions.",
    },
    {
      id: "faq-6",
      q: "What does the price include?",
      a: "The listed price covers the certified healthy bird, starter diet advice, care guide, and lifetime WhatsApp support.",
    },
  ],
  // About Page & Section
  aboutTagline: "Small Pets, Big Love",
  aboutTitle: "Redefining Companion Bird Care Across India",
  aboutStory: "FeatherTown was founded in Sundargarh, Odisha, out of a profound passion for intelligent, emotionally rich companion birds. We go beyond selling birds: every parrot is raised with family love, socialized with patience, and supported with lifetime care.",
  aboutMission: "To empower every bird parent in India with authentic aviary-raised healthy companion parrots, scientifically balanced organic nutrition, safe spacious habitats, and lifelong behavioral guidance.",
  aboutCards: [
    {
      id: "about-1",
      icon: "🦜",
      title: "Our Services",
      color: "#22c55e",
      items: [
        "Healthy & Verified Selling",
        "Personalised Diet Guide",
        "Bird Taming & Training",
        "Complete Care Guidance",
        "24/7 WhatsApp Support",
      ],
    },
    {
      id: "about-2",
      icon: "🏆",
      title: "Why Choose Us?",
      color: "#e8b050",
      body: "We focus on ethical bird care, proper training, and long-term support. Our goal is not just selling birds but helping you build a genuine bond with your pet.",
    },
    {
      id: "about-3",
      icon: "🚀",
      title: "Future Plans",
      color: "#a088ee",
      body: "We will be adding more breeds and bird-related products soon. You can also request specific breeds — we'll try our best to make them available.",
    },
    {
      id: "about-4",
      icon: "📸",
      title: "Reviews & Videos",
      color: "#60b0e0",
      body: "Multiple happy customers and a growing community. Visit our Instagram page to see real bird videos, reviews, and daily updates.",
      link: {
        href: "https://www.instagram.com/feather_town__?igsh=MWV2ZXdqbzlidmk4aw==",
        label: "Visit Instagram →",
      },
    },
  ],
  // Product Categories
  birdCategories: [
    "Conure",
    "Cockatiel",
    "African Grey",
    "Macaw",
    "Lovebird",
    "Parakeet",
    "Amazon",
    "Cockatoo",
  ],
  accessoryCategories: [
    "Cages",
    "Food",
    "Toys",
    "Perches",
    "Waterers",
    "Bedding",
    "Grooming",
    "Health",
  ],
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      if (data && typeof data === "object") {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch (err) {
      console.warn("Could not load dynamic settings, using default store config:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
