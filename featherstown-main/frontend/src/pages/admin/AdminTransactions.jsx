import { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Plus,
  Download,
  RefreshCw,
  Trash2,
  X,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";

const CATEGORIES = [
  "Sales",
  "Feed & Nutrition",
  "Veterinary & Healthcare",
  "Aviary Utilities & Climate",
  "Inventory Restock",
  "Logistics & Transport",
  "Packaging Supplies",
  "Marketing & Promotions",
  "Aviary Maintenance",
  "Other Operating Expense",
];

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Record Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense",
    category: "Feed & Nutrition",
    amount: "",
    paymentMethod: "UPI",
    description: "",
    reference: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/transactions");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.transactions) ? res.transactions : []);
      setTransactions(list);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      toast.error("Could not fetch financial ledger: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    return list.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const id = t.transactionId?.toLowerCase() || "";
      const desc = t.description?.toLowerCase() || "";
      const cat = t.category?.toLowerCase() || "";
      const ref = t.reference?.toLowerCase() || "";
      return id.includes(q) || desc.includes(q) || cat.includes(q) || ref.includes(q);
    });
  }, [transactions, typeFilter, categoryFilter, search]);

  // Compute Totals
  const { totalInflow, totalOutflow, netCashFlow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    const list = Array.isArray(transactions) ? transactions : [];
    list.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === "income") inflow += amt;
      else if (t.type === "expense") outflow += amt;
    });
    return {
      totalInflow: inflow,
      totalOutflow: outflow,
      netCashFlow: inflow - outflow,
    };
  }, [transactions]);

  // Submit New Transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const amount = Number(formData.amount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description for this entry");
      return;
    }

    try {
      setSaving(true);
      await adminFetch("/api/admin/transactions", {
        method: "POST",
        body: JSON.stringify({
          type: formData.type,
          category: formData.category,
          amount: amount,
          paymentMethod: formData.paymentMethod,
          description: formData.description.trim(),
          reference: formData.reference.trim(),
          date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        }),
      });

      toast.success(`${formData.type === "income" ? "Income" : "Expense"} of ₹${amount.toLocaleString()} recorded!`);
      setShowModal(false);
      setFormData({
        type: "expense",
        category: "Feed & Nutrition",
        amount: "",
        paymentMethod: "UPI",
        description: "",
        reference: "",
        date: new Date().toISOString().slice(0, 10),
      });
      loadTransactions();
    } catch (err) {
      toast.error(err.message || "Failed to record transaction");
    } finally {
      setSaving(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (t) => {
    if (!window.confirm(`Delete transaction ${t.transactionId} (${t.description})?`)) {
      return;
    }
    try {
      await adminFetch(`/api/admin/transactions/${t._id || t.id}`, {
        method: "DELETE",
      });
      toast.success("Transaction entry deleted");
      loadTransactions();
    } catch (err) {
      toast.error(err.message || "Could not delete transaction");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = ["Transaction ID", "Date", "Type", "Category", "Amount (₹)", "Payment Method", "Description", "Reference"];
    const rows = filteredTransactions.map((t) => [
      t.transactionId,
      new Date(t.date || t.createdAt).toLocaleDateString(),
      t.type,
      `"${t.category || ""}"`,
      t.amount,
      t.paymentMethod || "",
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${t.reference || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FeatherTown_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ledger exported to CSV!");
  };

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
            Financial Ledger & Cash Flow
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            Real accounting entries: revenue receipts, veterinary care, bird nutrition, and aviary operating costs.
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

          <button
            type="button"
            onClick={() => setShowModal(true)}
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
              cursor: "pointer",
              border: "none",
            }}
          >
            <Plus size={16} />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Total Inflow */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Total Receipts / Inflow
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EAF2EC", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#166534", lineHeight: 1.1 }}>
            ₹{totalInflow.toLocaleString()}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 6 }}>
            Direct invoice payments & web orders
          </div>
        </div>

        {/* Total Outflow */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Total Expenses / Outflow
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FEF2F2", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#DC2626", lineHeight: 1.1 }}>
            ₹{totalOutflow.toLocaleString()}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 6 }}>
            Aviary maintenance, feeds & operations
          </div>
        </div>

        {/* Net Cash Flow */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              Net Operating Balance
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: netCashFlow >= 0 ? "#EAF2EC" : "#FEF2F2", color: netCashFlow >= 0 ? "#1B3B22" : "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: netCashFlow >= 0 ? "#1B3B22" : "#DC2626", lineHeight: 1.1 }}>
            ₹{netCashFlow.toLocaleString()}
          </div>
          <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 6 }}>
            {netCashFlow >= 0 ? "Operating with positive cash flow" : "Operating deficit"}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "12px 18px",
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
              placeholder="Search by ID, description, reference..."
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

          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: 7,
              border: "1px solid #CBD5E1",
              fontSize: 12.5,
              background: "#FFF",
              fontWeight: 500,
            }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter Buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "all", label: "All Types" },
            { id: "income", label: "Income" },
            { id: "expense", label: "Expenses" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setTypeFilter(btn.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: typeFilter === btn.id ? "1px solid #1B3B22" : "1px solid #E2E8F0",
                background: typeFilter === btn.id ? "#EAF2EC" : "#FFFFFF",
                color: typeFilter === btn.id ? "#1B3B22" : "#475569",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Data Table */}
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
            <div style={{ fontSize: 14, color: "#64748B" }}>Querying financial transactions ledger...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Wallet size={36} style={{ color: "#94A3B8", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
              No Transactions Recorded
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px" }}>
              {search || categoryFilter !== "all"
                ? "No entries match your search filters."
                : "Record your first expense or generate an invoice to start the ledger."}
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: "8px 16px",
                background: "#1B3B22",
                color: "#FFF",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
              }}
            >
              Record First Entry
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}>
              <thead>
                <tr style={{ background: "#FAF8F5", borderBottom: "1px solid #E2DDD3", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Txn ID</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Date</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Category</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Description</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Mode / Ref</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "right" }}>Amount (₹)</th>
                  <th style={{ padding: "12px 16px", width: 44 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t._id || t.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1B3B22", fontSize: 12.5 }}>
                      {t.transactionId}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "#475569" }}>
                      {new Date(t.date || t.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontWeight: 700,
                          background: t.type === "income" ? "#EAF2EC" : "#F8FAFC",
                          color: t.type === "income" ? "#1B3B22" : "#475569",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        {t.category || (t.type === "income" ? "Sales" : "Expense")}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#0F172A", fontWeight: 600 }}>
                      {t.description}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748B" }}>
                      <div>{t.paymentMethod || "UPI"}</div>
                      {t.reference && <div style={{ fontSize: 10.5, color: "#94A3B8" }}>Ref: {t.reference}</div>}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        textAlign: "right",
                        fontWeight: 800,
                        fontSize: 14,
                        color: t.type === "income" ? "#166534" : "#DC2626",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}₹{(t.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(t)}
                        title="Delete Ledger Entry"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#DC2626",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Transaction Modal */}
      {showModal && (
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
              maxWidth: 460,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Record Financial Entry
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Type Switcher */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Transaction Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense", category: "Feed & Nutrition" })}
                    style={{
                      padding: "9px",
                      borderRadius: 8,
                      border: formData.type === "expense" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                      background: formData.type === "expense" ? "#FEF2F2" : "#FFFFFF",
                      color: formData.type === "expense" ? "#DC2626" : "#475569",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Operating Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income", category: "Sales" })}
                    style={{
                      padding: "9px",
                      borderRadius: 8,
                      border: formData.type === "income" ? "2px solid #166534" : "1px solid #CBD5E1",
                      background: formData.type === "income" ? "#EAF2EC" : "#FFFFFF",
                      color: formData.type === "income" ? "#166534" : "#475569",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Income Receipt
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 4500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 16,
                    fontWeight: 700,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12.5,
                      background: "#FFF",
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12.5,
                      background: "#FFF",
                    }}
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic sunflower seed restock & aviary heating bill"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Reference / UTR #
                  </label>
                  <input
                    type="text"
                    placeholder="Optional UTR"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 12.5,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  {saving ? "Saving..." : "Record Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

