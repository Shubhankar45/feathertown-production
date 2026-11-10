import { useEffect, useState } from "react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";
import Avatar from "../../components/ui/Avatar";
import AvatarPicker from "../../components/ui/AvatarPicker";

const EMPTY_FORM = {
  name: "",
  location: "",
  rating: 5,
  comment: "",
  avatar: "/avatars/cockatiel.svg",
  isVerified: true,
  status: "approved",
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/reviews");
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditingId(r._id);
    setForm({
      name: r.name || "",
      location: r.location || "",
      rating: r.rating || 5,
      comment: r.comment || "",
      avatar: r.avatar || "/avatars/cockatiel.svg",
      isVerified: r.isVerified ?? true,
      status: r.status || "approved",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    try {
      await adminFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete review");
    }
  };

  const handleToggleStatus = async (review) => {
    const nextStatus = review.status === "approved" ? "pending" : "approved";
    try {
      const updated = await adminFetch(`/api/admin/reviews/${review._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      setReviews((prev) => prev.map((r) => (r._id === review._id ? updated : r)));
      toast.success(`Review marked as ${nextStatus}`);
    } catch (err) {
      toast.error(err.message || "Failed to update review status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.warn("Customer name is required");
    if (!form.comment.trim()) return toast.warn("Review comment is required");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        rating: Number(form.rating) || 5,
        comment: form.comment.trim(),
        isVerified: Boolean(form.isVerified),
        status: form.status,
      };

      if (editingId) {
        const updated = await adminFetch(`/api/admin/reviews/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setReviews((prev) => prev.map((r) => (r._id === editingId ? updated : r)));
        toast.success("Review updated successfully");
      } else {
        const created = await adminFetch("/api/admin/reviews", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setReviews((prev) => [created, ...prev]);
        toast.success("New review added");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.message || "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
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
            ⭐ Customer Reviews &amp; Testimonials
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Moderate live public customer feedback and manage verified client testimonials displayed on the homepage.
          </p>
        </div>

        <button
          onClick={openCreate}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#FFFFFF",
            border: "none",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
          }}
        >
          <span>+</span> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px dashed #CBD5E1",
            borderRadius: 14,
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>No reviews found</div>
          <p style={{ color: "#64748B", fontSize: 13.5 }}>Add your first customer testimonial.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {reviews.map((r) => {
            const isApproved = r.status === "approved";
            return (
              <div
                key={r._id}
                style={{
                  background: "#FFFFFF",
                  border: isApproved ? "1px solid #E2E8F0" : "1px solid #FDE68A",
                  borderRadius: 16,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ color: "#F59E0B", fontSize: 16 }}>
                      {r.rating || 5} / 5 Stars
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {r.isVerified && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#DCFCE7",
                            border: "1px solid #86EFAC",
                            color: "#15803D",
                            fontWeight: 700,
                          }}
                        >
                          Verified
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: isApproved ? "#ECFDF5" : "#FEF3C7",
                          border: isApproved ? "1px solid #A7F3D0" : "1px solid #FDE68A",
                          color: isApproved ? "#059669" : "#B45309",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {r.status || "approved"}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: "#334155", fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>
                    "{r.comment}"
                  </p>
                </div>

                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={r.name} avatar={r.avatar} size={38} border={false} />
                      <div>
                        <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{r.name}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>
                          {r.location || "Odisha, India"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleToggleStatus(r)}
                        title={isApproved ? "Hide from storefront" : "Publish to storefront"}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: isApproved ? "#D97706" : "#059669",
                          fontSize: 11.5,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {isApproved ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "#EFF6FF",
                          border: "1px solid #BFDBFE",
                          color: "#1D4ED8",
                          fontSize: 11.5,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "#FEF2F2",
                          border: "1px solid #FECACA",
                          color: "#DC2626",
                          fontSize: 11.5,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
              maxWidth: 520,
              padding: 24,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                {editingId ? "Edit Customer Review" : "Add Verified Review"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "#64748B", fontSize: 22, cursor: "pointer" }}
              ><X size={16} strokeWidth={2.2} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Soumya Ranjan Naik"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Customer Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bhubaneswar, Odisha"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Rating (Stars)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    style={inputStyle}
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="approved">Approved (Live)</option>
                    <option value="pending">Pending (Hidden)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Review Comment *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Customer feedback on bird health, packaging, delivery or guidance..."
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <AvatarPicker
                  compact
                  selected={form.avatar}
                  onSelect={(a) => setForm({ ...form, avatar: a })}
                  title="Reviewer Bird Avatar"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#334155", fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={form.isVerified}
                    onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#10B981" }}
                  />
                  <span>Mark as Verified Buyer</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "9px 18px", borderRadius: 8, background: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "9px 24px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#FFFFFF",
                    border: "none",
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                  }}
                >
                  {saving ? "Saving..." : editingId ? "Update Review" : "Publish Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
