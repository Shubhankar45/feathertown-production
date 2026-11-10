import { useEffect, useState, useMemo } from "react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";

const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updated = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      toast.success(`Order marked as "${newStatus}"`);
    } catch (err) {
      toast.error(err.message || "Could not update order status");
    }
  };

  const exportCSV = () => {
    if (!orders.length) return toast.warn("No orders to export");
    const headers = ["Order ID", "Date", "Customer", "Email", "Phone", "Amount", "Payment", "Status", "Items"];
    const rows = orders.map((o) => [
      o._id,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.shippingAddress?.fullName || ""}"`,
      o.userEmail || o.shippingAddress?.email || "",
      o.shippingAddress?.phone || "",
      o.amount,
      o.paymentMethod || "COD",
      o.orderStatus,
      o.items?.length || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `featherstown-orders-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders CSV exported");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = selectedStatus === "all" || o.orderStatus === selectedStatus;
      const s = search.toLowerCase();
      const matchSearch =
        search === "" ||
        o._id.toLowerCase().includes(s) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(s) ||
        o.shippingAddress?.email?.toLowerCase().includes(s) ||
        o.shippingAddress?.phone?.includes(s);
      return matchStatus && matchSearch;
    });
  }, [orders, selectedStatus, search]);

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "cod")
    .reduce((sum, o) => sum + (o.amount || 0), 0);

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
            Customer Orders
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Review customer orders, dispatch parcels, manage delivery statuses, and export invoices.
          </p>
        </div>

        <button
          onClick={exportCSV}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#334155",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Download size={15} /> <span>Export Orders CSV</span></span>
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
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Total Orders</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>{orders.length}</div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#D97706", fontWeight: 600 }}>Pending Action</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706", marginTop: 4 }}>
            {orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "confirmed").length}
          </div>
        </div>
        <div style={metricCardStyle}>
          <div style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>Total Volume</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Status Pipeline Tabs & Search */}
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
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUSES.map((st) => {
            const active = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: active ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                  background: active ? "#ECFDF5" : "#F8FAFC",
                  color: active ? "#059669" : "#64748B",
                  fontSize: 12.5,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        <div style={{ position: "relative", width: 280 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
            
          </span>
          <input
            type="text"
            placeholder="Search by customer, phone, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              borderRadius: 8,
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              color: "#0F172A",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px dashed #CBD5E1",
            borderRadius: 14,
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Package size={36} color="#1B3B22" /></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
            No orders found
          </div>
          <p style={{ color: "#64748B", fontSize: 13.5 }}>
            {search || selectedStatus !== "all" ? "Try adjusting your search or tab filter." : "Orders placed by customers will appear here."}
          </p>
        </div>
      ) : (
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
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Order ID / Date</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Customer</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Items</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Amount</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "14px 16px", textAlign: "right", color: "#475569", fontWeight: 700 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#0284C7", fontWeight: 700 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 700, color: "#0F172A" }}>
                      {order.shippingAddress?.fullName || "Guest Customer"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B" }}>
                      {order.shippingAddress?.phone || order.shippingAddress?.email || "—"}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    {order.items?.length || 0} product(s)
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 800, color: "#059669", fontSize: 15 }}>₹{order.amount}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase" }}>
                      {order.paymentMethod || "COD"}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border:
                          order.orderStatus === "delivered"
                            ? "1px solid #86EFAC"
                            : order.orderStatus === "shipped"
                            ? "1px solid #BAE6FD"
                            : order.orderStatus === "cancelled"
                            ? "1px solid #FECACA"
                            : "1px solid #FDE68A",
                        background:
                          order.orderStatus === "delivered"
                            ? "#DCFCE7"
                            : order.orderStatus === "shipped"
                            ? "#E0F2FE"
                            : order.orderStatus === "cancelled"
                            ? "#FEE2E2"
                            : "#FEF3C7",
                        color:
                          order.orderStatus === "delivered"
                            ? "#15803D"
                            : order.orderStatus === "shipped"
                            ? "#0369A1"
                            : order.orderStatus === "cancelled"
                            ? "#DC2626"
                            : "#B45309",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: "#F8FAFC",
                        color: "#334155",
                        border: "1px solid #E2E8F0",
                        fontSize: 12.5,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
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
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.15)",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                  Order #{selectedOrder._id}
                </h2>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: "none", border: "none", color: "#64748B", fontSize: 22, cursor: "pointer" }}
              ><X size={16} strokeWidth={2.2} /></button>
            </div>

            {/* Customer & Shipping Details */}
            <div style={{ background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0", padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Shipping Destination
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                {selectedOrder.shippingAddress?.fullName}
              </div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                {selectedOrder.shippingAddress?.addressLine1}
                {selectedOrder.shippingAddress?.addressLine2 ? `, ${selectedOrder.shippingAddress?.addressLine2}` : ""}
              </div>
              <div style={{ fontSize: 13, color: "#475569" }}>
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
              </div>
              <div style={{ fontSize: 13, color: "#0284C7", marginTop: 6, fontWeight: 600 }}>
                Phone: {selectedOrder.shippingAddress?.phone}
              </div>
            </div>

            {/* Items Breakdown */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                Ordered Products
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 13.5 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>Qty: {item.quantity} × ₹{item.price}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#059669", fontSize: 14 }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 13, color: "#64748B" }}>Payment Mode: </span>
                <strong style={{ color: "#0F172A", textTransform: "uppercase" }}>
                  {selectedOrder.paymentMethod || "COD"}
                </strong>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
                Total: ₹{selectedOrder.amount}
              </div>
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
