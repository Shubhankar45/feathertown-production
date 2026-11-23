import React, { useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  CalendarCheck,
  Users,
  Wallet,
  Feather,
  ShoppingBag,
  Tag,
  Package,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Star,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ADMIN_BASE } from "../../config/adminConfig";
import ToastContainer from "../ui/Toast";
import logoImg from "../../assets/logo-optimized.png";

// Top horizontal pills matching user screenshot
const TOP_PILLS = [
  { to: `${ADMIN_BASE}`, label: "Dashboard", end: true },
  { to: `${ADMIN_BASE}/create-bill`, label: "Create Bill" },
  { to: `${ADMIN_BASE}/bookings`, label: "Booking Tracker" },
  { to: `${ADMIN_BASE}/customers`, label: "Customers" },
  { to: `${ADMIN_BASE}/transactions`, label: "Transactions" },
];

// Comprehensive Sidebar Navigation
const NAV_SECTIONS = [
  {
    title: "Billing & Operations",
    items: [
      { to: `${ADMIN_BASE}`, label: "Dashboard", Icon: LayoutDashboard, end: true },
      { to: `${ADMIN_BASE}/create-bill`, label: "Create Bill", Icon: Receipt },
      { to: `${ADMIN_BASE}/invoices`, label: "Invoices", Icon: FileText },
      { to: `${ADMIN_BASE}/bookings`, label: "Booking Tracker", Icon: CalendarCheck },
      { to: `${ADMIN_BASE}/customers`, label: "Customers", Icon: Users },
      { to: `${ADMIN_BASE}/transactions`, label: "Transactions", Icon: Wallet },
    ],
  },
  {
    title: "Catalog & Sales",
    items: [
      { to: `${ADMIN_BASE}/birds`, label: "Birds & Breeds", Icon: Feather },
      { to: `${ADMIN_BASE}/accessories`, label: "Accessories", Icon: ShoppingBag },
      { to: `${ADMIN_BASE}/categories`, label: "Categories", Icon: Tag },
      { to: `${ADMIN_BASE}/orders`, label: "Store Orders", Icon: Package },
      { to: `${ADMIN_BASE}/reviews`, label: "Reviews", Icon: Star },
      { to: `${ADMIN_BASE}/subscribers`, label: "Subscribers", Icon: Mail },
    ],
  },
  {
    title: "Configuration",
    items: [
      { to: `${ADMIN_BASE}/settings`, label: "Store Settings", Icon: Settings },
    ],
  },
];

class AdminContentBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 Admin section caught UI error:", error, errorInfo);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: 600,
            margin: "40px auto",
            padding: "36px 28px",
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E2DDD3",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#FDECE8",
              color: "#D9381E",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1B3B22", marginBottom: 8 }}>
            Section Rendering Hiccup
          </h2>
          <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 20, lineHeight: 1.5 }}>
            We encountered a temporary display issue in this admin module. All database records remain safe and untouched.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={this.handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 18px",
                background: "#1B3B22",
                color: "#FFFFFF",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
              Retry Module
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "9px 18px",
                background: "#FAF8F5",
                color: "#1B3B22",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid #CBD5E1",
                cursor: "pointer",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(`${ADMIN_BASE}/login`, { replace: true });
  };

  // Find current active title
  let currentLabel = "Admin Console";
  for (const sec of NAV_SECTIONS) {
    for (const item of sec.items) {
      if (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)) {
        currentLabel = item.label;
        break;
      }
    }
  }

  return (
    <div className="ft-admin-shell">
      <ToastContainer />

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="ft-admin-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
          }}
        />
      )}

      {/* Sidebar Navigation - Fixed to viewport */}
      <aside className={`ft-admin-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: "18px 16px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            background: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <img
              src={logoImg}
              alt="FeatherTown"
              style={{
                height: 36,
                width: "auto",
                background: "#FAF8F5",
                borderRadius: 8,
                padding: "2px 6px",
                border: "1px solid #E2DDD3",
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: 19,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "#1B3B22",
                }}
              >
                Feather<span style={{ color: "#D9381E" }}>Town</span>
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: "#1B3B22",
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                Enterprise Suite
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="ft-admin-mobile-close"
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              color: "#64748B",
              fontSize: 14,
              cursor: "pointer",
              width: 30,
              height: 30,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Live Store Quick Shortcut */}
        <div style={{ padding: "12px 14px 4px", flexShrink: 0 }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: 8,
              background: "#FAF8F5",
              border: "1px solid #E2DDD3",
              color: "#1B3B22",
              textDecoration: "none",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1B3B22" }} />
              Live Storefront
            </span>
            <ExternalLink size={13} strokeWidth={2} />
          </a>
        </div>

        {/* Navigation Links (Scrollable) */}
        <nav className="ft-admin-sidebar-nav" style={{ padding: "10px 10px" }}>
          {NAV_SECTIONS.map((sec) => (
            <div key={sec.title} style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 1.1,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  padding: "6px 10px 4px",
                }}
              >
                {sec.title}
              </div>

              {sec.items.map((item) => {
                const ItemIcon = item.Icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: isActive ? 700 : 500,
                      textDecoration: "none",
                      color: isActive ? "#1B3B22" : "#475569",
                      background: isActive ? "#EAF2EC" : "transparent",
                      borderLeft: isActive ? "3px solid #1B3B22" : "3px solid transparent",
                      transition: "all 0.15s ease",
                      marginBottom: 2,
                    })}
                  >
                    {ItemIcon && <ItemIcon size={17} strokeWidth={2.2} />}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer Profile */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid #E2E8F0",
            background: "#FAF8F5",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#1B3B22",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 13.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {admin?.username ? admin.username[0].toUpperCase() : "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0F172A",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {admin?.username || "Admin"}
              </div>
              <div style={{ fontSize: 10.5, color: "#64748B" }}>Authorized Superuser</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 7,
              border: "1px solid #FEE2E2",
              background: "#FEF2F2",
              color: "#DC2626",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
            }}
          >
            <LogOut size={15} strokeWidth={2.2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ft-admin-content-area">
        {/* Top Header Bar */}
        <header className="ft-admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="ft-admin-hamburger"
              style={{
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: 8,
                padding: "8px 10px",
                color: "#0F172A",
                fontSize: 18,
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={20} strokeWidth={2.2} />
            </button>

            <div>
              <div style={{ fontSize: 10.5, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>
                FeatherTown Control
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                {currentLabel}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 99,
                background: "#EAF2EC",
                border: "1px solid #CCE0D0",
                color: "#1B3B22",
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1B3B22" }} />
              Production DB Connected
            </span>
          </div>
        </header>

        {/* Quick Navigation Pills Bar - Matching Reference Screenshot */}
        <div className="ft-admin-top-pills-bar">
          {TOP_PILLS.map((pill) => (
            <NavLink
              key={pill.to}
              to={pill.to}
              end={pill.end}
              className={({ isActive }) => `ft-admin-pill-btn ${isActive ? "active" : ""}`}
            >
              {pill.label}
            </NavLink>
          ))}
          <NavLink
            to={`${ADMIN_BASE}/invoices`}
            className={({ isActive }) => `ft-admin-pill-btn ${isActive ? "active" : ""}`}
          >
            Invoices
          </NavLink>
        </div>

        {/* Route Outlet */}
        <main className="ft-admin-main">
          <AdminContentBoundary key={location.pathname}>
            <Outlet />
          </AdminContentBoundary>
        </main>
      </div>
    </div>
  );
}
