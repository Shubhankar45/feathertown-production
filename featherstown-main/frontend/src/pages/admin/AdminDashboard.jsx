import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Package,
  Feather,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Receipt,
  Calendar,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  Wallet,
  ExternalLink,
} from "lucide-react";
import { adminFetch } from "../../utils/adminApi";
import { ADMIN_BASE } from "../../config/adminConfig";
import { toast } from "../../components/ui/Toast";
import { resolveBirdImage } from "../../context/BirdsContext";
import { safeFormatDate, safeFormatCurrency } from "../../utils/formatters";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [birds, setBirds] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [analyticsData, birdsData, ordersData] = await Promise.all([
        adminFetch("/api/admin/analytics"),
        adminFetch("/api/admin/birds"),
        adminFetch("/api/admin/orders"),
      ]);

      setData(analyticsData);
      setBirds(Array.isArray(birdsData) ? birdsData.slice(0, 8) : []);
      setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 6) : []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Failed to load business analytics");
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
      toast.success(`Bird status updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err.message || "Failed to update bird status");
    }
  };

  const handleQuickOrderStatus = async (orderId, newStatus) => {
    try {
      await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      setRecentOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success(`Order marked as "${newStatus}"`);
    } catch (err) {
      toast.error(err.message || "Could not update order status");
    }
  };

  // Compute 30-Day Trend Chart SVG Points
  const trendPoints = useMemo(() => {
    if (!data?.trend30Days || !Array.isArray(data.trend30Days) || data.trend30Days.length < 2) return null;
    const days = data.trend30Days.filter((d) => d && typeof d === "object");
    if (days.length < 2) return null;
    const maxRev = Math.max(...days.map((d) => Math.max(Number(d?.revenue) || 0, Number(d?.expenses) || 0, 1000)));

    const width = 800;
    const height = 220;
    const padX = 20;
    const padY = 24;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    const divisor = Math.max(days.length - 1, 1);

    const revCoords = days.map((d, i) => {
      const x = padX + (i / divisor) * chartW;
      const y = height - padY - ((Number(d?.revenue) || 0) / (maxRev || 1)) * chartH;
      return { x, y, ...d };
    });

    const expCoords = days.map((d, i) => {
      const x = padX + (i / divisor) * chartW;
      const y = height - padY - ((Number(d?.expenses) || 0) / (maxRev || 1)) * chartH;
      return { x, y, ...d };
    });

    const revPath = revCoords.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ""
    );
    const expPath = expCoords.reduce(
      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      ""
    );

    const revArea = `${revPath} L ${padX + chartW} ${height - padY} L ${padX} ${height - padY} Z`;

    return {
      width,
      height,
      maxRev,
      revCoords,
      expCoords,
      revPath,
      expPath,
      revArea,
    };
  }, [data?.trend30Days]);

  if (loading && !data) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <RefreshCw
          size={32}
          className="animate-spin"
          style={{ color: "#1B3B22", margin: "0 auto 16px" }}
        />
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1B3B22" }}>
          Aggregating Real-Time Enterprise Analytics...
        </div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
          Querying MongoDB Atlas invoices, transactions, orders, and ledger
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FEE2E2",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
          maxWidth: 600,
          margin: "40px auto",
        }}
      >
        <AlertTriangle size={32} style={{ color: "#DC2626", margin: "0 auto 12px" }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#991B1B", marginBottom: 6 }}>
          Could Not Load Business Analytics
        </h3>
        <p style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 16 }}>{error}</p>
        <button
          onClick={loadDashboard}
          style={{
            padding: "8px 18px",
            background: "#1B3B22",
            color: "#FFF",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const summary = data?.summary || data || {};
  const {
    grossRevenue = 0,
    totalExpenses = 0,
    netProfit = 0,
    profitMargin = 0,
    totalOrders = 0,
    pendingBookings = 0,
    totalCustomers = 0,
    averageOrderValue = 0,
    totalBirds = 0,
    availableBirds = 0,
    totalAccessories = 0,
    lowStockCount = 0,
  } = summary;

  const categoryBreakdown = Array.isArray(data?.categoryBreakdown) ? data.categoryBreakdown : [];
  const paymentMethodBreakdown = Array.isArray(data?.paymentMethodBreakdown) ? data.paymentMethodBreakdown : [];
  const orderStatusFunnel = data?.orderStatusFunnel || {};
  const lowStockAlerts = Array.isArray(data?.lowStockAlerts) ? data.lowStockAlerts : [];
  const recentTransactions = Array.isArray(data?.recentTransactions) ? data.recentTransactions : [];
  const recentInvoices = Array.isArray(data?.recentInvoices) ? data.recentInvoices : [];

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Top Banner / Welcome Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 32,
              fontWeight: 700,
              color: "#1B3B22",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Executive Analytics & Operations
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#64748B" }}>
            Live financial ledger, companion bird reservations, and omnichannel sales metrics.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            onClick={loadDashboard}
            title="Refresh Live Data"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              background: "#FFFFFF",
              border: "1px solid #D6DFD8",
              borderRadius: 8,
              color: "#1B3B22",
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
              background: "#D9381E",
              color: "#FFFFFF",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(217, 56, 30, 0.25)",
            }}
          >
            <Receipt size={16} />
            Create Bill / Invoice
          </Link>

          <Link
            to={`${ADMIN_BASE}/transactions`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              background: "#1B3B22",
              color: "#FFFFFF",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Plus size={15} />
            Record Transaction
          </Link>
        </div>
      </div>

      {/* KPI Stats 5-Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Card 1: Gross Revenue */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "20px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Gross Revenue
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EAF2EC", color: "#1B3B22", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#1B3B22", lineHeight: 1.1 }}>
            ₹{grossRevenue.toLocaleString()}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#166534", fontWeight: 700 }}>Real Invoices & Orders</span>
            <span>across all channels</span>
          </div>
        </div>

        {/* Card 2: Net Profit */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "20px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Net Profit
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: netProfit >= 0 ? "#EAF2EC" : "#FEF2F2", color: netProfit >= 0 ? "#166534" : "#DC2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: netProfit >= 0 ? "#166534" : "#DC2626", lineHeight: 1.1 }}>
            ₹{netProfit.toLocaleString()}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#64748B" }}>
            Margin: <strong style={{ color: "#0F172A" }}>{profitMargin}%</strong> (Expenses: ₹{totalExpenses.toLocaleString()})
          </div>
        </div>

        {/* Card 3: Orders & AOV */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "20px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Orders & AOV
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
            {totalOrders}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#64748B" }}>
            Avg Order: <strong style={{ color: "#0F172A" }}>₹{averageOrderValue.toLocaleString()}</strong>
          </div>
        </div>

        {/* Card 4: Companion Birds */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "20px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Companion Birds
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FAF5FF", color: "#7E22CE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Feather size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#1B3B22", lineHeight: 1.1 }}>
            {availableBirds} <span style={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>avail</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#64748B" }}>
            <strong style={{ color: "#D97706" }}>{pendingBookings}</strong> reserved • {totalBirds} total in aviary
          </div>
        </div>

        {/* Card 5: Inventory & Customers */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "20px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Customer Base
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FFF7ED", color: "#C2410C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1.1 }}>
            {totalCustomers}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: lowStockCount > 0 ? "#DC2626" : "#64748B" }}>
            {lowStockCount > 0 ? (
              <span style={{ fontWeight: 700 }}>{lowStockCount} items low in stock!</span>
            ) : (
              <span>Inventory stock healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* 30-Day Revenue & Profit Interactive Area Chart */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: 22,
          marginBottom: 24,
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
          }}
        >
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0 }}>
              30-Day Revenue & Operating Expenses Trend
            </h2>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#64748B" }}>
              Chronological daily income from orders and invoices vs expenses. Hover on points for details.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12.5, fontWeight: 600 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 3, background: "#1B3B22", borderRadius: 2 }} />
              Revenue (₹)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 3, background: "#DC2626", borderRadius: 2 }} />
              Expenses (₹)
            </span>
          </div>
        </div>

        {trendPoints ? (
          <div style={{ width: "100%", overflowX: "auto", position: "relative" }}>
            <svg
              viewBox={`0 0 ${trendPoints.width} ${trendPoints.height}`}
              style={{ width: "100%", height: "auto", display: "block", minWidth: 640 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B3B22" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#1B3B22" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="20" y1="24" x2="780" y2="24" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="20" y1="110" x2="780" y2="110" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="20" y1="196" x2="780" y2="196" stroke="#E2E8F0" />

              {/* Revenue Area Fill */}
              <path d={trendPoints.revArea} fill="url(#revGrad)" />

              {/* Expense Line */}
              <path
                d={trendPoints.expPath}
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeDasharray="4 3"
              />

              {/* Revenue Line */}
              <path
                d={trendPoints.revPath}
                fill="none"
                stroke="#1B3B22"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Circles */}
              {trendPoints.revCoords.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredTrendIdx === idx ? 6 : 3.5}
                    fill="#1B3B22"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    style={{ cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={() => setHoveredTrendIdx(idx)}
                    onMouseLeave={() => setHoveredTrendIdx(null)}
                  />
                  {/* Date labels on bottom for every 5th item */}
                  {idx % 5 === 0 && (
                    <text
                      x={p.x}
                      y={trendPoints.height - 4}
                      fontSize="10"
                      fill="#94A3B8"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredTrendIdx !== null && trendPoints.revCoords[hoveredTrendIdx] && (
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 20,
                  background: "#1E293B",
                  color: "#FFFFFF",
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4, color: "#93C5FD" }}>
                  {trendPoints.revCoords[hoveredTrendIdx].date} ({trendPoints.revCoords[hoveredTrendIdx].label})
                </div>
                <div>Revenue: <strong style={{ color: "#4ADE80" }}>₹{trendPoints.revCoords[hoveredTrendIdx].revenue.toLocaleString()}</strong></div>
                <div>Expenses: <strong style={{ color: "#F87171" }}>₹{trendPoints.revCoords[hoveredTrendIdx].expenses.toLocaleString()}</strong></div>
                <div>Orders/Bills: <strong>{trendPoints.revCoords[hoveredTrendIdx].orders}</strong></div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
            No sales or transactions recorded in the past 30 days yet.
          </div>
        )}
      </div>

      {/* Two Columns: Category Breakdown & Payment Methods & Funnel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Category Breakdown */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 22,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 14px" }}>
            Revenue by Product Category
          </h2>
          {categoryBreakdown.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {categoryBreakdown.map((cat) => {
                const pct = grossRevenue > 0 ? Math.round((cat.revenue / grossRevenue) * 100) : 0;
                return (
                  <div key={cat.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: "#1B3B22" }}>{cat.name}</span>
                      <span style={{ color: "#64748B" }}>
                        ₹{cat.revenue.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(pct, 100)}%`,
                          background: "#1B3B22",
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              No categorized order data available yet.
            </div>
          )}
        </div>

        {/* Payment Methods & Funnel */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 22,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 14px" }}>
            Payment Method Split & Fulfillment Funnel
          </h2>

          {/* Payment Badges */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {paymentMethodBreakdown.map((pm) => (
              <div
                key={pm.method}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <div style={{ fontSize: 11, textTransform: "uppercase", color: "#64748B", fontWeight: 700 }}>
                  {pm.method}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1B3B22", marginTop: 2 }}>
                  ₹{pm.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{pm.count} transactions</div>
              </div>
            ))}
          </div>

          {/* Fulfillment Status Funnel */}
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748B", marginBottom: 10 }}>
              Order Fulfillment Funnel
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#FEF3C7", color: "#92400E" }}>
                Pending: {orderStatusFunnel.pending || 0}
              </span>
              <span style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#DBEAFE", color: "#1E40AF" }}>
                Confirmed: {orderStatusFunnel.confirmed || 0}
              </span>
              <span style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#E0E7FF", color: "#3730A3" }}>
                Shipped: {orderStatusFunnel.shipped || 0}
              </span>
              <span style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
                Delivered: {orderStatusFunnel.delivered || 0}
              </span>
              <span style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#FEE2E2", color: "#991B1B" }}>
                Cancelled: {orderStatusFunnel.cancelled || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts (if any) */}
      {lowStockAlerts.length > 0 && (
        <div
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <AlertTriangle size={18} style={{ color: "#D97706" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#92400E" }}>
              Low Stock Alert ({lowStockAlerts.length} items require reordering)
            </span>
            <Link
              to={`${ADMIN_BASE}/accessories`}
              style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#92400E", textDecoration: "underline" }}
            >
              Manage Inventory →
            </Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {lowStockAlerts.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #FCD34D",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontWeight: 600, color: "#0F172A" }}>{item.name}</span>
                <span style={{ color: "#DC2626", fontWeight: 700 }}>Stock: {item.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Companion Birds Quick Status Manager */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: 22,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Live Aviary Companion Birds
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#64748B" }}>
              Quick status toggles directly sync with public customer storefront.
            </p>
          </div>
          <Link
            to={`${ADMIN_BASE}/birds`}
            style={{ fontSize: 13, fontWeight: 600, color: "#1B3B22", textDecoration: "none" }}
          >
            All Birds ({totalBirds}) →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {birds.map((bird) => {
            const img = resolveBirdImage(bird.id, bird.image);
            return (
              <div
                key={bird._id || bird.id}
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  background: "#FAF8F5",
                }}
              >
                <img
                  src={img}
                  alt={bird.name}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 8,
                    objectFit: "cover",
                    background: "#E2DDD3",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#1B3B22",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {bird.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#D9381E", fontWeight: 700 }}>
                    ₹{bird.price?.toLocaleString()}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    <button
                      onClick={() => handleQuickBirdStatus(bird._id, "available")}
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "1px solid #B8D4BA",
                        background: bird.status === "available" ? "#1B3B22" : "#FFFFFF",
                        color: bird.status === "available" ? "#FFFFFF" : "#1B3B22",
                      }}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleQuickBirdStatus(bird._id, "reserved")}
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "1px solid #FDE68A",
                        background: bird.status === "reserved" ? "#D97706" : "#FFFFFF",
                        color: bird.status === "reserved" ? "#FFFFFF" : "#D97706",
                      }}
                    >
                      Reserved
                    </button>
                    <button
                      onClick={() => handleQuickBirdStatus(bird._id, "sold out")}
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "1px solid #FEE2E2",
                        background: bird.status === "sold out" ? "#DC2626" : "#FFFFFF",
                        color: bird.status === "sold out" ? "#FFFFFF" : "#DC2626",
                      }}
                    >
                      Sold
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Invoices & Store Orders Split */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 20,
        }}
      >
        {/* Recent Invoices */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 22,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Recent Tax Invoices
            </h2>
            <Link
              to={`${ADMIN_BASE}/invoices`}
              style={{ fontSize: 13, fontWeight: 600, color: "#1B3B22", textDecoration: "none" }}
            >
              All Invoices →
            </Link>
          </div>

          {recentInvoices.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentInvoices.map((inv) => (
                <div
                  key={inv.invoiceNumber}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    border: "1px solid #F1F5F9",
                    borderRadius: 8,
                    background: "#FAF8F5",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1B3B22" }}>
                      {inv.invoiceNumber}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B" }}>
                      {inv.customer?.name || "Customer"} • {safeFormatDate(inv.createdAt)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>
                      ₹{inv.grandTotal?.toLocaleString()}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background:
                          inv.paymentStatus === "paid"
                            ? "#D1FAE5"
                            : inv.paymentStatus === "partial"
                            ? "#FEF3C7"
                            : "#FEE2E2",
                        color:
                          inv.paymentStatus === "paid"
                            ? "#065F46"
                            : inv.paymentStatus === "partial"
                            ? "#92400E"
                            : "#991B1B",
                      }}
                    >
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              No invoices generated yet. Click "Create Bill / Invoice" above to issue one.
            </div>
          )}
        </div>

        {/* Recent Web Orders */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: 22,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
              Recent Online Store Orders
            </h2>
            <Link
              to={`${ADMIN_BASE}/orders`}
              style={{ fontSize: 13, fontWeight: 600, color: "#1B3B22", textDecoration: "none" }}
            >
              All Orders ({totalOrders}) →
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    border: "1px solid #F1F5F9",
                    borderRadius: 8,
                    background: "#FAF8F5",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                      Order #{ord.orderId || ord._id.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B" }}>
                      {ord.customer?.name} • ₹{(ord.amount || 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleQuickOrderStatus(ord._id, e.target.value)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid #CBD5E1",
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#FFF",
                        color: "#1B3B22",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              No orders received yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
