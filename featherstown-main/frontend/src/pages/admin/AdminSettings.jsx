/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Store Configuration & Live CMS Admin
   /pages/admin/AdminSettings.jsx

   Provides full administrative control over:
   - Hero Section & Companion Bird Showcase (Image upload, text, badges, CTAs, trust chips)
   - Promotional Split Banners (Images upload, headlines, links, tags)
   - Featured Companion Birds / Seasonal Collection (Photos upload, names, traits, links)
   - Species Quick-Pill Navigation
   - Store Branding, Logo, Helpline, WhatsApp & Shipping rules
   - Top Announcement Bar
   - Collections, Essentials, Care Guides, FAQs & About Page
═══════════════════════════════════════════════════════════════ */
import { useEffect, useState } from "react";
import {
  Save,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Heart,
  Wheat,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Layers,
  HelpCircle,
  Info,
  Phone,
  Megaphone,
} from "lucide-react";
import { adminFetch, adminUpload } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";

const TABS = [
  { id: "hero", label: "Hero & Showcase", icon: Sparkles },
  { id: "promos", label: "Promo Banners", icon: Layers },
  { id: "featured_birds", label: "Featured Birds", icon: Heart },
  { id: "species", label: "Species Cards", icon: Layers },
  { id: "contact", label: "Store, Contact & Logo", icon: Phone },
  { id: "announcement", label: "Announcement Bar", icon: Megaphone },
  { id: "collections", label: "Collections", icon: Layers },
  { id: "essentials", label: "Essentials", icon: Wheat },
  { id: "guides", label: "Care Guides", icon: Info },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
  { id: "about", label: "About Page", icon: Info },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("hero");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await adminFetch("/api/admin/settings");
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        toast.error(err.message || "Failed to load store settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayItemChange = (arrayKey, index, field, value) => {
    setSettings((prev) => {
      const arr = [...(prev[arrayKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [arrayKey]: arr };
    });
  };

  const handleAddArrayItem = (arrayKey, defaultItem) => {
    setSettings((prev) => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || []), defaultItem],
    }));
  };

  const handleRemoveArrayItem = (arrayKey, index) => {
    setSettings((prev) => {
      const arr = [...(prev[arrayKey] || [])];
      arr.splice(index, 1);
      return { ...prev, [arrayKey]: arr };
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        freeShippingThreshold: Number(settings.freeShippingThreshold) || 0,
        standardShippingFee: Number(settings.standardShippingFee) || 0,
      };
      const updated = await adminFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSettings(updated);
      toast.success("Store configuration & Live CMS updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#94A3B8" }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Loading store CMS &amp; settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", marginBottom: 6 }}>
            Storefront CMS &amp; Live Customization
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Control live storefront images, hero showcase, promotional banners, featured birds, and store copy.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            borderRadius: 10,
            background: "#1B3B22",
            color: "#FFFFFF",
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(27, 59, 34, 0.25)",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.2s",
          }}
        >
          <Save size={16} strokeWidth={2.2} />
          <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          background: "#FFFFFF",
          padding: 8,
          borderRadius: 14,
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          marginBottom: 24,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 800 : 500,
                cursor: "pointer",
                border: active ? "1px solid #1B3B22" : "1px solid transparent",
                background: active ? "#1B3B22" : "transparent",
                color: active ? "#FFFFFF" : "#64748B",
                boxShadow: active ? "0 2px 6px rgba(27, 59, 34, 0.18)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {Icon && <Icon size={14} strokeWidth={active ? 2.4 : 1.8} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ══════════════════════════════════════════════════
            TAB 1: HERO SECTION & SHOWCASE
           ══════════════════════════════════════════════════ */}
        {activeTab === "hero" && (
          <div>
            <div style={cardSectionStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                Hero Showcase Image
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                This is the primary high-resolution companion birds image displayed in the full-width hero card.
              </p>

              <ImageUploader
                label="Hero Image URL or File Upload"
                value={settings.heroImage || ""}
                onChange={(val) => handleChange("heroImage", val)}
                placeholder="Upload file or enter URL (Leave blank to use default Companion Birds)"
                previewHeight={90}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 8, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => handleChange("heroImage", "")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: "#F1F5F9",
                    color: "#334155",
                    border: "1px solid #CBD5E1",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={13} strokeWidth={2} />
                  <span>Reset to Default Companion Birds Photo</span>
                </button>
              </div>

              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 20, marginTop: 10 }}>
                <label style={labelStyle}>Floating Circular Badge Text</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input
                    type="text"
                    value={settings.heroFloatingBadge || "Birds Make Life Brighter"}
                    onChange={(e) => handleChange("heroFloatingBadge", e.target.value)}
                    style={inputStyle}
                    placeholder="Birds Make Life Brighter"
                  />
                  <span style={{ fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>
                    (Overlaps top-right corner of hero card)
                  </span>
                </div>
              </div>
            </div>

            <div style={cardSectionStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                Hero Headlines &amp; Editorial Copy
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                Craft the main message and call-to-actions shown on the left side of the hero section.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Eyebrow Pill Badge</label>
                  <input
                    type="text"
                    value={settings.heroBadgeText || "LOVE. CARE. FLOCK."}
                    onChange={(e) => handleChange("heroBadgeText", e.target.value)}
                    style={inputStyle}
                    placeholder="LOVE. CARE. FLOCK."
                  />
                </div>
                <div>
                  <label style={labelStyle}>Main Master Headline</label>
                  <input
                    type="text"
                    value={settings.heroTitle || "Everything Your Bird Needs"}
                    onChange={(e) => handleChange("heroTitle", e.target.value)}
                    style={inputStyle}
                    placeholder="Everything Your Bird Needs"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Hero Subtitle Copy</label>
                <textarea
                  rows={3}
                  value={
                    settings.heroSubtitle ||
                    "Premium organic nutrition, spacious habitats, and certified hand-tamed companion birds for happier, healthier flocks."
                  }
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Describe your value proposition..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Primary CTA Button Text</label>
                  <input
                    type="text"
                    value={settings.heroCtaText || "Shop Now"}
                    onChange={(e) => handleChange("heroCtaText", e.target.value)}
                    style={inputStyle}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Primary CTA Button Destination Link</label>
                  <input
                    type="text"
                    value={settings.heroCtaLink || "/accessories"}
                    onChange={(e) => handleChange("heroCtaLink", e.target.value)}
                    style={inputStyle}
                    placeholder="/accessories"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Secondary Button Text</label>
                  <input
                    type="text"
                    value={settings.heroSecondaryCtaText || "Browse Birds"}
                    onChange={(e) => handleChange("heroSecondaryCtaText", e.target.value)}
                    style={inputStyle}
                    placeholder="Browse Birds"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Secondary Button Destination Link</label>
                  <input
                    type="text"
                    value={settings.heroSecondaryCtaLink || "/birds"}
                    onChange={(e) => handleChange("heroSecondaryCtaLink", e.target.value)}
                    style={inputStyle}
                    placeholder="/birds"
                  />
                </div>
              </div>

              {/* 3 Horizontal Trust Indicators */}
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 18 }}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>
                  3 Hero Trust Chips (Displayed below CTA buttons)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>
                      CHIP 1 (Wheat Icon)
                    </label>
                    <input
                      type="text"
                      value={settings.heroTrust1 || "Better Nutrition"}
                      onChange={(e) => handleChange("heroTrust1", e.target.value)}
                      style={inputStyle}
                      placeholder="Better Nutrition"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>
                      CHIP 2 (Heart Icon)
                    </label>
                    <input
                      type="text"
                      value={settings.heroTrust2 || "Happier Birds"}
                      onChange={(e) => handleChange("heroTrust2", e.target.value)}
                      style={inputStyle}
                      placeholder="Happier Birds"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>
                      CHIP 3 (Shield Icon)
                    </label>
                    <input
                      type="text"
                      value={settings.heroTrust3 || "Certified Aviary"}
                      onChange={(e) => handleChange("heroTrust3", e.target.value)}
                      style={inputStyle}
                      placeholder="Certified Aviary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: PROMOTIONAL SPLIT BANNERS
           ══════════════════════════════════════════════════ */}
        {activeTab === "promos" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                  Promotional Split Banners
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                  Side-by-side promotional highlight banners for Play &amp; Foraging and Wellness &amp; Nutrition.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {(settings.promoBanners || []).map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 14,
                    padding: "20px 22px",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 15 }}>
                      Banner #{idx + 1} — {banner.title || `Promo ${idx + 1}`}
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#166534" }}>
                      <input
                        type="checkbox"
                        checked={banner.active !== false}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "active", e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontWeight: 700 }}>Active</span>
                    </label>
                  </div>

                  <ImageUploader
                    label="Banner Right Image Cutout"
                    value={banner.image || ""}
                    onChange={(val) => handleArrayItemChange("promoBanners", idx, "image", val)}
                    placeholder="Upload image cutout or paste URL"
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Headline</label>
                      <input
                        type="text"
                        value={banner.title || ""}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "title", e.target.value)}
                        style={inputStyle}
                        placeholder="e.g. Play More, Sing More"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Button Label</label>
                      <input
                        type="text"
                        value={banner.buttonText || ""}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "buttonText", e.target.value)}
                        style={inputStyle}
                        placeholder="Shop Toys"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Subtitle Copy</label>
                    <input
                      type="text"
                      value={banner.subtitle || ""}
                      onChange={(e) => handleArrayItemChange("promoBanners", idx, "subtitle", e.target.value)}
                      style={inputStyle}
                      placeholder="Short engaging description..."
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Destination Link</label>
                      <input
                        type="text"
                        value={banner.link || ""}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "link", e.target.value)}
                        style={inputStyle}
                        placeholder="/accessories?category=toys"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Card Background Color / Gradient</label>
                      <input
                        type="text"
                        value={banner.bgGradient || (idx === 0 ? "#FCEFEA" : "#EAF2EC")}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "bgGradient", e.target.value)}
                        style={inputStyle}
                        placeholder="#FCEFEA or #EAF2EC"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: FEATURED BIRDS (SEASONAL COLLECTION)
           ══════════════════════════════════════════════════ */}
        {activeTab === "featured_birds" && (
          <div style={cardSectionStyle}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                Featured Companion Birds (Seasonal Grid)
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
                The 4 curated photos shown on the homepage with high-definition avian photography.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Section Header Title</label>
                  <input
                    type="text"
                    value={settings.featuredBreedsTitle || "Featured Companion Birds"}
                    onChange={(e) => handleChange("featuredBreedsTitle", e.target.value)}
                    style={inputStyle}
                    placeholder="Featured Companion Birds"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Section Subtitle</label>
                  <input
                    type="text"
                    value={
                      settings.featuredBreedsSubtitle ||
                      "Ethically hand-tamed, DNA tested, and ready for loving homes."
                    }
                    onChange={(e) => handleChange("featuredBreedsSubtitle", e.target.value)}
                    style={inputStyle}
                    placeholder="Ethically hand-tamed, DNA tested..."
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {(settings.featuredBreeds || [
                { id: "sun-conure", name: "Sun Conure", subtitle: "Playful, vibrant & affectionate", image: "/assets/birds/crop-sun-conure.jpg", link: "/birds" },
                { id: "cockatiel", name: "Cockatiel", subtitle: "Gentle whistler & easy to bond", image: "/assets/birds/crop-cockatiel.jpg", link: "/birds" },
                { id: "green-cheek", name: "Green-Cheek Conure", subtitle: "Quiet, compact & apartment safe", image: "/assets/birds/crop-green-cheek.jpg", link: "/birds" },
                { id: "african-grey", name: "African Grey", subtitle: "Remarkable vocabulary & genius IQ", image: "/assets/birds/crop-african-grey.jpg", link: "/birds" },
              ]).map((breed, idx) => (
                <div
                  key={breed.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 14,
                    padding: 18,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14.5, marginBottom: 12 }}>
                    Card #{idx + 1}: {breed.name || `Bird ${idx + 1}`}
                  </div>

                  <ImageUploader
                    label="Bird Photograph"
                    value={breed.image || ""}
                    onChange={(val) => handleArrayItemChange("featuredBreeds", idx, "image", val)}
                    placeholder="Upload photo or enter URL"
                    previewHeight={64}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Breed / Companion Name</label>
                      <input
                        type="text"
                        value={breed.name || ""}
                        onChange={(e) => handleArrayItemChange("featuredBreeds", idx, "name", e.target.value)}
                        style={inputStyle}
                        placeholder="Sun Conure"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Trait Subtitle</label>
                      <input
                        type="text"
                        value={breed.subtitle || ""}
                        onChange={(e) => handleArrayItemChange("featuredBreeds", idx, "subtitle", e.target.value)}
                        style={inputStyle}
                        placeholder="Playful, vibrant & affectionate"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Destination Link</label>
                      <input
                        type="text"
                        value={breed.link || "/birds"}
                        onChange={(e) => handleArrayItemChange("featuredBreeds", idx, "link", e.target.value)}
                        style={inputStyle}
                        placeholder="/birds"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: SPECIES / PET CATEGORIES CARDS
           ══════════════════════════════════════════════════ */}
        {activeTab === "species" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                  Species &amp; Pet Categories
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                  Quick-navigation circular species strip for exploring companion bird families.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("petCategories", {
                    id: `pet-${Date.now()}`,
                    name: "New Species",
                    tagline: "Friendly Companion",
                    bg: "#FAF8F5",
                    accent: "#1B3B22",
                    image: "",
                    link: "/birds",
                  })
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 8,
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} strokeWidth={2.4} />
                <span>Add Species</span>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {(settings.petCategories || []).map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid #E2E8F0",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("petCategories", idx)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "#FEE2E2",
                      border: "none",
                      color: "#DC2626",
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Remove species"
                  >
                    <Trash2 size={13} strokeWidth={2.2} />
                  </button>

                  <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14, marginBottom: 10 }}>
                    {cat.name || `Species #${idx + 1}`}
                  </div>

                  <ImageUploader
                    label="Avatar / Image"
                    value={cat.image || ""}
                    onChange={(val) => handleArrayItemChange("petCategories", idx, "image", val)}
                    placeholder="Upload or enter URL"
                    previewHeight={48}
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>Name</label>
                      <input
                        type="text"
                        value={cat.name || ""}
                        onChange={(e) => handleArrayItemChange("petCategories", idx, "name", e.target.value)}
                        style={inputStyle}
                        placeholder="Sun Conure"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Tagline</label>
                      <input
                        type="text"
                        value={cat.tagline || ""}
                        onChange={(e) => handleArrayItemChange("petCategories", idx, "tagline", e.target.value)}
                        style={inputStyle}
                        placeholder="Vibrant & Playful"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Destination Link</label>
                    <input
                      type="text"
                      value={cat.link || ""}
                      onChange={(e) => handleArrayItemChange("petCategories", idx, "link", e.target.value)}
                      style={inputStyle}
                      placeholder="/birds?category=Conure"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 5: STORE, CONTACT & BRAND LOGO
           ══════════════════════════════════════════════════ */}
        {activeTab === "contact" && (
          <div>
            <div style={cardSectionStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                Brand Identity &amp; Logo
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                Upload custom logo for the header navbar and branding assets.
              </p>

              <ImageUploader
                label="Store Logo Image"
                value={settings.logoUrl || ""}
                onChange={(val) => handleChange("logoUrl", val)}
                placeholder="Upload logo file (PNG, SVG, JPG) or enter URL"
                previewHeight={60}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Store / Brand Name</label>
                  <input
                    type="text"
                    value={settings.siteTitle || "FeatherTown"}
                    onChange={(e) => handleChange("siteTitle", e.target.value)}
                    style={inputStyle}
                    placeholder="FeatherTown"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Footer Tagline</label>
                  <input
                    type="text"
                    value={
                      settings.footerTagline ||
                      "Premium aviary & companion bird essentials for happier, healthier flocks."
                    }
                    onChange={(e) => handleChange("footerTagline", e.target.value)}
                    style={inputStyle}
                    placeholder="Premium aviary & companion bird essentials..."
                  />
                </div>
              </div>
            </div>

            <div style={cardSectionStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                Contact &amp; Support Channels
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                Used in header, footer, checkout support buttons, and WhatsApp floating contact.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Support Helpline Phone</label>
                  <input
                    type="text"
                    value={settings.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    style={inputStyle}
                    placeholder="+91 95567 47518"
                  />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp Number (Country code + Digits)</label>
                  <input
                    type="text"
                    value={settings.whatsapp || ""}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    style={inputStyle}
                    placeholder="919556747518"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Official Support Email</label>
                  <input
                    type="email"
                    value={settings.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={inputStyle}
                    placeholder="care@feathertown.online"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Aviary Visiting / Business Hours</label>
                  <input
                    type="text"
                    value={settings.businessHours || ""}
                    onChange={(e) => handleChange("businessHours", e.target.value)}
                    style={inputStyle}
                    placeholder="Mon - Sun: 9:00 AM - 8:00 PM IST"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Aviary Physical Address</label>
                <textarea
                  rows={2}
                  value={settings.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="FeatherTown Aviary, Sundargarh, Odisha 770001, India"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Instagram Profile URL</label>
                  <input
                    type="text"
                    value={settings.instagramUrl || ""}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    style={inputStyle}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label style={labelStyle}>Facebook URL</label>
                  <input
                    type="text"
                    value={settings.facebookUrl || ""}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    style={inputStyle}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label style={labelStyle}>YouTube URL</label>
                  <input
                    type="text"
                    value={settings.youtubeUrl || ""}
                    onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                    style={inputStyle}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>

            <div style={cardSectionStyle}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
                Delivery &amp; Cart Rules
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                Configure shipping charges and free delivery threshold for Indian pin codes.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Free Shipping Minimum Cart Value (₹)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold ?? 999}
                    onChange={(e) => handleChange("freeShippingThreshold", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Standard Flat Shipping Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.standardShippingFee ?? 99}
                    onChange={(e) => handleChange("standardShippingFee", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 6: TOP ANNOUNCEMENT BAR
           ══════════════════════════════════════════════════ */}
        {activeTab === "announcement" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                  Top Announcement Bar
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                  Displays at the absolute top of every page in the storefront.
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#166534" }}>
                <input
                  type="checkbox"
                  checked={settings.announcementActive}
                  onChange={(e) => handleChange("announcementActive", e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 700 }}>Active</span>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Announcement Message</label>
              <textarea
                rows={2}
                value={settings.announcementText || ""}
                onChange={(e) => handleChange("announcementText", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Certified healthy companion birds & organic supplies across India..."
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 7: COLLECTIONS
           ══════════════════════════════════════════════════ */}
        {activeTab === "collections" && (
          <div style={cardSectionStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
              Featured Collections
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
              Curated category highlights with background styles and destination links.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {(settings.featuredCollections || []).map((col, idx) => (
                <div
                  key={col.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14, marginBottom: 12 }}>
                    Collection #{idx + 1}: {col.title}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Title</label>
                    <input
                      type="text"
                      value={col.title || ""}
                      onChange={(e) => handleArrayItemChange("featuredCollections", idx, "title", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Subtitle</label>
                    <input
                      type="text"
                      value={col.subtitle || ""}
                      onChange={(e) => handleArrayItemChange("featuredCollections", idx, "subtitle", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Destination Link</label>
                    <input
                      type="text"
                      value={col.link || ""}
                      onChange={(e) => handleArrayItemChange("featuredCollections", idx, "link", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 8: ESSENTIALS
           ══════════════════════════════════════════════════ */}
        {activeTab === "essentials" && (
          <div style={cardSectionStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
              Habitat Essentials
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
              Quick essentials shortcuts shown on accessories and product catalog pages.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {(settings.habitatEssentials || []).map((ess, idx) => (
                <div
                  key={ess.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 12,
                    padding: 14,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <label style={labelStyle}>Label</label>
                    <input
                      type="text"
                      value={ess.label || ""}
                      onChange={(e) => handleArrayItemChange("habitatEssentials", idx, "label", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Link</label>
                    <input
                      type="text"
                      value={ess.link || ""}
                      onChange={(e) => handleArrayItemChange("habitatEssentials", idx, "link", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 9: CARE GUIDES
           ══════════════════════════════════════════════════ */}
        {activeTab === "guides" && (
          <div style={cardSectionStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
              Avian Care Guides &amp; Articles
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
              Educational articles covering nutrition, taming, housing, and companion bird wellness.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {(settings.careGuides || []).map((guide, idx) => (
                <div
                  key={guide.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14, marginBottom: 10 }}>
                    Guide #{idx + 1}: {guide.title}
                  </div>

                  <ImageUploader
                    label="Guide Cover Photo"
                    value={guide.image || ""}
                    onChange={(val) => handleArrayItemChange("careGuides", idx, "image", val)}
                    placeholder="Upload image or enter URL"
                    previewHeight={48}
                  />

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Title</label>
                    <input
                      type="text"
                      value={guide.title || ""}
                      onChange={(e) => handleArrayItemChange("careGuides", idx, "title", e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Brief Description</label>
                    <textarea
                      rows={2}
                      value={guide.desc || ""}
                      onChange={(e) => handleArrayItemChange("careGuides", idx, "desc", e.target.value)}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Read Time</label>
                      <input
                        type="text"
                        value={guide.readTime || "4 min read"}
                        onChange={(e) => handleArrayItemChange("careGuides", idx, "readTime", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Link</label>
                      <input
                        type="text"
                        value={guide.link || "/contact"}
                        onChange={(e) => handleArrayItemChange("careGuides", idx, "link", e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 10: FAQS
           ══════════════════════════════════════════════════ */}
        {activeTab === "faqs" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                  Frequently Asked Questions
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                  Answers to common inquiries regarding hand-taming, health verification, shipping, and lifetime support.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("faqs", {
                    id: `faq-${Date.now()}`,
                    q: "New question?",
                    a: "Answer here...",
                  })
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 8,
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} strokeWidth={2.4} />
                <span>Add FAQ</span>
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(settings.faqs || []).map((faq, idx) => (
                <div
                  key={faq.id || idx}
                  style={{
                    background: "#F8FAFC",
                    borderRadius: 14,
                    padding: 18,
                    border: "1px solid #E2E8F0",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("faqs", idx)}
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      background: "#FEE2E2",
                      border: "none",
                      color: "#DC2626",
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Remove FAQ"
                  >
                    <Trash2 size={13} strokeWidth={2.2} />
                  </button>

                  <div style={{ marginBottom: 12, paddingRight: 40 }}>
                    <label style={labelStyle}>Question #{idx + 1}</label>
                    <input
                      type="text"
                      value={faq.q || ""}
                      onChange={(e) => handleArrayItemChange("faqs", idx, "q", e.target.value)}
                      style={inputStyle}
                      placeholder="e.g. Are your parrots hand-fed from birth?"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Answer</label>
                    <textarea
                      rows={3}
                      value={faq.a || ""}
                      onChange={(e) => handleArrayItemChange("faqs", idx, "a", e.target.value)}
                      style={{ ...inputStyle, resize: "vertical" }}
                      placeholder="Detailed answer..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 11: ABOUT PAGE
           ══════════════════════════════════════════════════ */}
        {activeTab === "about" && (
          <div style={cardSectionStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>
              About Page Content
            </h2>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
              Edit the brand origin story, ethical standards, mission statement, and aviary history.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input
                  type="text"
                  value={settings.aboutTagline || "Small Pets, Big Love"}
                  onChange={(e) => handleChange("aboutTagline", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Main Title</label>
                <input
                  type="text"
                  value={settings.aboutTitle || "Redefining Companion Bird Care Across India"}
                  onChange={(e) => handleChange("aboutTitle", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Our Story</label>
              <textarea
                rows={4}
                value={settings.aboutStory || ""}
                onChange={(e) => handleChange("aboutStory", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle}>Our Mission</label>
              <textarea
                rows={3}
                value={settings.aboutMission || ""}
                onChange={(e) => handleChange("aboutMission", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>
        )}

        {/* Sticky Global Save Bar */}
        <div
          style={{
            position: "sticky",
            bottom: 20,
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 28,
            zIndex: 30,
          }}
        >
          <button
            type="submit"
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 38px",
              borderRadius: 12,
              background: "#1B3B22",
              color: "#FFFFFF",
              border: "none",
              fontSize: 15,
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(27, 59, 34, 0.35)",
              opacity: saving ? 0.7 : 1,
              transition: "transform 0.15s ease",
            }}
          >
            <Save size={17} strokeWidth={2.4} />
            <span>{saving ? "Saving All Settings..." : "Save All Settings &amp; CMS"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reusable Image Uploader Component with Live Preview
   ═══════════════════════════════════════════════════════════════ */
function ImageUploader({
  label,
  value,
  onChange,
  placeholder = "Image URL or upload file",
  previewHeight = 56,
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await adminUpload(file);
      if (res?.url) {
        onChange(res.url);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {value ? (
          <div
            style={{
              width: previewHeight,
              height: previewHeight,
              borderRadius: 10,
              overflow: "hidden",
              border: "1.5px solid #CBD5E1",
              background: "#F8FAFC",
              flexShrink: 0,
            }}
          >
            <img
              src={value}
              alt="Preview"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              width: previewHeight,
              height: previewHeight,
              borderRadius: 10,
              border: "1.5px dashed #CBD5E1",
              background: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              flexShrink: 0,
            }}
          >
            <ImageIcon size={22} strokeWidth={1.8} />
          </div>
        )}

        <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            placeholder={placeholder}
          />

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: 8,
              background: uploading ? "#E2E8F0" : "#1B3B22",
              color: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: uploading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(27, 59, 34, 0.2)",
            }}
          >
            <Upload size={14} strokeWidth={2.2} />
            <span>{uploading ? "Uploading..." : "Upload Image"}</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "#FEE2E2",
                color: "#DC2626",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const cardSectionStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: "24px 28px",
  marginBottom: 20,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
};

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
