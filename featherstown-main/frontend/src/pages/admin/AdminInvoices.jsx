import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  Printer,
  Download,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  CreditCard,
  Ban,
  Filter,
} from "lucide-react";
import { adminFetch } from "../../utils/adminApi";
import { ADMIN_BASE } from "../../config/adminConfig";
import { toast } from "../../components/ui/Toast";
import PrintableInvoice from "../../components/admin/PrintableInvoice";

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Active Invoice for Print Modal
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Active Invoice for Payment Collection Modal
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [collectMethod, setCollectMethod] = useState("UPI");
  const [collectRef, setCollectRef] = useState("");
  const [collecting, setCollecting] = useState(false);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/invoices");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.invoices) ? res.invoices : []);
      setInvoices(list);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      toast.error("Could not fetch invoices: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const list = Array.isArray(invoices) ? invoices : [];
    return list.filter((inv) => {
      if (statusFilter !== "all" && inv.paymentStatus !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const num = inv.invoiceNumber?.toLowerCase() || "";
      const custName = inv.customer?.name?.toLowerCase() || "";
      const custPhone = inv.customer?.phone?.toLowerCase() || "";
      return num.includes(q) || custName.includes(q) || custPhone.includes(q);
    });
  }, [invoices, statusFilter, search]);

  // Handle Record Payment
  const handleOpenPayment = (inv) => {
    setPaymentModalInvoice(inv);
    setCollectAmount(inv.balanceDue || 0);
    setCollectMethod("UPI");
    setCollectRef("");
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    const amount = Number(collectAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    try {
      setCollecting(true);
      const res = await adminFetch(`/api/admin/invoices/${paymentModalInvoice._id || paymentModalInvoice.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          paymentAmount: amount,
          paymentMethod: collectMethod,
          paymentReference: collectRef,
        }),
      });

      toast.success(`Payment of ₹${amount.toLocaleString()} recorded!`);
      setPaymentModalInvoice(null);
      // Update in state
      setInvoices((prev) =>
        (Array.isArray(prev) ? prev : []).map((i) => ((i._id || i.id) === (res._id || res.id) ? res : i))
      );
    } catch (err) {
      toast.error(err.message || "Failed to record payment");
    } finally {
      setCollecting(false);
    }
  };

  // Handle Void
  const handleVoidInvoice = async (inv) => {
    if (
      !window.confirm(
        `Are you sure you want to void Tax Invoice ${inv.invoiceNumber}? This will mark it as void and restore inventory stock.`
      )
    ) {
      return;
    }

    try {
      await adminFetch(`/api/admin/invoices/${inv._id || inv.id}`, {
        method: "DELETE",
      });
      toast.success(`Invoice ${inv.invoiceNumber} marked as void`);
      loadInvoices();
    } catch (err) {
      toast.error(err.message || "Could not void invoice");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }
    const headers = [
      "Invoice Number",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Grand Total (₹)",
      "Paid Amount (₹)",
      "Balance Due (₹)",
      "Payment Status",
      "Payment Method",
    ];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      new Date(inv.createdAt).toLocaleDateString(),
      `"${inv.customer?.name || ""}"`,
      `"${inv.customer?.phone || ""}"`,
      inv.grandTotal,
      inv.paidAmount,
      inv.balanceDue,
      inv.paymentStatus,
      inv.paymentMethod,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FeatherTown_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Invoices CSV downloaded!");
  };

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
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
            Tax Invoices & Billing History
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            Real database records, automated sequential invoicing, and payment collection.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Download size={15} />
            Export CSV
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
            Create Bill / Invoice
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "14px 18px",
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
              placeholder="Search by invoice #, customer name, phone..."
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

        {/* Status Filters */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "all", label: "All Status" },
            { id: "paid", label: "Paid" },
            { id: "partial", label: "Partial Balance" },
            { id: "unpaid", label: "Unpaid" },
            { id: "void", label: "Void" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: statusFilter === st.id ? "1px solid #1B3B22" : "1px solid #E2E8F0",
                background: statusFilter === st.id ? "#EAF2EC" : "#FFFFFF",
                color: statusFilter === st.id ? "#1B3B22" : "#475569",
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Data Table */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <RefreshCw size={28} className="animate-spin" style={{ color: "#1B3B22", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 14, color: "#64748B" }}>Loading real invoice records...</div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <FileText size={36} style={{ color: "#94A3B8", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
              No Invoices Found
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px" }}>
              {search ? "No records match your search criteria." : "No invoices have been generated yet."}
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
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
              <thead>
                <tr style={{ background: "#FAF8F5", borderBottom: "1px solid #E2DDD3", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Invoice #</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Customer</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Items Summary</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "right" }}>Total (₹)</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "right" }}>Balance Due</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id || inv.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1B3B22" }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "#475569" }}>
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 13 }}>
                        {inv.customer?.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#64748B" }}>
                        {inv.customer?.phone}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "#334155" }}>
                      {inv.items?.map((it) => `${it.name} (x${it.quantity})`).join(", ") || "—"}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 800, color: "#0F172A" }}>
                      ₹{inv.grandTotal?.toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 700, color: inv.balanceDue > 0 ? "#DC2626" : "#166534" }}>
                      ₹{inv.balanceDue?.toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 9px",
                          borderRadius: 99,
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background:
                            inv.paymentStatus === "paid"
                              ? "#D1FAE5"
                              : inv.paymentStatus === "partial"
                              ? "#FEF3C7"
                              : inv.paymentStatus === "void"
                              ? "#F1F5F9"
                              : "#FEE2E2",
                          color:
                            inv.paymentStatus === "paid"
                              ? "#065F46"
                              : inv.paymentStatus === "partial"
                              ? "#92400E"
                              : inv.paymentStatus === "void"
                              ? "#64748B"
                              : "#991B1B",
                        }}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {/* View & Print */}
                        <button
                          type="button"
                          onClick={() => setActiveInvoice(inv)}
                          title="Print / View Official Tax Invoice"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "5px 10px",
                            borderRadius: 6,
                            background: "#EAF2EC",
                            color: "#1B3B22",
                            border: "1px solid #CCE0D0",
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Printer size={13} />
                          Print
                        </button>

                        {/* Collect Partial Balance */}
                        {inv.balanceDue > 0 && inv.paymentStatus !== "void" && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(inv)}
                            title="Collect Balance Payment"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 10px",
                              borderRadius: 6,
                              background: "#FEF3C7",
                              color: "#92400E",
                              border: "1px solid #FDE68A",
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <CreditCard size={13} />
                            Collect
                          </button>
                        )}

                        {/* Void button */}
                        {inv.paymentStatus !== "void" && (
                          <button
                            type="button"
                            onClick={() => handleVoidInvoice(inv)}
                            title="Void Invoice"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#94A3B8",
                              cursor: "pointer",
                              padding: 4,
                            }}
                          >
                            <Ban size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print / View Modal */}
      {activeInvoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
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
              background: "#FAF8F5",
              borderRadius: 14,
              maxWidth: 880,
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #E2DDD3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#FFFFFF",
                borderRadius: "14px 14px 0 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Printer size={18} style={{ color: "#1B3B22" }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#1B3B22" }}>
                  Invoice: {activeInvoice.invoiceNumber}
                </span>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                style={{
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 10px",
                  cursor: "pointer",
                  color: "#64748B",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <PrintableInvoice invoice={activeInvoice} />
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Collection Modal */}
      {paymentModalInvoice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
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
              maxWidth: 440,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Record Balance Payment
              </h3>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
              Invoice <strong>{paymentModalInvoice.invoiceNumber}</strong> • Current Balance:{" "}
              <strong style={{ color: "#DC2626" }}>₹{paymentModalInvoice.balanceDue?.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleRecordPayment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalInvoice.balanceDue}
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 15,
                    fontWeight: 700,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Payment Method
                </label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    background: "#FFF",
                  }}
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  UTR / Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-982301923"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
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
                  disabled={collecting}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "#1B3B22",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: collecting ? "not-allowed" : "pointer",
                  }}
                >
                  {collecting ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

