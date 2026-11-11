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
  announcementText: "Certified healthy hand-tamed companion birds & organic supplies across India. WhatsApp support 7 days a week.",
  announcementActive: true,
  // Shipping
  freeShippingThreshold: 999,
  standardShippingFee: 99,
  // Hero Section
  heroTitle: "Everything Your Bird Needs",
  heroSubtitle: "Premium organic nutrition, spacious habitats, and certified hand-tamed companion birds for happier, healthier flocks.",
  heroBadgeText: "LOVE. CARE. FLOCK.",
  heroFloatingBadge: "Birds Make Life Brighter",
  heroImage: "",
  heroFeatures: [
    "Better Nutrition",
    "Happier Birds",
    "Certified Aviary",
  ],
  heroTrust1: "Better Nutrition",
  heroTrust2: "Happier Birds",
  heroTrust3: "Certified Aviary",
  heroCtaText: "Shop Now",
  heroCtaLink: "/accessories",
  heroSecondaryCtaText: "Browse Birds",
  heroSecondaryCtaLink: "/birds",
  // Featured Birds (Seasonal Collection)
  featuredBreedsTitle: "Featured Companion Birds",
  featuredBreedsSubtitle: "Ethically hand-tamed, DNA tested, and ready for loving homes.",
  featuredBreeds: [
    {
      id: "sun-conure",
      name: "Sun Conure",
      subtitle: "Playful, vibrant & affectionate",
      image: "/assets/birds/crop-sun-conure.jpg",
      link: "/birds",
    },
    {
      id: "cockatiel",
      name: "Cockatiel",
      subtitle: "Gentle whistler & easy to bond",
      image: "/assets/birds/crop-cockatiel.jpg",
      link: "/birds",
    },
    {
      id: "green-cheek",
      name: "Green-Cheek Conure",
      subtitle: "Quiet, compact & apartment safe",
      image: "/assets/birds/crop-green-cheek.jpg",
      link: "/birds",
    },
    {
      id: "african-grey",
      name: "African Grey",
      subtitle: "Remarkable vocabulary & genius IQ",
      image: "/assets/birds/crop-african-grey.jpg",
      link: "/birds",
    },
  ],
  // Promo Banners
  promoBanners: [
    {
      id: "banner-1",
      title: "Play More, Sing More",
      subtitle: "Explore our curated bird toy collection for endless fun!",
      link: "/accessories?category=toys",
      buttonText: "Shop Toys →",
      bgGradient: "#FCEFEA",
      accent: "#D9381E",
      image: "/assets/birds/crop-pineapple-conure.jpg",
      tag: "Foraging & Fun",
      active: true,
    },
    {
      id: "banner-2",
      title: "Healthy Birds, Happier Tomorrows",
      subtitle: "Save up to 30% on select wellness and nutrition essentials.",
      link: "/accessories?category=wellness",
      buttonText: "Shop Wellness →",
      bgGradient: "#EAF2EC",
      accent: "#1B3B22",
      image: "/assets/birds/crop-cockatiel.jpg",
      tag: "Nutrition & Care",
      active: true,
    },
  ],
  // Species / Shop By Pet
  petCategories: [
    {
      id: "pet-1",
      name: "Sun Conures",
      tagline: "Vibrant & Playful",
      bg: "#FAF8F5",
      accent: "#D9381E",
      image: "/assets/Sun-conure.jfif",
      link: "/birds?category=Conure",
    },
    {
      id: "pet-2",
      name: "Cockatiels",
      tagline: "Gentle Whistlers",
      bg: "#FAF8F5",
      accent: "#1B3B22",
      image: "/assets/cocketail.jpg",
      link: "/birds?category=Cockatiel",
    },
    {
      id: "pet-3",
      name: "African Grey",
      tagline: "Genius Talkers",
      bg: "#FAF8F5",
      accent: "#1B3B22",
      image: "/assets/african.png",
      link: "/birds?category=African%20Grey",
    },
    {
      id: "pet-4",
      name: "Macaws",
      tagline: "Majestic & Loyal",
      bg: "#FAF8F5",
      accent: "#1B3B22",
      image: "/assets/macaw.png",
      link: "/birds?category=Macaw",
    },
    {
      id: "pet-5",
      name: "Green Cheek",
      tagline: "Cuddle Lovers",
      bg: "#FAF8F5",
      accent: "#1B3B22",
      image: "/assets/green.jpg",
      link: "/birds?category=Conure",
    },
    {
      id: "pet-6",
      name: "Pineapple Conure",
      tagline: "Sweet & Cheerful",
      bg: "#FAF8F5",
      accent: "#D9381E",
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
      icon: "home",
      emoji: "home",
      link: "/accessories?category=Cages",
      bgGradient: "#FAF8F5",
      accent: "#1B3B22",
    },
    {
      id: "col-2",
      title: "Nutritious Food & Treats",
      subtitle: "Healthy, organic & delicious",
      icon: "wheat",
      emoji: "wheat",
      link: "/accessories?category=Food",
      bgGradient: "#FAF8F5",
      accent: "#1B3B22",
    },
    {
      id: "col-3",
      title: "Toys & Enrichment",
      subtitle: "Fun, foraging & mental exercise",
      icon: "puzzle",
      emoji: "puzzle",
      link: "/accessories?category=Toys",
      bgGradient: "#FAF8F5",
      accent: "#D9381E",
    },
    {
      id: "col-4",
      title: "Bedding & Hygiene",
      subtitle: "Clean, fresh, safe & odor-free",
      icon: "feather",
      emoji: "feather",
      link: "/accessories?category=Bedding",
      bgGradient: "#FAF8F5",
      accent: "#1B3B22",
    },
  ],
  // Habitat Essentials
  habitatEssentials: [
    { id: "ess-1", icon: "droplets", label: "Water Drinkers", link: "/accessories?category=Waterers" },
    { id: "ess-2", icon: "perch", label: "Natural Perches", link: "/accessories?category=Perches" },
    { id: "ess-3", icon: "wheat", label: "Seed Blends", link: "/accessories?category=Food" },
    { id: "ess-4", icon: "ladder", label: "Swings & Ladders", link: "/accessories?category=Toys" },
    { id: "ess-5", icon: "bowl", label: "Feeding Bowls", link: "/accessories?category=Bowls" },
    { id: "ess-6", icon: "hygiene", label: "Hygiene Care", link: "/accessories?category=Hygiene" },
  ],
  // Care Guides
  careGuides: [
    {
      id: "cg-1",
      title: "New Bird Checklist",
      desc: "Everything you need before bringing home your first feathered family member.",
      bg: "#FAF8F5",
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
      icon: "shield",
      title: "Our Services",
      color: "#1B3B22",
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
      icon: "award",
      title: "Why Choose Us?",
      color: "#D9381E",
      body: "We focus on ethical bird care, proper training, and long-term support. Our goal is not just selling birds but helping you build a genuine bond with your pet.",
    },
    {
      id: "about-3",
      icon: "rocket",
      title: "Future Plans",
      color: "#1B3B22",
      body: "We will be adding more breeds and bird-related products soon. You can also request specific breeds — we'll try our best to make them available.",
    },
    {
      id: "about-4",
      icon: "camera",
      title: "Reviews & Videos",
      color: "#D9381E",
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
