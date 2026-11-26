import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Feather,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  CreditCard,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Plus,
  Send,
  AlertCircle,
} from "lucide-react";
import { adminFetch } from "../../utils/adminApi";
import { ADMIN_BASE } from "../../config/adminConfig";
import { toast } from "../../components/ui/Toast";
import { safeFormatDate, safeFormatCurrency, safeLower } from "../../utils/formatters";

export default function AdminBookingTracker() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Edit Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    ringNumber: "",
    dnaSex: "",
    weaningStage: "",
    handoverDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/bookings");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.bookings) ? res.bookings : []);
      setBookings(list);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      toast.error("Could not fetch bird bookings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const list = Array.isArray(bookings) ? bookings : [];
    return list.filter((b) => {
      if (!b || typeof b !== "object") return false;
      if (activeTab !== "all" && b.status !== activeTab) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const ring = safeLower(b.birdBooking?.ringNumber);
      const custName = safeLower(b.customer?.name);
      const custPhone = safeLower(b.customer?.phone);
      const birdName = safeLower(b.birdName);
      return ring.includes(q) || custName.includes(q) || custPhone.includes(q) || birdName.includes(q);
    });
  }, [bookings, activeTab, search]);

  // Open Edit Modal
  const handleOpenEdit = (b) => {
    if (!b) return;
    setSelectedBooking(b);
    setEditForm({
      status: b.status || "reserved",
      ringNumber: b.birdBooking?.ringNumber || "",
      dnaSex: b.birdBooking?.dnaSex || "Pending",
      weaningStage: b.birdBooking?.weaningStage || "Fully Weaned & Flight Ready",
      handoverDate: b.birdBooking?.handoverDate || "",
      notes: b.birdBooking?.specialInstructions || "",
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    try {
      setSaving(true);
      await adminFetch(`/api/admin/bookings/${selectedBooking.invoiceId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: editForm.status,
          ringNumber: editForm.ringNumber,
          dnaSex: editForm.dnaSex,
          weaningStage: editForm.weaningStage,
          handoverDate: editForm.handoverDate,
          specialInstructions: editForm.notes,
        }),
      });

      toast.success("Bird booking updated successfully!");
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      toast.error(err.message || "Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBooking = async (b) => {
    const id = b.id || b.invoiceId || b.invoiceNumber;
    if (!window.confirm(`Permanently delete booking reservation for ${b.birdName || "Companion Bird"} (${b.invoiceNumber})?`)) {
      return;
    }
    try {
      await adminFetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      });
      toast.success("Booking reservation deleted");
      loadBookings();
    } catch (err) {
      toast.error(err.message || "Failed to delete booking");
    }
  };

  // Stats
  const totalReserved = bookings.filter((b) => b?.status === "reserved").length;
  const totalCertified = bookings.filter((b) => b?.status === "health_certified").length;
  const totalReady = bookings.filter((b) => b?.status === "ready_for_handover").length;
  const totalHandedOver = bookings.filter((b) => b?.status === "completed").length;

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 30,
              fontWeight: 700,
              color: "#1B3B22",
              margin: 0,
            }}
          >
            Companion Bird Booking & Handover Tracker
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            Monitor closed ring numbers, DNA sex certification, weaning stages, and handover delivery.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={loadBookings}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              background: "#FFFFFF",
              border: "1px solid #D6DFD8",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            to={`${ADMIN_BASE}/create-bill`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              background: "#1B3B22",
              color: "#FFFFFF",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <Plus size={16} />
            New Bird Booking
          </Link>
        </div>
      </div>

      {/* Pipeline Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Active Reservations
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginTop: 4 }}>
            {totalReserved}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Deposit paid / Pending weaning</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Health & DNA Certified
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#2563EB", marginTop: 4 }}>
            {totalCertified}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>DNA certificate verified</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Flight & Handover Ready
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#166534", marginTop: 4 }}>
            {totalReady}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Ready for aviary pickup/courier</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Completed Handovers
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            {totalHandedOver}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>With loving bird families</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#FAF8F5",
              border: "1px solid #D6DFD8",
              borderRadius: 8,
              padding: "6px 12px",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <Search size={15} style={{ color: "#64748B", marginRight: 8 }} />
            <input
              type="text"
              placeholder="Search by ring #, bird, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* Pipeline Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[
            { id: "all", label: "All Bookings" },
            { id: "reserved", label: "Reserved" },
            { id: "health_certified", label: "Health Certified" },
            { id: "ready_for_handover", label: "Ready for Handover" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: activeTab === tab.id ? "1px solid #1B3B22" : "1px solid #E2E8F0",
                background: activeTab === tab.id ? "#EAF2EC" : "#FFFFFF",
                color: activeTab === tab.id ? "#1B3B22" : "#475569",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Card Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center" }}>
          <RefreshCw size={28} className="animate-spin" style={{ color: "#1B3B22", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, color: "#64748B" }}>Querying companion bird reservations...</div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
          }}
        >
          <Feather size={36} style={{ color: "#94A3B8", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
            No Bird Bookings Found
          </h3>
          <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px" }}>
            {search ? "No companion birds match your filter." : "When you issue an invoice with a live bird, it appears here automatically."}
          </p>
          <Link
            to={`${ADMIN_BASE}/create-bill`}
            style={{
              padding: "8px 16px",
              background: "#1B3B22",
              color: "#FFF",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create New Bill
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 18,
          }}
        >
          {filteredBookings.map((b) => {
            const cleanPhone = (b.customer?.phone || "").replace(/[^0-9]/g, "");
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
              b.customer?.name || "Customer"
            )},%20this%20is%20FeatherTown%20Aviary%20regarding%20your%20companion%20bird%20reservation%20(Ring%20%23${
              b.birdBooking?.ringNumber || ""
            }).`;

            return (
              <div
                key={b.invoiceId}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div>
                  {/* Top Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background:
                            b.status === "completed"
                              ? "#D1FAE5"
                              : b.status === "ready_for_handover"
                              ? "#DBEAFE"
                              : b.status === "health_certified"
                              ? "#E0E7FF"
                              : "#FEF3C7",
                          color:
                            b.status === "completed"
                              ? "#065F46"
                              : b.status === "ready_for_handover"
                              ? "#1E40AF"
                              : b.status === "health_certified"
                              ? "#3730A3"
                              : "#92400E",
                        }}
                      >
                        {b.status.replace(/_/g, " ")}
                      </span>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#1B3B22", marginTop: 4 }}>
                        {b.birdName || "Hand-Reared Companion Bird"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleOpenEdit(b)}
                        title="Update Booking Stage"
                        style={{
                          background: "#FAF8F5",
                          border: "1px solid #D6DFD8",
                          borderRadius: 6,
                          padding: "5px 8px",
                          cursor: "pointer",
                          color: "#1B3B22",
                        }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b)}
                        title="Delete Reservation"
                        style={{
                          background: "#FEE2E2",
                          border: "1px solid #FCA5A5",
                          borderRadius: 6,
                          padding: "5px 8px",
                          cursor: "pointer",
                          color: "#DC2626",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Ring & DNA Badges */}
                  <div
                    style={{
                      background: "#FAF8F5",
                      border: "1px solid #E2DDD3",
                      borderRadius: 8,
                      padding: "10px 12px",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#64748B" }}>Ring #:</span>
                      <strong style={{ color: "#1B3B22" }}>
                        {b.birdBooking?.ringNumber || "Not Assigned"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#64748B" }}>DNA Sex:</span>
                      <strong style={{ color: "#7E22CE" }}>
                        {b.birdBooking?.dnaSex || "Pending Lab"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#64748B" }}>Weaning:</span>
                      <span style={{ color: "#0F172A", fontWeight: 600 }}>
                        {b.birdBooking?.weaningStage || "Flight Ready"}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div style={{ fontSize: 12.5, color: "#475569", marginBottom: 12 }}>
                    <div>Customer: <strong style={{ color: "#0F172A" }}>{b.customer?.name}</strong></div>
                    <div>Phone: {b.customer?.phone} • {b.customer?.city || "Bangalore"}</div>
                    {b.birdBooking?.handoverDate && (
                      <div style={{ color: "#1B3B22", fontWeight: 600, marginTop: 2 }}>
                        Target Handover: {safeFormatDate(b.birdBooking.handoverDate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    paddingTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: "#64748B" }}>Balance: </span>
                    <strong style={{ color: b.balanceDue > 0 ? "#DC2626" : "#166534" }}>
                      {safeFormatCurrency(b.balanceDue || 0)}
                    </strong>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    {cleanPhone && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "#25D366",
                          color: "#FFFFFF",
                          fontSize: 11.5,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </a>
                    )}

                    <Link
                      to={`${ADMIN_BASE}/invoices`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "5px 10px",
                        borderRadius: 6,
                        background: "#EAF2EC",
                        color: "#1B3B22",
                        border: "1px solid #CCE0D0",
                        fontSize: 11.5,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Invoice
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Booking Stage Modal */}
      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              maxWidth: 480,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Update Companion Bird Stage
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Booking Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    background: "#FFF",
                    fontWeight: 600,
                  }}
                >
                  <option value="reserved">Reserved (Deposit Paid)</option>
                  <option value="health_certified">Health & DNA Certified</option>
                  <option value="ready_for_handover">Ready for Handover / Flight Ready</option>
                  <option value="completed">Completed / Handed Over</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Closed Seamless Ring Number
                </label>
                <input
                  type="text"
                  value={editForm.ringNumber}
                  onChange={(e) => setEditForm({ ...editForm, ringNumber: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    DNA Sex Status
                  </label>
                  <select
                    value={editForm.dnaSex}
                    onChange={(e) => setEditForm({ ...editForm, dnaSex: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12.5,
                      background: "#FFF",
                    }}
                  >
                    <option value="Certified Male">Certified Male</option>
                    <option value="Certified Female">Certified Female</option>
                    <option value="Pending">Pending Lab</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Target Handover Date
                  </label>
                  <input
                    type="date"
                    value={editForm.handoverDate}
                    onChange={(e) => setEditForm({ ...editForm, handoverDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12.5,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Aviary Notes & Special Care
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 12.5,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    fontSize: 13,
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
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "#1B3B22",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

