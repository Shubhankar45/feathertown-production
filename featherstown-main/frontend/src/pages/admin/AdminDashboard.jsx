import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../utils/adminApi";
import { ADMIN_BASE } from "../../config/adminConfig";
import { toast } from "../../components/ui/Toast";
import { resolveBirdImage } from "../../context/BirdsContext";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [accessories, orders, reviews, subscribers, birdsData] = await Promise.all([
        adminFetch("/api/admin/accessories"),
        adminFetch("/api/admin/orders"),
        adminFetch("/api/admin/reviews"),
        adminFetch("/api/admin/subscribers"),
        adminFetch("/api/admin/birds"),
      ]);

      const pendingOrders = orders.filter(
        (o) => o.orderStatus === "pending" || o.orderStatus === "confirmed"
      ).length;

      const revenue = orders
        .filter((o) => o.paymentStatus === "paid" || o.paymentStatus === "cod")
        .reduce((sum, o) => sum + (o.amount || 0), 0);

      const lowStockAccessories = accessories.filter((a) => (a.stock || 0) <= 5).length;
      const availableBirds = birdsData.filter((b) => b.status === "available").length;

      setStats({
        accessories: accessories.length,
        lowStockAccessories,
        orders: orders.length,
        pendingOrders,
        revenue,
        reviews: reviews.length,
        subscribers: subscribers.length,
        birds: birdsData.length,
        availableBirds,
      });

      setRecentOrders(orders.slice(0, 5));
      setBirds(birdsData.slice(0, 6));
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickBirdStatus = async (birdId, newStatus) => {
    try {
      await adminFetch(`/api/admin/birds/${birdId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setBirds((prev) =>
        prev.map((b) => (b._id === birdId ? { ...b, status: newStatus } : b))
      );
      toast.success(`Bird status changed to "${newStatus}"`);
    } catch (err) {
      toast.error(err.message || "Could not update status");
    }
  };

  const handleQuickOrderStatus = async (orderId, newStatus) => {
    try {
      await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      setRecentOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : b))
      );
      toast.success(`Order marked as "${newStatus}"`);
    } catch (err) {
      toast.error(err.message || "Could not update order status");
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Welcome Banner */}
      <div
        className="rv"
        style={{
          background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 50%, #EFF6FF 100%)",
          border: "1px solid #A7F3D0",
          borderRadius: 20,
          padding: "clamp(20px, 3vw, 32px)",
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 99, background: "#DCFCE7", color: "#15803D", fontSize: 12, fontWeight: 700, marginBottom: 10, border: "1px solid #BBF7D0" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
            FeatherTown Control Center
          </div>
          <h1 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
            Welcome back to Admin Console
          </h1>
          <p style={{ color: "#475569", fontSize: 14, maxWidth: 640 }}>
            Here is your live summary of companion bird listings, customer orders, inventory levels, and store performance.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to={`${ADMIN_BASE}/birds`}
            className="ft-btn-hover"
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #10B981, #059669)",
              color: "#FFFFFF",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Feather size={16} /> <span>Manage Birds</span></span>
          </Link>
          <Link
            to={`${ADMIN_BASE}/accessories`}
            className="ft-btn-hover"
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              color: "#0F172A",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ShoppingBag size={16} /> <span>Accessories</span></span>
          </Link>
          <Link
            to={`${ADMIN_BASE}/settings`}
            className="ft-btn-hover"
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              color: "#475569",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Settings size={16} /> <span>Settings</span></span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FEE2E2",
            padding: "14px 18px",
            borderRadius: 12,
            color: "#DC2626",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      {/* 6 Metric KPI Cards */}
      <div
        className="rv-stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Link to={`${ADMIN_BASE}/birds`} className="ft-card-lift" style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <Feather size={24} color="#1B3B22" />
            <span style={pillStyle("#22C55E")}>{stats ? `${stats.availableBirds} Available` : "..."}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600 }}>Birds &amp; Breeds</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            {stats ? stats.birds : "..."}
          </div>
        </Link>

        <Link to={`${ADMIN_BASE}/accessories`} className="ft-card-lift" style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <ShoppingBag size={24} color="#1B3B22" />
            {stats && stats.lowStockAccessories > 0 && (
              <span style={pillStyle("#F59E0B")}>{stats.lowStockAccessories} Low Stock</span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600 }}>Accessories Catalog</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            {stats ? stats.accessories : "..."}
          </div>
        </Link>

        <Link to={`${ADMIN_BASE}/orders`} className="ft-card-lift" style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <Package size={24} color="#1B3B22" />
            <span style={pillStyle(stats?.pendingOrders > 0 ? "#F59E0B" : "#22C55E")}>
              {stats ? `${stats.pendingOrders} To Action` : "..."}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600 }}>Total Customer Orders</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            {stats ? stats.orders : "..."}
          </div>
        </Link>

        <Link to={`${ADMIN_BASE}/orders`} className="ft-card-lift" style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <TrendingUp size={24} color="#1B3B22" />
            <span style={pillStyle("#38BDF8")}>Paid + COD</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600 }}>Gross Shop Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0284C7", marginTop: 4 }}>
            {stats ? `₹${stats.revenue.toLocaleString("en-IN")}` : "..."}
          </div>
        </Link>

        <Link to={`${ADMIN_BASE}/reviews`} className="ft-card-lift" style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>⭐</span>
            <span style={pillStyle("#F59E0B")}>Verified</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600 }}>Customer Reviews</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            {stats ? stats.reviews : "..."}
          </div>
        </Link>

        <Link to={`${ADMIN_BASE}/subscribers`} className="ft-card-lift" style={kpiCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <Mail size={24} color="#1B3B22" />
            <span style={pillStyle("#A855F7")}>Audience</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#64748B", fontWeight: 600 }}>Email Subscribers</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", marginTop: 4 }}>
            {stats ? stats.subscribers : "..."}
          </div>
        </Link>
      </div>

      {/* Two Column Grid: Quick Birds Availability & Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        {/* QUICK BIRD AVAILABILITY */}
        <div style={sectionCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Quick Bird Availability</h2>
              <p style={{ fontSize: 12, color: "#64748B" }}>Change breed availability directly in 1 click.</p>
            </div>
            <Link to={`${ADMIN_BASE}/birds`} style={{ fontSize: 12.5, color: "#059669", textDecoration: "none", fontWeight: 600 }}>
              View All ({birds.length}) →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {birds.map((bird) => {
              const imgSrc = resolveBirdImage(bird.image);
              return (
                <div
                  key={bird._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={imgSrc}
                      alt={bird.name}
                      style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>{bird.name}</div>
                      <div style={{ fontSize: 11, color: "#D97706", fontWeight: 600 }}>{bird.price}</div>
                    </div>
                  </div>

                  <select
                    value={bird.status}
                    onChange={(e) => handleQuickBirdStatus(bird._id, e.target.value)}
                    style={{
                      padding: "5px 10px",
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
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ORDERS STREAM */}
        <div style={sectionCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>Recent Customer Orders</h2>
              <p style={{ fontSize: 12, color: "#64748B" }}>Latest orders placed on storefront.</p>
            </div>
            <Link to={`${ADMIN_BASE}/orders`} style={{ fontSize: 12.5, color: "#059669", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "#94A3B8", fontSize: 13.5 }}>
              No orders placed yet. Orders will appear here live when customers purchase accessories.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>
                      {order.shippingAddress?.fullName || "Customer"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B" }}>
                      ₹{order.amount} • {order.items?.length || 0} item(s) • {order.paymentMethod?.toUpperCase()}
                    </div>
                  </div>

                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleQuickOrderStatus(order._id, e.target.value)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "none",
                      background:
                        order.orderStatus === "delivered"
                          ? "#16A34A"
                          : order.orderStatus === "shipped"
                          ? "#0284C7"
                          : order.orderStatus === "cancelled"
                          ? "#EF4444"
                          : "#F59E0B",
                      color: "#FFFFFF",
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const kpiCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: "20px 22px",
  textDecoration: "none",
  display: "block",
  transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
};

const sectionCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
};

const pillStyle = (color) => {
  const isGreen = color === "#22C55E" || color === "#16A34A";
  const isAmber = color === "#F59E0B" || color === "#D97706";
  const isBlue = color === "#38BDF8" || color === "#0284C7";
  const bg = isGreen ? "#ECFDF5" : isAmber ? "#FFFBEB" : isBlue ? "#F0F9FF" : "#FAF5FF";
  const text = isGreen ? "#059669" : isAmber ? "#D97706" : isBlue ? "#0284C7" : "#7E22CE";
  const border = isGreen ? "#A7F3D0" : isAmber ? "#FDE68A" : isBlue ? "#BAE6FD" : "#E9D5FF";
  return {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 99,
    background: bg,
    color: text,
    border: `1px solid ${border}`,
  };
};
