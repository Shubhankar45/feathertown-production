import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { toast } from "../components/ui/Toast";
import { trackAddToCart } from "../utils/analytics";
import SpotlightCard from "../components/react-bits/SpotlightCard";

export default function Accessories() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const { settings } = useSettings();

  const categories = useMemo(() => {
    const configured = settings?.accessoryCategories || [];
    const fromItems = items.map((i) => i.category).filter(Boolean);
    const combined = Array.from(new Set([...configured, ...fromItems]));
    return ["All", ...(combined.length > 0 ? combined : ["Cages", "Food", "Toys", "Perches", "Waterers", "Bedding"])];
  }, [settings?.accessoryCategories, items]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/accessories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(
            data.map((d) => ({
              ...d,
              id: d._id || d.id,
              badge: d.badge || (d.isBestSeller ? "Bestseller" : (d.stock > 0 ? "In Stock" : "Out of Stock")),
              badgeColor: d.badge ? "#EA580C" : (d.isBestSeller ? "#EA580C" : (d.stock > 0 ? "#16A34A" : "#DC2626")),
              rating: d.rating || 4.9,
              reviewsCount: d.reviewsCount || 120,
              image: d.images?.[0] || "",
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);


  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (category === "All") return true;
        return item.category?.toLowerCase() === category.toLowerCase();
      })
      .filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return item.name?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sort === "price_asc") return a.price - b.price;
        if (sort === "price_desc") return b.price - a.price;
        return 0;
      });
  }, [items, category, search, sort]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    trackAddToCart(product, 1);
    toast.success(`${product.name} added to cart! 🛍️`);
  };

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="Bird Accessories, Cages & Healthy Diets | FeatherTown"
        description="Shop certified bird accessories, spacious flight cages, natural perches, enrichment toys, and wholesome seed blends with fast delivery across India."
      />

      <PageBanner
        eyebrow="Shop Supplies"
        title="Bird Care &amp;"
        accent="Accessories"
        desc="Premium cages, organic feed, foraging toys, and grooming essentials picked by avian experts."
      />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        {/* Controls: Category Pills, Search, and Sort */}
        <div
          className="rv"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
            background: "#FFFFFF",
            padding: "16px clamp(12px, 3vw, 20px)",
            borderRadius: 20,
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            border: "1px solid #E2E8F0",
          }}
        >
          {/* Category Filter Pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {categories.map((c) => {
              const active = category.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="t-btn-press"
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    cursor: "pointer",
                    border: active ? "none" : "1.5px solid #E2E8F0",
                    background: active ? "linear-gradient(135deg, #16A34A, #15803D)" : "#F8FAFC",
                    color: active ? "#FFFFFF" : "#64748B",
                    boxShadow: active ? "0 4px 14px rgba(22, 163, 74, 0.28)" : "none",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", width: "auto" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in accessories..."
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                outline: "none",
                background: "#F8FAFC",
                color: "#0F172A",
                minWidth: "min(100%, 180px)",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.background = "#FFFFFF";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#CBD5E1";
                e.target.style.background = "#F8FAFC";
              }}
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                fontWeight: 600,
                color: "#0F172A",
                background: "#F8FAFC",
                cursor: "pointer",
              }}
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(clamp(140px, 44vw, 240px), 1fr))",
              gap: "clamp(12px, 2.5vw, 22px)",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 22,
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  height: 330,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="ft-shimmer" style={{ height: 170, width: "100%", background: "#F1F5F9" }} />
                <div style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="ft-shimmer" style={{ height: 16, width: "80%", borderRadius: 6, background: "#F1F5F9" }} />
                  <div className="ft-shimmer" style={{ height: 14, width: "45%", borderRadius: 6, background: "#F1F5F9" }} />
                  <div className="ft-shimmer" style={{ height: 36, width: "100%", borderRadius: 10, marginTop: "auto", background: "#F1F5F9" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            className="rv"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2E8F0",
            }}
          >
            <div className="ft-animate-float" style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
              No accessories found
            </h3>
            <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 16 }}>
              Try adjusting your search terms or selecting a different category.
            </p>
            <button
              onClick={() => {
                setCategory("All");
                setSearch("");
                setSort("");
              }}
              className="ft-btn-hover"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                border: "none",
                padding: "9px 20px",
                borderRadius: 999,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            className="rv-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(clamp(140px, 44vw, 240px), 1fr))",
              gap: "clamp(12px, 2.5vw, 22px)",
            }}
          >
            {filteredItems.map((prod) => (
              <SpotlightCard
                key={prod.id || prod._id}
                spotlightColor="rgba(22, 163, 74, 0.14)"
                borderColor="#E2E8F0"
                className="t-hover-lift group flex flex-col h-full"
                style={{
                  borderRadius: 24,
                  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
                }}
              >
                {/* Badge Overlay */}
                {prod.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      zIndex: 20,
                      background: prod.badgeColor || "#16A34A",
                      color: "#FFFFFF",
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      padding: "4px 10px",
                      borderRadius: 999,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                    }}
                  >
                    {prod.badge}
                  </span>
                )}

                {/* Product Image */}
                <Link
                  to={prod.slug ? `/accessories/${prod.slug}` : `/accessories/${prod._id}`}
                  className="t-img-zoom block relative"
                  style={{
                    aspectRatio: "1/1",
                    background: "#F8FAFC",
                    overflow: "hidden",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <img
                    src={prod.images?.[0] || prod.image}
                    alt={prod.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  />
                </Link>

                {/* Details */}
                <div style={{ padding: "clamp(14px, 2.5vw, 18px)", display: "flex", flexDirection: "column", flex: 1, zIndex: 10 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: "#16A34A",
                      letterSpacing: 0.8,
                      marginBottom: 4,
                    }}
                  >
                    {prod.category}
                  </span>

                  <Link
                    to={prod.slug ? `/accessories/${prod.slug}` : `/accessories/${prod._id}`}
                    className="group-hover:text-emerald-700 transition-colors"
                    style={{
                      fontSize: "clamp(13.5px, 2vw, 15px)",
                      fontWeight: 800,
                      color: "#0F172A",
                      textDecoration: "none",
                      lineHeight: 1.35,
                      marginBottom: 8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {prod.name}
                  </Link>

                  {/* Price & Rating */}
                  <div style={{ marginTop: "auto", paddingTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "clamp(15px, 2.2vw, 17px)", fontWeight: 900, color: "#16A34A" }}>
                        ₹{prod.price?.toLocaleString("en-IN")}
                      </span>
                      {prod.mrp && prod.mrp > prod.price && (
                        <span style={{ fontSize: 11.5, color: "#94A3B8", textDecoration: "line-through" }}>
                          ₹{prod.mrp?.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#F59E0B", marginBottom: 12 }}>
                      <span>★★★★★</span>
                      <span style={{ color: "#64748B", fontWeight: 600 }}>({prod.reviewsCount || 120})</span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="t-btn-press"
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg, #16A34A, #15803D)",
                        color: "#FFFFFF",
                        border: "none",
                        padding: "9px 12px",
                        borderRadius: 14,
                        fontSize: "clamp(12px, 1.8vw, 13px)",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
                      }}
                    >
                      <span>🛍️</span>
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
