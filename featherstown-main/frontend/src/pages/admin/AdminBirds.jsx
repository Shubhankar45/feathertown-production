import { useEffect, useState, useMemo } from "react";
import { Upload } from "lucide-react";
import { adminFetch, adminUpload } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";
import { resolveBirdImage } from "../../context/BirdsContext";
import { useSettings } from "../../context/SettingsContext";

const STATUSES = ["available", "reserved", "sold out", "coming soon"];

const EMPTY_FORM = {
  name: "",
  category: "Conure",
  image: "",
  price: "₹15,000 - ₹25,000",
  minPrice: 15000,
  status: "available",
  description: "",
  lifespan: "20-30 years",
  origin: "South America",
  size: "Medium",
  diet: "Fruits, seeds, pellets, fresh greens",
  behavior: "Very social, playful, energetic",
  talkingAbility: "Medium",
  difficulty: "Medium",
  noiseLevel: "Medium",
  trainingBasic: "Step Up, Recall, Human friendly bonding, Indoor free flying",
  trainingAdvanced: "Outdoor free flying, Harness training, Spin trick, Wave trick",
  care: "Provide large cage, Daily interaction required, Balanced diet essential, Keep toys for stimulation",
  featured: true,
  isActive: true,
  order: 0,
};

export default function AdminBirds() {
  const { settings } = useSettings();
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const categories = useMemo(() => {
    const list = settings?.birdCategories?.length
      ? settings.birdCategories
      : ["Conure", "Cockatiel", "African Grey", "Macaw", "Lovebird", "Parakeet", "Amazon", "Cockatoo"];
    const fromBirds = birds.map((b) => b.category).filter(Boolean);
    return Array.from(new Set([...list, ...fromBirds]));
  }, [settings?.birdCategories, birds]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState(null);

  const loadBirds = async () => {
    try {
      setLoading(true);
      const data = await adminFetch("/api/admin/birds");
      setBirds(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load birds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBirds();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      category: categories[0] || "Conure",
    });
    setShowModal(true);
  };

  const openEdit = (bird) => {
    setEditingId(bird._id);
    setForm({
      name: bird.name || "",
      category: bird.category || "Conure",
      image: bird.image || "",
      price: bird.price || "",
      minPrice: bird.minPrice ?? 0,
      status: bird.status || "available",
      description: bird.description || "",
      lifespan: bird.lifespan || "20-30 years",
      origin: bird.origin || "South America",
      size: bird.size || "Medium",
      diet: bird.diet || "",
      behavior: bird.behavior || "",
      talkingAbility: bird.talkingAbility || "Medium",
      difficulty: bird.difficulty || "Medium",
      noiseLevel: bird.noiseLevel || "Medium",
      trainingBasic: (bird.training?.basic || []).join(", "),
      trainingAdvanced: (bird.training?.advanced || []).join(", "),
      care: (bird.care || []).join(", "),
      featured: bird.featured ?? true,
      isActive: bird.isActive ?? true,
      order: bird.order ?? 0,
    });
    setShowModal(true);
  };

  const handleStatusChange = async (birdId, newStatus) => {
    try {
      await adminFetch(`/api/admin/birds/${birdId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setBirds((prev) =>
        prev.map((b) => (b._id === birdId ? { ...b, status: newStatus } : b))
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err.message || "Could not update status");
    }
  };

  const handleDelete = async (birdId) => {
    try {
      await adminFetch(`/api/admin/birds/${birdId}`, { method: "DELETE" });
      setBirds((prev) => prev.filter((b) => b._id !== birdId));
      toast.success("Bird listing deleted");
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message || "Could not delete bird");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warn("Bird name is required");
    if (!form.price.trim()) return toast.warn("Price range is required");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        image: form.image.trim(),
        price: form.price.trim(),
        minPrice: Number(form.minPrice) || 0,
        status: form.status,
        description: form.description.trim(),
        lifespan: form.lifespan.trim(),
        origin: form.origin.trim(),
        size: form.size.trim(),
        diet: form.diet.trim(),
        behavior: form.behavior.trim(),
        talkingAbility: form.talkingAbility,
        difficulty: form.difficulty,
        noiseLevel: form.noiseLevel,
        training: {
          basic: form.trainingBasic.split(",").map((s) => s.trim()).filter(Boolean),
          advanced: form.trainingAdvanced.split(",").map((s) => s.trim()).filter(Boolean),
        },
        care: form.care.split(",").map((s) => s.trim()).filter(Boolean),
        featured: Boolean(form.featured),
        isActive: Boolean(form.isActive),
        order: Number(form.order) || 0,
      };

      if (editingId) {
        const updated = await adminFetch(`/api/admin/birds/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setBirds((prev) => prev.map((b) => (b._id === editingId ? updated : b)));
        toast.success("Bird details updated successfully");
      } else {
        const created = await adminFetch("/api/admin/birds", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setBirds((prev) => [created, ...prev]);
        toast.success("New bird listing created successfully");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save bird");
    } finally {
      setSaving(false);
    }
  };

  const filteredBirds = useMemo(() => {
    return birds.filter((b) => {
      const matchSearch =
        search === "" ||
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.category?.toLowerCase().includes(search.toLowerCase()) ||
        b.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === "All" || b.category === selectedCat;
      const matchStatus = selectedStatus === "All" || b.status === selectedStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [birds, search, selectedCat, selectedStatus]);

  const availableCount = birds.filter((b) => b.status === "available").length;
  const soldOutCount = birds.filter((b) => b.status === "sold out").length;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Top Banner & Header */}
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
            Birds &amp; Companion Breeds
          </h1>
          <p style={{ color: "#64748B", fontSize: 14 }}>
            Manage your hand-tamed parrot listings, pricing, care guides, training steps, and live stock availability.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
              transition: "transform 0.15s ease",
            }}
          >
            <span>+</span> Add New Bird
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Total Listed Breeds</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{birds.length}</div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Available for Adoption</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>{availableCount}</div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#DC2626", fontWeight: 600 }}>Sold Out / Waitlist</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#DC2626", marginTop: 4 }}>{soldOutCount}</div>
        </div>
      </div>

      {/* Controls Bar */}
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
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 360 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
              
            </span>
            <input
              type="text"
              placeholder="Search birds by name, breed, diet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: 8,
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                fontSize: 13.5,
                outline: "none",
              }}
            />
          </div>

          {/* Category Filter */}
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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold out">Sold Out</option>
            <option value="coming soon">Coming Soon</option>
          </select>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: `1px solid ${viewMode === "grid" ? "#A7F3D0" : "#E2E8F0"}`,
              background: viewMode === "grid" ? "#ECFDF5" : "#FFFFFF",
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
              border: `1px solid ${viewMode === "table" ? "#A7F3D0" : "#E2E8F0"}`,
              background: viewMode === "table" ? "#ECFDF5" : "#FFFFFF",
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

      {/* Bird Listings Body */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94A3B8" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Feather size={32} color="#1B3B22" /></div>
          <div>Loading bird catalog...</div>
        </div>
      ) : filteredBirds.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px dashed #CBD5E1",
            borderRadius: 14,
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>No birds matched your search</div>
          <div style={{ color: "#64748B", fontSize: 13.5, marginBottom: 16 }}>Try clearing your filters or add a new bird to the catalog.</div>
          <button
            onClick={() => { setSearch(""); setSelectedCat("All"); setSelectedStatus("All"); }}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              background: "#ECFDF5",
              color: "#059669",
              border: "1px solid #A7F3D0",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filteredBirds.map((bird) => {
            const imgSrc = resolveBirdImage(bird.image);
            const isAvail = bird.status === "available";

            return (
              <div
                key={bird._id}
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {/* Image & Badges */}
                <div style={{ position: "relative", height: 200, background: "#F1F5F9" }}>
                  <img
                    src={imgSrc}
                    alt={bird.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "/assets/Sun-conure.jfif";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      display: "flex",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: "rgba(255, 255, 255, 0.92)",
                        backdropFilter: "blur(6px)",
                        color: "#059669",
                        fontSize: 11,
                        fontWeight: 700,
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      {bird.category}
                    </span>
                    {!bird.isActive && (
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 99,
                          background: "#FEE2E2",
                          color: "#DC2626",
                          fontSize: 11,
                          fontWeight: 700,
                          border: "1px solid #FECACA",
                        }}
                      >
                        Hidden
                      </span>
                    )}
                  </div>

                  <div style={{ position: "absolute", top: 12, right: 12 }}>
                    <select
                      value={bird.status}
                      onChange={(e) => handleStatusChange(bird._id, e.target.value)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "none",
                        background:
                          bird.status === "available"
                            ? "#16A34A"
                            : bird.status === "sold out"
                            ? "#EF4444"
                            : "#F59E0B",
                        color: "#FFFFFF",
                      }}
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold out">Sold Out</option>
                      <option value="coming soon">Coming Soon</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{bird.name}</h3>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#D97706" }}>{bird.price}</div>
                  </div>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: "#64748B",
                      lineHeight: 1.5,
                      marginBottom: 14,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {bird.description || "Ethically raised, hand-tamed companion bird."}
                  </p>

                  {/* Attributes Pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                    <span style={attributePill}>Talk: {bird.talkingAbility || "Medium"}</span>
                    <span style={attributePill}>Diff: {bird.difficulty || "Medium"}</span>
                    <span style={attributePill}>Noise: {bird.noiseLevel || "Medium"}</span>
                    <span style={attributePill}>Size: {bird.size || "Medium"}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openEdit(bird)}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: 8,
                        background: "#F8FAFC",
                        border: "1px solid #CBD5E1",
                        color: "#0F172A",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => setDeleteId(bird._id)}
                      style={{
                        padding: "9px 14px",
                        borderRadius: 8,
                        background: "#FEF2F2",
                        border: "1px solid #FEE2E2",
                        color: "#DC2626",
                        fontSize: 13,
                        fontWeight: 600,
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
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#64748B", fontWeight: 700, fontSize: 12 }}>Bird</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#64748B", fontWeight: 700, fontSize: 12 }}>Category</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#64748B", fontWeight: 700, fontSize: 12 }}>Price Range</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#64748B", fontWeight: 700, fontSize: 12 }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#64748B", fontWeight: 700, fontSize: 12 }}>Talking / Diff</th>
                <th style={{ padding: "14px 16px", textAlign: "right", color: "#64748B", fontWeight: 700, fontSize: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBirds.map((bird) => {
                const imgSrc = resolveBirdImage(bird.image);
                return (
                  <tr
                    key={bird._id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={imgSrc}
                          alt={bird.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: "#0F172A" }}>{bird.name}</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{bird.lifespan} • {bird.origin}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#059669", fontWeight: 600 }}>{bird.category}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#D97706" }}>{bird.price}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <select
                        value={bird.status}
                        onChange={(e) => handleStatusChange(bird._id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          border: "none",
                          background:
                            bird.status === "available"
                              ? "#16A34A"
                              : bird.status === "sold out"
                              ? "#EF4444"
                              : "#F59E0B",
                          color: "#FFFFFF",
                        }}
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold out">Sold Out</option>
                        <option value="coming soon">Coming Soon</option>
                      </select>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 12 }}>
                      {bird.talkingAbility} talk • {bird.difficulty}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(bird)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            background: "#F8FAFC",
                            border: "1px solid #CBD5E1",
                            color: "#0F172A",
                            cursor: "pointer",
                            fontSize: 12.5,
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(bird._id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            background: "#FEF2F2",
                            border: "1px solid #FEE2E2",
                            color: "#DC2626",
                            cursor: "pointer",
                            fontSize: 12.5,
                            fontWeight: 600,
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            background: "rgba(15, 23, 42, 0.5)",
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
              maxWidth: 780,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Modal Header */}
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
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                  {editingId ? "Edit Bird Listing" : "Add New Bird Listing"}
                </h2>
                <p style={{ fontSize: 12, color: "#64748B" }}>
                  Fill in species details, pricing, care guidelines, and training instructions.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  fontSize: 22,
                  cursor: "pointer",
                  padding: 4,
                }}
              ><X size={16} strokeWidth={2.2} /></button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Bird Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sun Conure"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Category / Breed *</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="text"
                      required
                      list="bird-category-options"
                      placeholder="e.g. Conure, Macaw, Cockatiel"
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
                        background: "#1E293B",
                        color: "#94A3B8",
                        minWidth: 90,
                      }}
                    >
                      <option value="" disabled>Pick...</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <datalist id="bird-category-options">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Price Display *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹15,000 - ₹25,000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Min Price (for sorting)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={form.minPrice}
                    onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Availability Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={inputStyle}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL & Preview */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Image URL or File Upload</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="https://... or upload a photo"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 14px",
                      borderRadius: 8,
                      background: "#1B3B22",
                      color: "#FFFFFF",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Upload size={13} strokeWidth={2.2} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const res = await adminUpload(file);
                          if (res?.url) {
                            setForm((prev) => ({ ...prev, image: res.url }));
                            toast.success("Bird photo uploaded!");
                          }
                        } catch (err) {
                          toast.error(err.message || "Failed to upload photo");
                        }
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                  {form.image && (
                    <img
                      src={resolveBirdImage(form.image)}
                      alt="Preview"
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", background: "#1E293B" }}
                    />
                  )}
                </div>
              </div>

              {/* Overview Description */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Overview about this bird's temperament, plumage, and bonding qualities..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Traits Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Lifespan</label>
                  <input
                    type="text"
                    placeholder="20-30 years"
                    value={form.lifespan}
                    onChange={(e) => setForm({ ...form, lifespan: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Origin</label>
                  <input
                    type="text"
                    placeholder="South America"
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Size</label>
                  <input
                    type="text"
                    placeholder="Medium"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Talking Ability</label>
                  <select
                    value={form.talkingAbility}
                    onChange={(e) => setForm({ ...form, talkingAbility: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Noise Level</label>
                  <select
                    value={form.noiseLevel}
                    onChange={(e) => setForm({ ...form, noiseLevel: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Diet & Behavior */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Diet</label>
                  <input
                    type="text"
                    placeholder="Fruits, seeds, organic pellets"
                    value={form.diet}
                    onChange={(e) => setForm({ ...form, diet: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Behavior</label>
                  <input
                    type="text"
                    placeholder="Social, energetic, cuddly"
                    value={form.behavior}
                    onChange={(e) => setForm({ ...form, behavior: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Training & Care Guide (comma separated) */}
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Basic Training Steps (comma separated)</label>
                <input
                  type="text"
                  placeholder="Step Up, Recall, Human friendly bonding, Indoor free flying"
                  value={form.trainingBasic}
                  onChange={(e) => setForm({ ...form, trainingBasic: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Advanced Training Steps (comma separated)</label>
                <input
                  type="text"
                  placeholder="Outdoor free flying, Harness training, Spin trick, Wave trick"
                  value={form.trainingAdvanced}
                  onChange={(e) => setForm({ ...form, trainingAdvanced: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Care & Habitat Guidelines (comma separated)</label>
                <textarea
                  rows={2}
                  placeholder="Provide large cage, Daily interaction required, Balanced diet essential, Keep toys for stimulation"
                  value={form.care}
                  onChange={(e) => setForm({ ...form, care: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#10B981" }}
                  />
                  <span>Active & Visible on Public Site</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#10B981" }}
                  />
                  <span>Featured on Home Page</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    background: "#F1F5F9",
                    border: "1px solid #CBD5E1",
                    color: "#475569",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
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
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Bird Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
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
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #FEE2E2",
              borderRadius: 16,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><AlertTriangle size={28} color="#D9381E" /></div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
              Delete Bird Listing?
            </h3>
            <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to permanently delete this bird from the catalog? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  background: "#F1F5F9",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  background: "#EF4444",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: "0 2px 6px rgba(239, 68, 68, 0.25)",
                }}
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

const attributePill = {
  padding: "3px 8px",
  borderRadius: 6,
  background: "#F1F5F9",
  color: "#475569",
  fontSize: 11,
  fontWeight: 600,
  border: "1px solid #E2E8F0",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  color: "#0F172A",
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
};
