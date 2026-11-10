import { useEffect, useState, useMemo } from "react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";
import { useSettings } from "../../context/SettingsContext";

const EMPTY_FORM = {
  name: "",
  category: "Cages",
  description: "",
  price: "",
  mrp: "",
  stock: "",
  images: "",
  badge: "",
  isBestSeller: false,
  isActive: true,
};

export default function AdminAccessories() {
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "low" | "out"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const categories = useMemo(() => {
    const list = settings?.accessoryCategories?.length
      ? settings.accessoryCategories
      : ["Cages", "Feed", "Toys", "Grooming", "Health", "Perches", "Accessories"];
    const fromItems = items.map((i) => i.category).filter(Boolean);
    return Array.from(new Set([...list, ...fromItems]));
  }, [settings?.accessoryCategories, items]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadAccessories = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/accessories");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load accessories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      category: categories[0] || "Cages",
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      category: item.category || "Cages",
      description: item.description || "",
      price: item.price ?? "",
      mrp: item.mrp ?? "",
      stock: item.stock ?? "",
      images: (item.images || []).join(", "),
      badge: item.badge || "",
      isBestSeller: item.isBestSeller ?? false,
      isActive: item.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = await adminFetch(`/api/admin/accessories/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
      toast.success(`Product ${updated.isActive ? "activated" : "hidden"}`);
    } catch (err) {
      toast.error(err.message || "Could not update status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminFetch(`/api/admin/accessories/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Accessory deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warn("Product name is required");
    if (!form.price || Number(form.price) < 0) return toast.warn("Valid price is required");
    if (form.stock === "" || Number(form.stock) < 0) return toast.warn("Stock quantity is required");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        mrp: form.mrp === "" ? undefined : Number(form.mrp),
        stock: Number(form.stock),
        images: form.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        badge: form.badge ? form.badge.trim() : "",
        isBestSeller: Boolean(form.isBestSeller),
        isActive: Boolean(form.isActive),
      };

      if (editingId) {
        const updated = await adminFetch(`/api/admin/accessories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setItems((prev) => prev.map((i) => (i._id === editingId ? updated : i)));
        toast.success("Product updated successfully");
      } else {
        const created = await adminFetch("/api/admin/accessories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems((prev) => [created, ...prev]);
        toast.success("New accessory added successfully");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        search === "" ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === "All" || item.category === selectedCat;
      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "low" && item.stock > 0 && item.stock <= 5) ||
        (stockFilter === "out" && item.stock === 0);
      return matchSearch && matchCat && matchStock;
    });
  }, [items, search, selectedCat, stockFilter]);

  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= 5).length;
  const outOfStockCount = items.filter((i) => i.stock === 0).length;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
            Accessories &amp; Shop Inventory
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Manage cages, wholesome bird feed, enrichment toys, grooming items, and stock quantities.
          </p>
        </div>

        <button
          onClick={openCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#FFFFFF",
            border: "none",
            padding: "11px 22px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
          }}
        >
          <span>+</span> Add Product
        </button>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Total Products</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{items.length}</div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#D97706", fontWeight: 600 }}>Low Stock (≤ 5)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginTop: 4 }}>{lowStockCount}</div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#DC2626", fontWeight: 600 }}>Out of Stock</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#DC2626", marginTop: 4 }}>{outOfStockCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: 1, minWidth: 260 }}>
          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
              
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: 8,
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock Only (≤ 5)</option>
            <option value="out">Out of Stock Only</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: viewMode === "grid" ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
              background: viewMode === "grid" ? "#ECFDF5" : "#F8FAFC",
              color: viewMode === "grid" ? "#059669" : "#64748B",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: viewMode === "table" ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
              background: viewMode === "table" ? "#ECFDF5" : "#F8FAFC",
              color: viewMode === "table" ? "#059669" : "#64748B",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Table
          </button>
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
          Loading products...
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px dashed #CBD5E1",
            borderRadius: 14,
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><ShoppingBag size={36} color="#1B3B22" /></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
            No products found
          </div>
          <p style={{ color: "#64748B", fontSize: 13.5, marginBottom: 16 }}>
            Adjust your filters or add an accessory to your shop.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filteredItems.map((item) => {
            const firstImg = item.images?.[0] || "";
            return (
              <div
                key={item._id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ position: "relative", height: 180, background: "#F1F5F9" }}>
                  {firstImg ? (
                    <img
                      src={firstImg}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#94A3B8" }}>
                      
                    </div>
                  )}
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      padding: "4px 8px",
                      borderRadius: 6,
                      background: "rgba(255, 255, 255, 0.92)",
                      border: "1px solid #E2E8F0",
                      color: "#059669",
                      fontSize: 11,
                      fontWeight: 700,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background:
                        item.stock === 0
                          ? "#EF4444"
                          : item.stock <= 5
                          ? "#F59E0B"
                          : "#10B981",
                      color: "#FFFFFF",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {item.stock === 0 ? "Out of stock" : `${item.stock} in stock`}
                  </span>
                </div>

                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
                    {item.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>₹{item.price}</span>
                    {item.mrp && item.mrp > item.price && (
                      <span style={{ fontSize: 13, color: "#94A3B8", textDecoration: "line-through" }}>
                        ₹{item.mrp}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleToggleActive(item)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: item.isActive ? "#ECFDF5" : "#FEF2F2",
                        border: item.isActive ? "1px solid #A7F3D0" : "1px solid #FECACA",
                        color: item.isActive ? "#059669" : "#DC2626",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {item.isActive ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "#F8FAFC",
                        color: "#334155",
                        border: "1px solid #E2E8F0",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(item._id)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        fontSize: 12.5,
                        cursor: "pointer",
                      }}
                    >
                      
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            overflowX: "auto",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: "#334155" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Product</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Category</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Price</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Stock</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Visibility</th>
                <th style={{ padding: "14px 16px", textAlign: "right", color: "#475569", fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          
                        </div>
                      )}
                      <span style={{ fontWeight: 700, color: "#0F172A" }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#059669", fontWeight: 600 }}>{item.category}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#059669" }}>₹{item.price}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        background: item.stock === 0 ? "#FEE2E2" : item.stock <= 5 ? "#FEF3C7" : "#DCFCE7",
                        color: item.stock === 0 ? "#DC2626" : item.stock <= 5 ? "#B45309" : "#15803D",
                      }}
                    >
                      {item.stock} left
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button
                      onClick={() => handleToggleActive(item)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: item.isActive ? "#ECFDF5" : "#FEF2F2",
                        border: item.isActive ? "1px solid #A7F3D0" : "1px solid #FECACA",
                        color: item.isActive ? "#059669" : "#DC2626",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {item.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(item)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          background: "#F8FAFC",
                          color: "#334155",
                          border: "1px solid #E2E8F0",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item._id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "#FEF2F2",
                          color: "#DC2626",
                          border: "1px solid #FECACA",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 20,
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: "#FFFFFF",
                zIndex: 10,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                {editingId ? "Edit Product" : " Add New Accessory"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "#64748B", fontSize: 22, cursor: "pointer" }}
              ><X size={16} strokeWidth={2.2} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spacious Wrought Iron Breeding Flight Cage"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="text"
                      required
                      list="acc-category-options"
                      placeholder="e.g. Cages, Toys, Food"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) setForm({ ...form, category: e.target.value });
                      }}
                      style={{
                        ...selectStyle,
                        padding: "8px 10px",
                        fontSize: 12,
                        minWidth: 90,
                      }}
                    >
                      <option value="" disabled>Pick...</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <datalist id="acc-category-options">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label style={labelStyle}>Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="2499"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Original MRP (₹, strike-through)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3499"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Image URLs (comma-separated)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..., https://..."
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Product specs, materials, suitability..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Product Badge (e.g. Bestseller, Top Rated, New)</label>
                  <input
                    type="text"
                    placeholder="Bestseller"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", paddingTop: 20 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.isBestSeller}
                      onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: "#10B981" }}
                    />
                    <span style={{ color: "#D97706", fontWeight: 700 }}>Featured on Homepage Best Sellers</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#10B981" }}
                  />
                  <span>Visible on Storefront</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    background: "#F1F5F9",
                    color: "#475569",
                    border: "1px solid #CBD5E1",
                    cursor: "pointer",
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "10px 28px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{ background: "#FFFFFF", border: "1px solid #FEE2E2", borderRadius: 16, padding: 24, maxWidth: 400, width: "100%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>Delete Accessory?</h3>
            <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.5, marginBottom: 20 }}>
              This product will be removed from your catalog and storefront.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ padding: "8px 16px", borderRadius: 8, background: "#EF4444", color: "#FFFFFF", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 2px 6px rgba(239, 68, 68, 0.25)" }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const metricCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 14,
  padding: "16px 20px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
};

const selectStyle = {
  padding: "9px 12px",
  borderRadius: 8,
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  fontSize: 13.5,
  outline: "none",
  cursor: "pointer",
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
