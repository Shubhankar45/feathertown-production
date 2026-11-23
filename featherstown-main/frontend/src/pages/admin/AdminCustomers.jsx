import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  X,
  CreditCard,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { adminFetch } from "../../utils/adminApi";
import { ADMIN_BASE } from "../../config/adminConfig";
import { toast } from "../../components/ui/Toast";
import { safeFormatDate, safeFormatCurrency, safeLower } from "../../utils/formatters";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Customer Drawer / Details Modal
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Add / Edit Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Karnataka",
    pincode: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/customers");
      const list = Array.isArray(res) ? res : (Array.isArray(res?.customers) ? res.customers : []);
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers:", err);
      toast.error("Could not fetch customer database: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((c) => {
      if (!c || typeof c !== "object") return false;
      return (
        safeLower(c.name).includes(q) ||
        safeLower(c.phone).includes(q) ||
        safeLower(c.email).includes(q) ||
        safeLower(c.city).includes(q)
      );
    });
  }, [customers, search]);

  // Open Customer Profile & Fetch Invoices
  const handleOpenCustomer = async (cust) => {
    setActiveCustomer(cust);
    try {
      setLoadingHistory(true);
      const res = await adminFetch(`/api/admin/customers/${cust._id || cust.id}`);
      setCustomerInvoices(Array.isArray(res?.invoices) ? res.invoices : []);
    } catch (err) {
      console.error("Failed to fetch customer history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Add / Edit
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "",
      notes: "",
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (cust, e) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || "",
      phone: cust.phone || "",
      email: cust.email || "",
      address: cust.address || "",
      city: cust.city || "Bangalore",
      state: cust.state || "Karnataka",
      pincode: cust.pincode || "",
      notes: cust.notes || "",
    });
    setShowFormModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Customer name and phone are required");
      return;
    }

    try {
      setSaving(true);
      if (editingCustomer) {
        await adminFetch(`/api/admin/customers/${editingCustomer._id || editingCustomer.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        toast.success("Customer record updated!");
      } else {
        await adminFetch("/api/admin/customers", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toast.success("New customer profile created!");
      }
      setShowFormModal(false);
      loadCustomers();
    } catch (err) {
      toast.error(err.message || "Failed to save customer record");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (cust, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete profile for ${cust.name}? Historical invoices and orders will not be deleted.`)) {
      return;
    }
    try {
      await adminFetch(`/api/admin/customers/${cust._id || cust.id}`, {
        method: "DELETE",
      });
      toast.success("Customer removed from directory");
      loadCustomers();
      if (activeCustomer && (activeCustomer._id || activeCustomer.id) === (cust._id || cust.id)) {
        setActiveCustomer(null);
      }
    } catch (err) {
      toast.error(err.message || "Could not delete customer");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      toast.error("No customer records to export");
      return;
    }
    const headers = ["Name", "Phone", "Email", "City", "Total Orders", "Total Spent (₹)", "Joined Date"];
    const rows = filteredCustomers.map((c) => [
      `"${c?.name || ""}"`,
      `"${c?.phone || ""}"`,
      `"${c?.email || ""}"`,
      `"${c?.city || ""}"`,
      Number(c?.totalOrders) || 0,
      Number(c?.totalSpent) || 0,
      `"${safeFormatDate(c?.createdAt)}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FeatherTown_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer list exported to CSV!");
  };

  // Summary Metrics
  const totalSpentAll = customers.reduce((acc, c) => acc + (Number(c?.totalSpent) || 0), 0);
  const avgSpend = customers.length > 0 ? Math.round(totalSpentAll / customers.length) : 0;
  const vipCount = customers.filter((c) => (Number(c?.totalSpent) || 0) >= 10000).length;

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
            Customer Directory & Accounts
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
            Real client profiles, omnichannel lifetime value, and order history.
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
            onClick={handleOpenCreate}
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
            Add Customer Profile
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Total Registered Customers
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#1B3B22", marginTop: 4 }}>
            {customers.length}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Across online & aviary sales</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Total Customer LTV
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#166534", marginTop: 4 }}>
            ₹{totalSpentAll.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Cumulative lifetime purchases</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            Average Spend Per Client
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            ₹{avgSpend.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Average order volume</div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
            VIP Aviary Patrons
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginTop: 4 }}>
            {vipCount}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8" }}>Spend &gt; ₹10,000</div>
        </div>
      </div>

      {/* Search Input */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#FAF8F5",
            border: "1px solid #D6DFD8",
            borderRadius: 8,
            padding: "6px 12px",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Search size={15} style={{ color: "#64748B", marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, city..."
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
        <div style={{ fontSize: 12.5, color: "#64748B" }}>
          Showing <strong>{filteredCustomers.length}</strong> of {customers.length} clients
        </div>
      </div>

      {/* Customers Data Table */}
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
            <div style={{ fontSize: 14, color: "#64748B" }}>Querying real customer database...</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Users size={36} style={{ color: "#94A3B8", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 6px" }}>
              No Customers Found
            </h3>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px" }}>
              {search ? "No records match your query." : "Customer records are created automatically when orders or bills are issued."}
            </p>
            <button
              onClick={handleOpenCreate}
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
              Add First Customer
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#FAF8F5", borderBottom: "1px solid #E2DDD3", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Customer Name</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Contact Info</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>City / Location</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "center" }}>Total Orders</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "right" }}>Lifetime Spend (₹)</th>
                  <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c, idx) => (
                  <tr
                    key={c?._id || c?.id || idx}
                    onClick={() => handleOpenCustomer(c)}
                    style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF8F5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#1B3B22", fontSize: 13.5 }}>{c?.name || "Customer"}</div>
                      {(Number(c?.totalSpent) || 0) >= 10000 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "2px 6px", borderRadius: 4 }}>
                          VIP Patron
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5 }}>
                      <div style={{ color: "#0F172A", fontWeight: 600 }}>{c?.phone || "—"}</div>
                      <div style={{ color: "#64748B" }}>{c?.email || "No email"}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12.5, color: "#475569" }}>
                      {c?.city || "Bangalore"}, {c?.state || "Karnataka"}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 700, color: "#0F172A" }}>
                      {Number(c?.totalOrders) || 0}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: 800, color: "#166534" }}>
                      {safeFormatCurrency(c?.totalSpent)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(c, e)}
                          title="Edit Customer Details"
                          style={{
                            background: "#FAF8F5",
                            border: "1px solid #D6DFD8",
                            borderRadius: 6,
                            padding: "5px 8px",
                            cursor: "pointer",
                            color: "#1B3B22",
                          }}
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomer(c, e)}
                          title="Delete Customer Profile"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#DC2626",
                            cursor: "pointer",
                            padding: "5px 8px",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile & Invoices Drawer */}
      {activeCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(3px)",
            zIndex: 1100,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              background: "#FAF8F5",
              width: "100%",
              maxWidth: 540,
              height: "100%",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "#FFFFFF",
                borderBottom: "1px solid #E2E8F0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Customer Profile
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1B3B22", margin: "2px 0 0" }}>
                  {activeCustomer.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveCustomer(null)}
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

            {/* Profile Content */}
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Quick Info Box */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <Phone size={15} style={{ color: "#1B3B22" }} />
                  <strong>{activeCustomer.phone}</strong>
                </div>
                {activeCustomer.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <Mail size={15} style={{ color: "#1B3B22" }} />
                    <span>{activeCustomer.email}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <MapPin size={15} style={{ color: "#1B3B22" }} />
                  <span>
                    {activeCustomer.address ? `${activeCustomer.address}, ` : ""}
                    {activeCustomer.city || "Bangalore"}, {activeCustomer.state || "Karnataka"}
                  </span>
                </div>
              </div>

              {/* Spend Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#EAF2EC", border: "1px solid #CCE0D0", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>
                    Lifetime Purchases
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1B3B22", marginTop: 2 }}>
                    ₹{(activeCustomer.totalSpent || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                    Total Orders / Invoices
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
                    {activeCustomer.totalOrders || 0}
                  </div>
                </div>
              </div>

              {/* Action: Create bill for this customer */}
              <Link
                to={`${ADMIN_BASE}/create-bill`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px",
                  borderRadius: 8,
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <Receipt size={16} />
                Create New Bill For {activeCustomer.name.split(" ")[0]}
              </Link>

              {/* Historical Invoices */}
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", margin: "0 0 10px" }}>
                  Invoice History
                </h3>
                {loadingHistory ? (
                  <div style={{ textAlign: "center", padding: 20, color: "#64748B", fontSize: 13 }}>
                    Fetching records...
                  </div>
                ) : customerInvoices.length === 0 ? (
                  <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: 20, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                    No invoices generated under this profile yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(Array.isArray(customerInvoices) ? customerInvoices : []).map((inv) => (
                      <div
                        key={inv._id || inv.id}
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          padding: "12px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: "#1B3B22", fontSize: 13 }}>
                            {inv?.invoiceNumber || "Invoice"}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>
                            {safeFormatDate(inv?.createdAt)} • {inv?.paymentStatus || "unpaid"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14 }}>
                            {safeFormatCurrency(inv?.grandTotal)}
                          </div>
                          <Link
                            to={`${ADMIN_BASE}/invoices`}
                            style={{ fontSize: 11, color: "#1B3B22", textDecoration: "underline" }}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showFormModal && (
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
                {editingCustomer ? "Edit Customer Profile" : "Add New Customer Profile"}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                style={{ background: "transparent", border: "none", color: "#64748B", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98450 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. anand@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Full delivery / billing street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
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
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

