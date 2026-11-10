import { useEffect, useState } from "react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";

const TABS = [
  { id: "contact", label: "Store & Contact" },
  { id: "announcement", label: "Announcement" },
  { id: "hero", label: "Hero & CTAs" },
  { id: "promos", label: "Promo Banners" },
  { id: "species", label: "Species Cards" },
  { id: "collections", label: "Collections" },
  { id: "essentials", label: "Essentials" },
  { id: "guides", label: "Care Guides" },
  { id: "faqs", label: "FAQs" },
  { id: "about", label: "ℹ️ About Page" },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("contact");
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
      toast.success("Store configuration & CMS updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#94A3B8" }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Loading store CMS settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
            Store Configuration &amp; CMS
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Control live storefront content, contact information, banners, species cards, collections, FAQs, and about page.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 26px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#FFFFFF",
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={16} strokeWidth={2.2} />
          <span>{saving ? "Saving..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Tabs Row */}
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
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                border: active ? "1px solid #A7F3D0" : "1px solid transparent",
                background: active ? "#ECFDF5" : "transparent",
                color: active ? "#059669" : "#64748B",
                boxShadow: active ? "0 1px 3px rgba(16, 185, 129, 0.15)" : "none",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 1: CONTACT & STORE INFO */}
        {activeTab === "contact" && (
          <div>
            <div style={cardSectionStyle}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
                Contact &amp; Support Channels
              </h2>
              <p style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 20 }}>
                Used in headers, footers, checkout support buttons, and contact pages.
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
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
                Delivery &amp; Cart Rules
              </h2>
              <p style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 20 }}>
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

        {/* TAB 2: TOP ANNOUNCEMENT BAR */}
        {activeTab === "announcement" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>Top Announcement Bar</h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                  Displays at the absolute top of every page in the storefront.
                </p>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#86EFAC" }}>
                <input
                  type="checkbox"
                  checked={settings.announcementActive}
                  onChange={(e) => handleChange("announcementActive", e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 600 }}>Active</span>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Announcement Message</label>
              <textarea
                rows={2}
                value={settings.announcementText || ""}
                onChange={(e) => handleChange("announcementText", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="e.g.  Certified healthy companion birds & organic supplies across India. WhatsApp support 7 days a week."
              />
            </div>

            {/* Live Preview */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Live Bar Preview
              </div>
              {settings.announcementActive ? (
                <div
                  style={{
                    background: "linear-gradient(90deg, #14532D, #16A34A)",
                    color: "#FFFFFF",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {settings.announcementText || "No message set"}
                </div>
              ) : (
                <div
                  style={{
                    background: "#1E293B",
                    color: "#64748B",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontStyle: "italic",
                    textAlign: "center",
                  }}
                >
                  Announcement bar is currently disabled.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MODERN HERO SECTION */}
        {activeTab === "hero" && (
          <div style={cardSectionStyle}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
               Hero Section Headline &amp; Buttons
            </h2>
            <p style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 20 }}>
              The first visual headline and actions visitors see on the homepage.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Eyebrow Badge Text</label>
              <input
                type="text"
                value={settings.heroBadgeText || ""}
                onChange={(e) => handleChange("heroBadgeText", e.target.value)}
                style={inputStyle}
                placeholder="e.g. Certified Avian Aviary"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Hero Main Headline</label>
              <input
                type="text"
                value={settings.heroTitle || ""}
                onChange={(e) => handleChange("heroTitle", e.target.value)}
                style={inputStyle}
                placeholder="e.g. Everything for their best life"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Hero Subtitle Copy</label>
              <textarea
                rows={3}
                value={settings.heroSubtitle || ""}
                onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="e.g. Premium hand-tamed parrots, healthy organic treats, and cozy custom habitats..."
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Feature Bullet Points (Comma-separated)</label>
              <input
                type="text"
                value={(settings.heroFeatures || []).join(", ")}
                onChange={(e) =>
                  handleChange(
                    "heroFeatures",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                style={inputStyle}
                placeholder="100% Hand-Fed & Tamed, Certified Vet Checked, Free Lifetime Advice"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Primary Button Text</label>
                <input
                  type="text"
                  value={settings.heroCtaText || ""}
                  onChange={(e) => handleChange("heroCtaText", e.target.value)}
                  style={inputStyle}
                  placeholder="Browse Parrots"
                />
              </div>
              <div>
                <label style={labelStyle}>Primary Button Link</label>
                <input
                  type="text"
                  value={settings.heroCtaLink || ""}
                  onChange={(e) => handleChange("heroCtaLink", e.target.value)}
                  style={inputStyle}
                  placeholder="/birds"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Secondary Button Text</label>
                <input
                  type="text"
                  value={settings.heroSecondaryCtaText || ""}
                  onChange={(e) => handleChange("heroSecondaryCtaText", e.target.value)}
                  style={inputStyle}
                  placeholder="Explore Cages & Food"
                />
              </div>
              <div>
                <label style={labelStyle}>Secondary Button Link</label>
                <input
                  type="text"
                  value={settings.heroSecondaryCtaLink || ""}
                  onChange={(e) => handleChange("heroSecondaryCtaLink", e.target.value)}
                  style={inputStyle}
                  placeholder="/accessories"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROMO BANNERS */}
        {activeTab === "promos" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}> Promotional Split Banners</h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                  Two side-by-side promotional highlight banners on the storefront.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {(settings.promoBanners || []).map((banner, idx) => (
                <div
                  key={banner.id || idx}
                  style={{
                    background: "#1E293B",
                    borderRadius: 14,
                    padding: "18px 20px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 700, color: "#4ADE80", fontSize: 14 }}>
                      Banner #{idx + 1} ({banner.id || `banner-${idx + 1}`})
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12.5, color: "#FFFFFF" }}>
                      <input
                        type="checkbox"
                        checked={banner.active !== false}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "active", e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 12 }}>
                    <div>
                      <label style={labelStyle}>Headline</label>
                      <input
                        type="text"
                        value={banner.title || ""}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "title", e.target.value)}
                        style={inputStyle}
                        placeholder="Save More, Love More"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Button Label</label>
                      <input
                        type="text"
                        value={banner.buttonText || ""}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "buttonText", e.target.value)}
                        style={inputStyle}
                        placeholder="Shop Bundles"
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
                      placeholder="Up to 20% off starter cages & seed bundles."
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
                        placeholder="/accessories?category=Bundles"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Background Gradient (CSS)</label>
                      <input
                        type="text"
                        value={banner.bgGradient || ""}
                        onChange={(e) => handleArrayItemChange("promoBanners", idx, "bgGradient", e.target.value)}
                        style={inputStyle}
                        placeholder="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SHOP BY SPECIES */}
        {activeTab === "species" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}> Shop by Pet / Species Cards</h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                  The circular species quick-navigation strip shown on the homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("petCategories", {
                    id: `pet-${Date.now()}`,
                    name: "New Species",
                    tagline: "Friendly Companion",
                    bg: "#DCFCE7",
                    accent: "#15803D",
                    image: "/assets/green.jpg",
                    link: "/birds",
                  })
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add Species
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {(settings.petCategories || []).map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  style={{
                    background: "#1E293B",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
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
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "none",
                      color: "#FCA5A5",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  ><X size={16} strokeWidth={2.2} /></button>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>Species Name</label>
                      <input
                        type="text"
                        value={cat.name || ""}
                        onChange={(e) => handleArrayItemChange("petCategories", idx, "name", e.target.value)}
                        style={inputStyle}
                        placeholder="Sun Conures"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Tagline / Trait</label>
                      <input
                        type="text"
                        value={cat.tagline || ""}
                        onChange={(e) => handleArrayItemChange("petCategories", idx, "tagline", e.target.value)}
                        style={inputStyle}
                        placeholder="Vibrant & Playful"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Image URL or Path</label>
                    <input
                      type="text"
                      value={cat.image || ""}
                      onChange={(e) => handleArrayItemChange("petCategories", idx, "image", e.target.value)}
                      style={inputStyle}
                      placeholder="/assets/Sun-conure.jfif"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Store Link</label>
                      <input
                        type="text"
                        value={cat.link || ""}
                        onChange={(e) => handleArrayItemChange("petCategories", idx, "link", e.target.value)}
                        style={inputStyle}
                        placeholder="/birds?category=Conure"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Card BG Color</label>
                      <input
                        type="text"
                        value={cat.bg || ""}
                        onChange={(e) => handleArrayItemChange("petCategories", idx, "bg", e.target.value)}
                        style={inputStyle}
                        placeholder="#FFEDD5"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Text Accent Color</label>
                      <input
                        type="text"
                        value={cat.accent || ""}
                        onChange={(e) => handleArrayItemChange("petCategories", idx, "accent", e.target.value)}
                        style={inputStyle}
                        placeholder="#C2410C"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COLLECTIONS */}
        {activeTab === "collections" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}> Featured Collection Cards</h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                  The large 4 visual cards showcasing Cages, Nutrition, Toys, and Hygiene.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("featuredCollections", {
                    id: `col-${Date.now()}`,
                    title: "New Collection",
                    subtitle: "Handpicked supplies",
                    icon: "",
                    emoji: "",
                    link: "/accessories",
                    bgGradient: "linear-gradient(135deg, #1E3A8A 0%, #0369A1 100%)",
                    accent: "#38BDF8",
                  })
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add Collection
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {(settings.featuredCollections || []).map((col, idx) => (
                <div
                  key={col.id || idx}
                  style={{
                    background: "#1E293B",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("featuredCollections", idx)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "none",
                      color: "#FCA5A5",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  ><X size={16} strokeWidth={2.2} /></button>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>Collection Title</label>
                      <input
                        type="text"
                        value={col.title || ""}
                        onChange={(e) => handleArrayItemChange("featuredCollections", idx, "title", e.target.value)}
                        style={inputStyle}
                        placeholder="Cozy Habitats & Cages"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Subtitle</label>
                      <input
                        type="text"
                        value={col.subtitle || ""}
                        onChange={(e) => handleArrayItemChange("featuredCollections", idx, "subtitle", e.target.value)}
                        style={inputStyle}
                        placeholder="Create the perfect home"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={labelStyle}>Icon Emoji</label>
                      <input
                        type="text"
                        value={col.icon || ""}
                        onChange={(e) => handleArrayItemChange("featuredCollections", idx, "icon", e.target.value)}
                        style={inputStyle}
                        placeholder=""
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Target Link</label>
                      <input
                        type="text"
                        value={col.link || ""}
                        onChange={(e) => handleArrayItemChange("featuredCollections", idx, "link", e.target.value)}
                        style={inputStyle}
                        placeholder="/accessories?category=Cages"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <label style={labelStyle}>CSS Background Gradient</label>
                    <input
                      type="text"
                      value={col.bgGradient || ""}
                      onChange={(e) => handleArrayItemChange("featuredCollections", idx, "bgGradient", e.target.value)}
                      style={inputStyle}
                      placeholder="linear-gradient(135deg, #1E3A8A 0%, #0369A1 100%)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: HABITAT ESSENTIALS */}
        {activeTab === "essentials" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}> Habitat Essentials Icons</h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                  Quick links to daily bird necessities (drinkers, perches, seeds, swings, bowls, hygiene).
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("habitatEssentials", {
                    id: `ess-${Date.now()}`,
                    icon: "",
                    label: "New Essential",
                    link: "/accessories",
                  })
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add Essential
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {(settings.habitatEssentials || []).map((ess, idx) => (
                <div
                  key={ess.id || idx}
                  style={{
                    background: "#1E293B",
                    borderRadius: 12,
                    padding: 14,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="text"
                    value={ess.icon || ""}
                    onChange={(e) => handleArrayItemChange("habitatEssentials", idx, "icon", e.target.value)}
                    style={{ ...inputStyle, width: 48, textAlign: "center", fontSize: 18 }}
                  />
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={ess.label || ""}
                      onChange={(e) => handleArrayItemChange("habitatEssentials", idx, "label", e.target.value)}
                      style={{ ...inputStyle, marginBottom: 6 }}
                      placeholder="Item name"
                    />
                    <input
                      type="text"
                      value={ess.link || ""}
                      onChange={(e) => handleArrayItemChange("habitatEssentials", idx, "link", e.target.value)}
                      style={{ ...inputStyle, fontSize: 11.5 }}
                      placeholder="/accessories?category=..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("habitatEssentials", idx)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "none",
                      color: "#FCA5A5",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  ><X size={16} strokeWidth={2.2} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CARE GUIDES */}
        {activeTab === "guides" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}> Avian Care Guides</h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                  Educational resource cards displayed on the storefront.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("careGuides", {
                    id: `cg-${Date.now()}`,
                    title: "New Care Guide",
                    desc: "Quick summary of avian guidance and tips.",
                    bg: "#EFF6FF",
                    image: "/assets/green.jpg",
                    readTime: "5 min read",
                    link: "/contact",
                  })
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add Guide
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {(settings.careGuides || []).map((guide, idx) => (
                <div
                  key={guide.id || idx}
                  style={{
                    background: "#1E293B",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("careGuides", idx)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "none",
                      color: "#FCA5A5",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  ><X size={16} strokeWidth={2.2} /></button>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Guide Title</label>
                    <input
                      type="text"
                      value={guide.title || ""}
                      onChange={(e) => handleArrayItemChange("careGuides", idx, "title", e.target.value)}
                      style={inputStyle}
                      placeholder="New Bird Checklist"
                    />
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Short Description</label>
                    <textarea
                      rows={2}
                      value={guide.desc || ""}
                      onChange={(e) => handleArrayItemChange("careGuides", idx, "desc", e.target.value)}
                      style={{ ...inputStyle, resize: "vertical" }}
                      placeholder="Summary..."
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Read Time</label>
                      <input
                        type="text"
                        value={guide.readTime || ""}
                        onChange={(e) => handleArrayItemChange("careGuides", idx, "readTime", e.target.value)}
                        style={inputStyle}
                        placeholder="4 min read"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Card Image URL</label>
                      <input
                        type="text"
                        value={guide.image || ""}
                        onChange={(e) => handleArrayItemChange("careGuides", idx, "image", e.target.value)}
                        style={inputStyle}
                        placeholder="/assets/green.jpg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: FAQS */}
        {activeTab === "faqs" && (
          <div style={cardSectionStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}> Frequently Asked Questions</h2>
                <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                  Manage the Q&amp;A accordion items displayed on the homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddArrayItem("faqs", {
                    id: `faq-${Date.now()}`,
                    q: "New Question?",
                    a: "Detailed helpful answer here.",
                  })
                }
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#16A34A",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                + Add FAQ
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(settings.faqs || []).map((faq, idx) => (
                <div
                  key={faq.id || idx}
                  style={{
                    background: "#1E293B",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    position: "relative",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("faqs", idx)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "none",
                      color: "#FCA5A5",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  ><X size={16} strokeWidth={2.2} /></button>

                  <div style={{ marginBottom: 10, paddingRight: 32 }}>
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
                    <label style={labelStyle}>Detailed Answer</label>
                    <textarea
                      rows={3}
                      value={faq.a || ""}
                      onChange={(e) => handleArrayItemChange("faqs", idx, "a", e.target.value)}
                      style={{ ...inputStyle, resize: "vertical" }}
                      placeholder="Explanation..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: ABOUT PAGE & CARDS */}
        {activeTab === "about" && (
          <div>
            <div style={cardSectionStyle}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
                ℹ️ About FeatherTown Page Story
              </h2>
              <p style={{ fontSize: 12.5, color: "#94A3B8", marginBottom: 20 }}>
                Custom copy that powers both the homepage About section and the dedicated /about page.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Eyebrow Tagline</label>
                  <input
                    type="text"
                    value={settings.aboutTagline || ""}
                    onChange={(e) => handleChange("aboutTagline", e.target.value)}
                    style={inputStyle}
                    placeholder="Small Pets, Big Love"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Main Title Headline</label>
                  <input
                    type="text"
                    value={settings.aboutTitle || ""}
                    onChange={(e) => handleChange("aboutTitle", e.target.value)}
                    style={inputStyle}
                    placeholder="Redefining Companion Bird Care Across India"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Our Story &amp; Aviary Roots</label>
                <textarea
                  rows={4}
                  value={settings.aboutStory || ""}
                  onChange={(e) => handleChange("aboutStory", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="FeatherTown was founded in Sundargarh, Odisha, out of a profound passion..."
                />
              </div>

              <div>
                <label style={labelStyle}>Our Mission Statement</label>
                <textarea
                  rows={3}
                  value={settings.aboutMission || ""}
                  onChange={(e) => handleChange("aboutMission", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="To empower every bird parent in India..."
                />
              </div>
            </div>

            <div style={cardSectionStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}> About Section Feature Cards</h2>
                  <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 2 }}>
                    The 4 informative cards on the homepage About section (Services, Why Choose Us, Certified Aviary, Contact).
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                {(settings.aboutCards || []).map((card, idx) => (
                  <div
                    key={card.id || idx}
                    style={{
                      background: "#1E293B",
                      borderRadius: 14,
                      padding: 16,
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      <input
                        type="text"
                        value={card.icon || ""}
                        onChange={(e) => handleArrayItemChange("aboutCards", idx, "icon", e.target.value)}
                        style={{ ...inputStyle, width: 44, textAlign: "center", fontSize: 18 }}
                      />
                      <input
                        type="text"
                        value={card.title || ""}
                        onChange={(e) => handleArrayItemChange("aboutCards", idx, "title", e.target.value)}
                        style={{ ...inputStyle, flex: 1, fontWeight: 700 }}
                        placeholder="Card Title"
                      />
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <label style={labelStyle}>Body Text (if applicable)</label>
                      <textarea
                        rows={2}
                        value={card.body || ""}
                        onChange={(e) => handleArrayItemChange("aboutCards", idx, "body", e.target.value)}
                        style={{ ...inputStyle, resize: "vertical" }}
                        placeholder="Card explanation..."
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Bullet Points (comma-separated)</label>
                      <input
                        type="text"
                        value={(card.items || []).join(", ")}
                        onChange={(e) =>
                          handleArrayItemChange(
                            "aboutCards",
                            idx,
                            "items",
                            e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                          )
                        }
                        style={inputStyle}
                        placeholder="Healthy & Verified Selling, Diet Guide, Training..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button at Bottom */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 36px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "#FFFFFF",
              border: "none",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={16} strokeWidth={2.2} />
            <span>{saving ? "Saving All Settings..." : "Save All Settings & CMS"}</span>
          </button>
        </div>
      </form>
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
  fontWeight: 600,
  color: "#475569",
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
};
