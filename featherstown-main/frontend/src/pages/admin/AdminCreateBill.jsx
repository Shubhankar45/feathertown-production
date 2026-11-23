import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Receipt,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  Calendar,
  User,
  Search,
  FileText,
  Sparkles,
  RefreshCw,
  Feather,
  ShoppingBag,
  CreditCard,
  X,
} from "lucide-react";
import { adminFetch } from "../../utils/adminApi";
import { ADMIN_BASE } from "../../config/adminConfig";
import { toast } from "../../components/ui/Toast";
import PrintableInvoice from "../../components/admin/PrintableInvoice";
import { safeFormatCurrency, safeLower } from "../../utils/formatters";

export default function AdminCreateBill() {
  const navigate = useNavigate();

  // Reference Catalogs
  const [birds, setBirds] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

  // Customer State
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Karnataka",
    pincode: "",
  });

  // Invoice Line Items
  const [items, setItems] = useState([
    {
      id: "item_1",
      itemType: "accessory",
      productId: "",
      name: "",
      sku: "",
      rate: 0,
      quantity: 1,
      discount: 0,
      taxPercent: 18,
    },
  ]);

  // Overall Financial State
  const [taxPercent, setTaxPercent] = useState(18);
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("paid"); // "paid" | "partial" | "unpaid"
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState(
    "Thank you for trusting FeatherTown Aviary! Valid 7-day health warranty on companion birds when fed recommended diet."
  );

  // Bird Booking Special Attributes
  const [birdBooking, setBirdBooking] = useState({
    ringNumber: "",
    dnaSex: "Pending",
    handoverDate: "",
    healthCertified: true,
    weaningStage: "Fully Weaned & Flight Ready",
    specialInstructions: "",
  });

  // Submission & Print Modal State
  const [submitting, setSubmitting] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Load live catalogs on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingCatalogs(true);
        const [birdsRes, accRes, custRes] = await Promise.all([
          adminFetch("/api/admin/birds"),
          adminFetch("/api/admin/accessories"),
          adminFetch("/api/admin/customers"),
        ]);
        setBirds(Array.isArray(birdsRes) ? birdsRes : (Array.isArray(birdsRes?.birds) ? birdsRes.birds : []));
        setAccessories(Array.isArray(accRes) ? accRes : (Array.isArray(accRes?.accessories) ? accRes.accessories : []));
        setCustomers(Array.isArray(custRes) ? custRes : (Array.isArray(custRes?.customers) ? custRes.customers : []));
      } catch (err) {
        console.error("Failed to load catalog data:", err);
        toast.error("Could not fetch stock catalogs: " + err.message);
      } finally {
        setLoadingCatalogs(false);
      }
    }
    loadData();
  }, []);

  // Filtered customer search
  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return list.filter(
      (c) =>
        safeLower(c?.name).includes(q) ||
        safeLower(c?.phone).includes(q) ||
        safeLower(c?.email).includes(q)
    );
  }, [customers, customerSearch]);

  const handleSelectCustomer = (c) => {
    setSelectedCustomerId(c.id || c._id);
    setCustomer({
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "Karnataka",
      pincode: c.pincode || "",
    });
    setCustomerSearch("");
  };

  // Calculations
  const calculatedItems = useMemo(() => {
    return items.map((it) => {
      const gross = (Number(it.rate) || 0) * (Number(it.quantity) || 1);
      const disc = Math.min(gross, Number(it.discount) || 0);
      const net = gross - disc;
      return {
        ...it,
        total: Math.max(0, net),
      };
    });
  }, [items]);

  const subtotal = useMemo(() => {
    return calculatedItems.reduce((sum, it) => sum + it.total, 0);
  }, [calculatedItems]);

  const taxAmount = useMemo(() => {
    if (!taxPercent || taxPercent <= 0) return 0;
    return Math.round((subtotal * Number(taxPercent)) / 100);
  }, [subtotal, taxPercent]);

  const grandTotal = useMemo(() => {
    const total = subtotal + taxAmount - (Number(overallDiscount) || 0);
    return Math.max(0, Math.round(total));
  }, [subtotal, taxAmount, overallDiscount]);

  const balanceDue = useMemo(() => {
    if (paymentStatus === "paid") return 0;
    if (paymentStatus === "unpaid") return grandTotal;
    const paid = Number(paidAmount) || 0;
    return Math.max(0, grandTotal - paid);
  }, [grandTotal, paymentStatus, paidAmount]);

  // Check if any bird is in line items
  const hasCompanionBird = useMemo(() => {
    return items.some((it) => it.itemType === "bird");
  }, [items]);

  // Adjust paid amount default when grandTotal or status changes
  useEffect(() => {
    if (paymentStatus === "paid") {
      setPaidAmount(grandTotal);
    } else if (paymentStatus === "unpaid") {
      setPaidAmount(0);
    }
  }, [paymentStatus, grandTotal]);

  // Add line item
  const handleAddItem = (type = "accessory") => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}_${Math.random()}`,
        itemType: type,
        productId: "",
        name: "",
        sku: "",
        rate: 0,
        quantity: 1,
        discount: 0,
        taxPercent: type === "bird" ? 0 : 18,
      },
    ]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length === 1) {
      toast.error("Invoice must have at least one line item");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  // When user selects a bird from dropdown
  const handleBirdSelect = (idx, birdId) => {
    const bird = birds.find((b) => (b.id === birdId || b._id === birdId));
    if (!bird) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        productId: bird.id || bird._id,
        name: `${bird.name} (${bird.breed || "Companion Bird"})`,
        sku: bird.ringNumber || `RING-${bird.id?.slice(-5) || "001"}`,
        rate: bird.price || 0,
        quantity: 1,
        taxPercent: 0, // Livestock exempt in India
      };
      return copy;
    });

    // Auto sync into bird booking
    setBirdBooking((prev) => ({
      ...prev,
      ringNumber: bird.ringNumber || `FT-RING-${Date.now().toString().slice(-4)}`,
      dnaSex: bird.dnaGender || "Certified Male",
    }));
  };

  // When user selects an accessory from dropdown
  const handleAccessorySelect = (idx, accId) => {
    const acc = accessories.find((a) => (a.id === accId || a._id === accId));
    if (!acc) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        productId: acc.id || acc._id,
        name: acc.name,
        sku: acc.sku || `SKU-${acc.id?.slice(-4)}`,
        rate: acc.price || 0,
        quantity: 1,
        taxPercent: 18,
      };
      return copy;
    });
  };

  // Submit Invoice Creation
  const handleSubmitInvoice = async (e) => {
    e.preventDefault();

    if (!customer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!customer.phone.trim()) {
      toast.error("Customer phone number is required");
      return;
    }
    if (items.some((it) => !it.name.trim() || Number(it.rate) < 0)) {
      toast.error("Please provide valid descriptions and rates for all line items");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          state: customer.state.trim(),
          pincode: customer.pincode.trim(),
        },
        items: calculatedItems.map((it) => ({
          productId: it.productId || undefined,
          itemType: it.itemType || "accessory",
          name: it.name,
          sku: it.sku || "",
          rate: Number(it.rate) || 0,
          quantity: Number(it.quantity) || 1,
          discount: Number(it.discount) || 0,
          total: Number(it.total) || 0,
        })),
        taxPercent: Number(taxPercent) || 0,
        taxAmount: taxAmount,
        discount: Number(overallDiscount) || 0,
        subtotal: subtotal,
        grandTotal: grandTotal,
        paymentStatus: paymentStatus,
        paidAmount: paymentStatus === "paid" ? grandTotal : Number(paidAmount) || 0,
        balanceDue: balanceDue,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference.trim(),
        notes: notes.trim(),
        birdBooking: hasCompanionBird ? birdBooking : null,
      };

      const res = await adminFetch("/api/admin/invoices", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success(`Tax Invoice ${res.invoiceNumber} generated successfully!`);
      setGeneratedInvoice(res);
      setShowPrintModal(true);
    } catch (err) {
      console.error("Invoice creation failed:", err);
      toast.error(err.message || "Could not generate invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => navigate(`${ADMIN_BASE}`)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              background: "#FFFFFF",
              border: "1px solid #D6DFD8",
              borderRadius: 8,
              cursor: "pointer",
              color: "#1B3B22",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#1B3B22",
                margin: 0,
              }}
            >
              Point of Sale & Billing Generator
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
              Issue GST-compliant tax invoices for companion birds, seeds, cages, and aviary supplies.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to={`${ADMIN_BASE}/invoices`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 8,
              color: "#0F172A",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <FileText size={15} />
            Invoice Directory
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmitInvoice}>
        {/* Customer Information Card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 22,
            marginBottom: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <User size={18} style={{ color: "#1B3B22" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                1. Customer Details
              </h2>
            </div>

            {/* Quick Autocomplete Search */}
            <div style={{ position: "relative", width: 280 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#FAF8F5",
                  border: "1px solid #D6DFD8",
                  borderRadius: 8,
                  padding: "6px 10px",
                }}
              >
                <Search size={14} style={{ color: "#64748B", marginRight: 6 }} />
                <input
                  type="text"
                  placeholder="Lookup existing customer..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: 12.5,
                    width: "100%",
                  }}
                />
              </div>

              {/* Autocomplete Dropdown */}
              {filteredCustomers.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: 8,
                    marginTop: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 20,
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
                >
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id || c._id}
                      onClick={() => handleSelectCustomer(c)}
                      style={{
                        padding: "8px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        borderBottom: "1px solid #F1F5F9",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF8F5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                    >
                      <div style={{ fontWeight: 700, color: "#1B3B22" }}>{c.name}</div>
                      <div style={{ color: "#64748B" }}>
                        {c.phone} • {c.city || "Bangalore"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                WhatsApp / Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98765 43210"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. ramesh@example.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                City & State
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <input
                  type="text"
                  placeholder="Bangalore"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <input
                  type="text"
                  placeholder="Karnataka"
                  value={customer.state}
                  onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
              Delivery / Billing Address
            </label>
            <input
              type="text"
              placeholder="Apartment, Street, Landmark, Pincode"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Line Items Card */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 22,
            marginBottom: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Receipt size={18} style={{ color: "#1B3B22" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                2. Line Items & Inventory
              </h2>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => handleAddItem("bird")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 7,
                  background: "#FAF5FF",
                  color: "#7E22CE",
                  border: "1px solid #E9D5FF",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Feather size={14} />
                + Live Bird
              </button>

              <button
                type="button"
                onClick={() => handleAddItem("accessory")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 7,
                  background: "#EAF2EC",
                  color: "#1B3B22",
                  border: "1px solid #CCE0D0",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <ShoppingBag size={14} />
                + Accessory / Seed
              </button>

              <button
                type="button"
                onClick={() => handleAddItem("service")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 7,
                  background: "#F1F5F9",
                  color: "#334155",
                  border: "1px solid #CBD5E1",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />
                + Custom Service
              </button>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#FAF8F5", borderBottom: "1px solid #E2DDD3", textAlign: "left" }}>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Type</th>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Product / Description</th>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", width: 110 }}>SKU / Ring #</th>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", width: 110 }}>Rate (₹)</th>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", width: 80 }}>Qty</th>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", width: 90 }}>Disc (₹)</th>
                  <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", width: 100, textAlign: "right" }}>Total (₹)</th>
                  <th style={{ padding: "10px 12px", width: 44 }}></th>
                </tr>
              </thead>
              <tbody>
                {calculatedItems.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    {/* Item Type Badge */}
                    <td style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background:
                            item.itemType === "bird"
                              ? "#FAF5FF"
                              : item.itemType === "accessory"
                              ? "#EAF2EC"
                              : "#F1F5F9",
                          color:
                            item.itemType === "bird"
                              ? "#7E22CE"
                              : item.itemType === "accessory"
                              ? "#1B3B22"
                              : "#475569",
                        }}
                      >
                        {item.itemType}
                      </span>
                    </td>

                    {/* Product Selector / Name */}
                    <td style={{ padding: "10px 12px" }}>
                      {item.itemType === "bird" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <select
                            value={item.productId || ""}
                            onChange={(e) => handleBirdSelect(idx, e.target.value)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #CBD5E1",
                              fontSize: 12.5,
                              background: "#FFF",
                              fontWeight: 600,
                            }}
                          >
                            <option value="">-- Select Available Aviary Bird --</option>
                            {birds.map((b) => (
                              <option key={b.id || b._id} value={b.id || b._id}>
                                {b.name} ({b.breed}) - {safeFormatCurrency(b.price)} [{b.status}]
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Description / Bird details"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: "1px solid #E2E8F0",
                              fontSize: 12,
                            }}
                          />
                        </div>
                      ) : item.itemType === "accessory" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <select
                            value={item.productId || ""}
                            onChange={(e) => handleAccessorySelect(idx, e.target.value)}
                            style={{
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #CBD5E1",
                              fontSize: 12.5,
                              background: "#FFF",
                              fontWeight: 600,
                            }}
                          >
                            <option value="">-- Select Accessory / Diet / Cage --</option>
                            {accessories.map((a) => (
                              <option key={a.id || a._id} value={a.id || a._id}>
                                {a.name} (Stock: {a.stock}) - ₹{a.price}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: "1px solid #E2E8F0",
                              fontSize: 12,
                            }}
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aviary Safe Interstate Transport"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: "1px solid #CBD5E1",
                            fontSize: 12.5,
                          }}
                        />
                      )}
                    </td>

                    {/* SKU / Ring # */}
                    <td style={{ padding: "10px 12px" }}>
                      <input
                        type="text"
                        placeholder="SKU/Ring"
                        value={item.sku}
                        onChange={(e) => handleItemChange(idx, "sku", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #CBD5E1",
                          fontSize: 12,
                        }}
                      />
                    </td>

                    {/* Rate */}
                    <td style={{ padding: "10px 12px" }}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #CBD5E1",
                          fontSize: 12.5,
                          fontWeight: 700,
                          textAlign: "right",
                        }}
                      />
                    </td>

                    {/* Qty */}
                    <td style={{ padding: "10px 12px" }}>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #CBD5E1",
                          fontSize: 12.5,
                          textAlign: "center",
                        }}
                      />
                    </td>

                    {/* Discount */}
                    <td style={{ padding: "10px 12px" }}>
                      <input
                        type="number"
                        min="0"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid #CBD5E1",
                          fontSize: 12.5,
                          textAlign: "right",
                        }}
                      />
                    </td>

                    {/* Line Total */}
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#1B3B22" }}>
                      {safeFormatCurrency(item.total)}
                    </td>

                    {/* Delete */}
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#DC2626",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Companion Bird Health Certification & Handover Box (Shows only if bird is selected) */}
        {hasCompanionBird && (
          <div
            style={{
              background: "#FAF5FF",
              border: "1px solid #E9D5FF",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Feather size={18} style={{ color: "#7E22CE" }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#581C87", margin: 0 }}>
                Companion Bird Avian Health & Closed-Ring Specifications
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B21A8", marginBottom: 4 }}>
                  Closed Seamless Leg Ring Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. FT-IN-2026-9041"
                  value={birdBooking.ringNumber}
                  onChange={(e) => setBirdBooking({ ...birdBooking, ringNumber: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #D8B4FE",
                    fontSize: 12.5,
                    background: "#FFFFFF",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B21A8", marginBottom: 4 }}>
                  Avian DNA Sex Certificate
                </label>
                <select
                  value={birdBooking.dnaSex}
                  onChange={(e) => setBirdBooking({ ...birdBooking, dnaSex: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #D8B4FE",
                    fontSize: 12.5,
                    background: "#FFFFFF",
                    fontWeight: 600,
                  }}
                >
                  <option value="Certified Male">Certified Male (DNA Lab Proven)</option>
                  <option value="Certified Female">Certified Female (DNA Lab Proven)</option>
                  <option value="Pending">Pending Laboratory Result</option>
                  <option value="Visual Dimorphic">Visual Dimorphic Identification</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B21A8", marginBottom: 4 }}>
                  Handover / Weaning Readiness Date
                </label>
                <input
                  type="date"
                  value={birdBooking.handoverDate}
                  onChange={(e) => setBirdBooking({ ...birdBooking, handoverDate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #D8B4FE",
                    fontSize: 12.5,
                    background: "#FFFFFF",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B21A8", marginBottom: 4 }}>
                  Weaning & Socialization Stage
                </label>
                <select
                  value={birdBooking.weaningStage}
                  onChange={(e) => setBirdBooking({ ...birdBooking, weaningStage: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid #D8B4FE",
                    fontSize: 12.5,
                    background: "#FFFFFF",
                  }}
                >
                  <option value="Fully Weaned & Flight Ready">Fully Weaned & Flight Ready</option>
                  <option value="Semi-Weaned (1 Formula Feed/Day)">Semi-Weaned (1 Feed/Day)</option>
                  <option value="Hand-Tamed Companion">Hand-Tamed Companion</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Summary & Payment Tracking Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Left: Payment Method & Status */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: 22,
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <CreditCard size={18} style={{ color: "#1B3B22" }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                3. Payment Tracking & Ledger Sync
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Payment Status
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("paid")}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: paymentStatus === "paid" ? "2px solid #166534" : "1px solid #E2E8F0",
                      background: paymentStatus === "paid" ? "#EAF2EC" : "#FFFFFF",
                      color: paymentStatus === "paid" ? "#166534" : "#475569",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Paid in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("partial")}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: paymentStatus === "partial" ? "2px solid #D97706" : "1px solid #E2E8F0",
                      background: paymentStatus === "partial" ? "#FEF3C7" : "#FFFFFF",
                      color: paymentStatus === "partial" ? "#92400E" : "#475569",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Partial Advance
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("unpaid")}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: paymentStatus === "unpaid" ? "2px solid #DC2626" : "1px solid #E2E8F0",
                      background: paymentStatus === "unpaid" ? "#FEF2F2" : "#FFFFFF",
                      color: paymentStatus === "unpaid" ? "#991B1B" : "#475569",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Unpaid / Credit
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    Payment Mode
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #CBD5E1",
                      fontSize: 13,
                      background: "#FFF",
                    }}
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Card">Credit / Debit Card (POS)</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
                    UTR / Transaction Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-401928491823"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
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
                  Invoice Notes & Terms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 12.5,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Tax & Balance Calculation Breakdown */}
          <div
            style={{
              background: "#FAF8F5",
              border: "1px solid #E2DDD3",
              borderRadius: 12,
              padding: 22,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1B3B22", margin: "0 0 16px" }}>
              Financial Breakdown
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                <span style={{ color: "#475569" }}>Subtotal:</span>
                <span style={{ fontWeight: 700, color: "#0F172A" }}>{safeFormatCurrency(subtotal)}</span>
              </div>

              {/* GST Tax Selector */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 }}>
                <span style={{ color: "#475569" }}>GST Rate:</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid #CBD5E1",
                      fontSize: 12,
                      background: "#FFF",
                    }}
                  >
                    <option value="0">0% (Livestock / Exempt)</option>
                    <option value="5">5% (Essential Food)</option>
                    <option value="12">12% (Standard Supplies)</option>
                    <option value="18">18% (Accessories / Cages)</option>
                  </select>
                  <span style={{ fontWeight: 700, color: "#0F172A" }}>+{safeFormatCurrency(taxAmount)}</span>
                </div>
              </div>

              {/* Additional Overall Discount */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5 }}>
                <span style={{ color: "#475569" }}>Additional Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={overallDiscount}
                  onChange={(e) => setOverallDiscount(e.target.value)}
                  style={{
                    width: 90,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12.5,
                    textAlign: "right",
                  }}
                />
              </div>

              <div
                style={{
                  borderTop: "2px dashed #D6DFD8",
                  paddingTop: 12,
                  marginTop: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#1B3B22",
                }}
              >
                <span>Grand Total:</span>
                <span>{safeFormatCurrency(grandTotal)}</span>
              </div>

              {/* Paid vs Due */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                <span style={{ color: "#166534", fontWeight: 700 }}>Amount Paid:</span>
                {paymentStatus === "partial" ? (
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    style={{
                      width: 100,
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: "1px solid #166534",
                      fontSize: 13,
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  />
                ) : (
                  <span style={{ fontWeight: 700, color: "#166534" }}>
                    {safeFormatCurrency(paymentStatus === "paid" ? grandTotal : 0)}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 15,
                  fontWeight: 700,
                  color: balanceDue > 0 ? "#DC2626" : "#475569",
                  borderTop: "1px solid #E2DDD3",
                  paddingTop: 8,
                }}
              >
                <span>Balance Due:</span>
                <span>{safeFormatCurrency(balanceDue)}</span>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "13px 20px",
                  borderRadius: 10,
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: "0 2px 8px rgba(27, 59, 34, 0.25)",
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Recording in DB & Generating...
                  </>
                ) : (
                  <>
                    <Printer size={18} />
                    Generate & Print Official Tax Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Printable Invoice Modal Preview */}
      {showPrintModal && generatedInvoice && (
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
            {/* Modal Header Bar */}
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
                <CheckCircle2 size={20} style={{ color: "#166534" }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: "#1B3B22" }}>
                  Invoice Generated: {generatedInvoice.invoiceNumber}
                </span>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                style={{
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 10px",
                  cursor: "pointer",
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Invoice Component */}
            <div style={{ padding: 20 }}>
              <PrintableInvoice invoice={generatedInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

