import { useEffect, useState } from "react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";
import { useSettings } from "../../context/SettingsContext";

export default function AdminCategories() {
  const { refreshSettings } = useSettings();
  const [data, setData] = useState({
    birdCategories: [],
    accessoryCategories: [],
    birdCounts: {},
    accessoryCounts: {},
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("birds"); // "birds" | "accessories"

  // Quick Add input state
  const [newBirdCat, setNewBirdCat] = useState("");
  const [newAccCat, setNewAccCat] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit / Rename Modal state
  const [editModal, setEditModal] = useState({
    open: false,
    type: "birds",
    oldName: "",
    newName: "",
    updateProducts: true,
  });
  const [updating, setUpdating] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/categories");
      if (res) {
        setData({
          birdCategories: res.birdCategories || [],
          accessoryCategories: res.accessoryCategories || [],
          birdCounts: res.birdCounts || {},
          accessoryCounts: res.accessoryCounts || {},
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async (type) => {
    const name = type === "birds" ? newBirdCat.trim() : newAccCat.trim();
    if (!name) return toast.warn("Please enter a category name");

    setAdding(true);
    try {
      const res = await adminFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ type, name }),
      });
      if (res) {
        setData(res);
        toast.success(`Category "${name}" added to ${type === "birds" ? "Birds" : "Accessories"} 🎉`);
        if (type === "birds") setNewBirdCat("");
        else setNewAccCat("");
        refreshSettings();
      }
    } catch (err) {
      toast.error(err.message || "Failed to add category");
    } finally {
      setAdding(false);
    }
  };

  const openRename = (type, oldName) => {
    setEditModal({
      open: true,
      type,
      oldName,
      newName: oldName,
      updateProducts: true,
    });
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.newName.trim()) return toast.warn("Category name cannot be empty");
    if (editModal.newName.trim() === editModal.oldName) {
      setEditModal({ ...editModal, open: false });
      return;
    }

    setUpdating(true);
    try {
      const res = await adminFetch("/api/admin/categories", {
        method: "PUT",
        body: JSON.stringify({
          type: editModal.type,
          oldName: editModal.oldName,
          newName: editModal.newName.trim(),
          updateProducts: editModal.updateProducts,
        }),
      });
      if (res) {
        setData(res);
        toast.success(`Category renamed to "${editModal.newName.trim()}" successfully 🎉`);
        setEditModal({ ...editModal, open: false });
        refreshSettings();
      }
    } catch (err) {
      toast.error(err.message || "Failed to rename category");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (type, name) => {
    const count =
      type === "birds"
        ? data.birdCounts[name] || 0
        : data.accessoryCounts[name] || 0;

    const confirmMsg =
      count > 0
        ? `"${name}" currently has ${count} product(s) assigned to it. Deleting this category will remove it from category filters and creation lists, but existing products will retain their text. Proceed?`
        : `Delete category "${name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await adminFetch("/api/admin/categories", {
        method: "DELETE",
        body: JSON.stringify({ type, name }),
      });
      if (res) {
        setData(res);
        toast.success(`Category "${name}" removed`);
        refreshSettings();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  const totalBirdsAssigned = Object.values(data.birdCounts).reduce((a, b) => a + b, 0);
  const totalAccessoriesAssigned = Object.values(data.accessoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
            🏷️ Category Management
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Create, rename, and manage categories for both companion birds and pet accessories. Changes apply instantly across storefront filters and product forms.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            🦜 Bird Categories
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A" }}>{data.birdCategories.length}</div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{totalBirdsAssigned} total birds listed</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0284C7", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
            🛍️ Accessory Categories
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A" }}>{data.accessoryCategories.length}</div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{totalAccessoriesAssigned} total accessories listed</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("birds")}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: activeTab === "birds" ? "none" : "1px solid #CBD5E1",
            fontSize: 14,
            fontWeight: activeTab === "birds" ? 700 : 600,
            cursor: "pointer",
            background: activeTab === "birds" ? "linear-gradient(135deg, #10B981, #059669)" : "#FFFFFF",
            color: activeTab === "birds" ? "#FFFFFF" : "#475569",
            boxShadow: activeTab === "birds" ? "0 4px 14px rgba(16, 185, 129, 0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
            transition: "all 0.2s",
          }}
        >
          🦜 Bird Categories &amp; Breeds ({data.birdCategories.length})
        </button>
        <button
          onClick={() => setActiveTab("accessories")}
          style={{
            padding: "10px 22px",
            borderRadius: 10,
            border: activeTab === "accessories" ? "none" : "1px solid #CBD5E1",
            fontSize: 14,
            fontWeight: activeTab === "accessories" ? 700 : 600,
            cursor: "pointer",
            background: activeTab === "accessories" ? "linear-gradient(135deg, #10B981, #059669)" : "#FFFFFF",
            color: activeTab === "accessories" ? "#FFFFFF" : "#475569",
            boxShadow: activeTab === "accessories" ? "0 4px 14px rgba(16, 185, 129, 0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
            transition: "all 0.2s",
          }}
        >
          🛍️ Accessory Categories ({data.accessoryCategories.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
          Loading categories...
        </div>
      ) : activeTab === "birds" ? (
        /* BIRD CATEGORIES SECTION */
        <div style={cardSectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Parrot &amp; Bird Breeds</h2>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                Used in bird showcase filters, breed details, quiz matching, and the admin bird editor.
              </p>
            </div>

            {/* Quick Add Bar */}
            <div style={{ display: "flex", gap: 8, flex: 1, maxWidth: 420 }}>
              <input
                type="text"
                value={newBirdCat}
                onChange={(e) => setNewBirdCat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd("birds")}
                placeholder="e.g. Caique, Lorikeet, Finch..."
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => handleAdd("birds")}
                disabled={adding}
                style={addBtnStyle}
              >
                + Add
              </button>
            </div>
          </div>

          {/* List of Bird Categories */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {data.birdCategories.map((cat) => {
              const count = data.birdCounts[cat] || 0;
              return (
                <div key={cat} style={catItemCardStyle}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{cat}</div>
                    <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 4 }}>
                      {count} {count === 1 ? "bird" : "birds"} listed
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => openRename("birds", cat)}
                      style={editBtnStyle}
                      title="Rename Category"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete("birds", cat)}
                      style={deleteBtnStyle}
                      title="Delete Category"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ACCESSORY CATEGORIES SECTION */
        <div style={cardSectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Accessory &amp; Diet Categories</h2>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                Used in accessory shop category tabs, homepage essentials, and the product creation form.
              </p>
            </div>

            {/* Quick Add Bar */}
            <div style={{ display: "flex", gap: 8, flex: 1, maxWidth: 420 }}>
              <input
                type="text"
                value={newAccCat}
                onChange={(e) => setNewAccCat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd("accessories")}
                placeholder="e.g. Incubators, Harnesses, Supplements..."
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => handleAdd("accessories")}
                disabled={adding}
                style={addBtnStyle}
              >
                + Add
              </button>
            </div>
          </div>

          {/* List of Accessory Categories */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {data.accessoryCategories.map((cat) => {
              const count = data.accessoryCounts[cat] || 0;
              return (
                <div key={cat} style={catItemCardStyle}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{cat}</div>
                    <div style={{ fontSize: 12, color: "#0284C7", fontWeight: 600, marginTop: 4 }}>
                      {count} {count === 1 ? "product" : "products"} listed
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => openRename("accessories", cat)}
                      style={editBtnStyle}
                      title="Rename Category"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete("accessories", cat)}
                      style={deleteBtnStyle}
                      title="Delete Category"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {editModal.open && (
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
              maxWidth: 440,
              padding: 24,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                Rename {editModal.type === "birds" ? "Bird" : "Accessory"} Category
              </h2>
              <button
                onClick={() => setEditModal({ ...editModal, open: false })}
                style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Category Name</label>
                <input
                  type="text"
                  required
                  value={editModal.newName}
                  onChange={(e) => setEditModal({ ...editModal, newName: e.target.value })}
                  style={inputStyle}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 20, background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "12px 14px", borderRadius: 10 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", color: "#334155", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={editModal.updateProducts}
                    onChange={(e) => setEditModal({ ...editModal, updateProducts: e.target.checked })}
                    style={{ width: 16, height: 16, marginTop: 2, accentColor: "#10B981" }}
                  />
                  <span>
                    Automatically update all existing {editModal.type === "birds" ? "birds" : "accessories"} currently marked as{" "}
                    <strong style={{ color: "#059669" }}>"{editModal.oldName}"</strong> to{" "}
                    <strong style={{ color: "#D97706" }}>"{editModal.newName || "..."}"</strong>
                  </span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditModal({ ...editModal, open: false })}
                  style={{ padding: "9px 18px", borderRadius: 8, background: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    padding: "9px 24px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#FFFFFF",
                    border: "none",
                    fontWeight: 700,
                    cursor: updating ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  {updating ? "Saving..." : "Save Name"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const statCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 14,
  padding: "18px 22px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
};

const cardSectionStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: "24px 26px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
};

const catItemCardStyle = {
  background: "#F8FAFC",
  borderRadius: 12,
  padding: "14px 16px",
  border: "1px solid #E2E8F0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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

const addBtnStyle = {
  padding: "10px 18px",
  borderRadius: 8,
  background: "linear-gradient(135deg, #10B981, #059669)",
  color: "#FFFFFF",
  border: "none",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
};

const editBtnStyle = {
  padding: "5px 10px",
  borderRadius: 6,
  background: "#EFF6FF",
  border: "1px solid #BFDBFE",
  color: "#1D4ED8",
  fontSize: 12,
  cursor: "pointer",
  fontWeight: 600,
};

const deleteBtnStyle = {
  padding: "5px 10px",
  borderRadius: 6,
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  color: "#DC2626",
  fontSize: 12,
  cursor: "pointer",
  fontWeight: 700,
};
