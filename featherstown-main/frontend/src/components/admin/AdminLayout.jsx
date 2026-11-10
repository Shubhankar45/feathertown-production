import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ADMIN_BASE } from "../../config/adminConfig";
import ToastContainer from "../ui/Toast";
import logoImg from "../../assets/logo-optimized.png";

const NAV = [
  { to: `${ADMIN_BASE}`, label: "Overview", icon: "📊", end: true },
  { to: `${ADMIN_BASE}/birds`, label: "Birds & Breeds", icon: "🦜" },
  { to: `${ADMIN_BASE}/accessories`, label: "Accessories", icon: "🛍️" },
  { to: `${ADMIN_BASE}/categories`, label: "Categories", icon: "🏷️" },
  { to: `${ADMIN_BASE}/orders`, label: "Orders", icon: "📦" },
  { to: `${ADMIN_BASE}/reviews`, label: "Reviews", icon: "⭐" },
  { to: `${ADMIN_BASE}/subscribers`, label: "Subscribers", icon: "📬" },
  { to: `${ADMIN_BASE}/settings`, label: "Store Settings", icon: "⚙️" },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(`${ADMIN_BASE}/login`, { replace: true });
  };

  const currentNav = NAV.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

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

      {/* Sidebar Navigation - TRULY FIXED to viewport */}
      <aside className={`ft-admin-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div
          style={{
            padding: "20px 18px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            background: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={logoImg}
              alt="FeatherTown"
              style={{
                height: 38,
                width: "auto",
                background: "#F8FAFC",
                borderRadius: 10,
                padding: "3px 6px",
                border: "1px solid #E2E8F0",
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "#1B3B22",
                }}
              >
                Feather<span style={{ color: "#D9381E" }}>Town</span>
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "#1B3B22",
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                Admin Suite
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
            ✕
          </button>
        </div>

        {/* Live Store Quick Shortcut */}
        <div style={{ padding: "14px 16px 6px", flexShrink: 0 }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 10,
              background: "#E7EFE8",
              border: "1px solid #B8D4BA",
              color: "#1B3B22",
              textDecoration: "none",
              fontSize: 12.5,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1B3B22" }} />
              Live Storefront
            </span>
            <span style={{ fontSize: 13 }}>↗</span>
          </a>
        </div>

        {/* Navigation Links (Scrollable if viewport height is compact) */}
        <nav className="ft-admin-sidebar-nav">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: "#94A3B8",
              textTransform: "uppercase",
              padding: "8px 12px 6px",
            }}
          >
            Management
          </div>

          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                color: isActive ? "#1B3B22" : "#475569",
                background: isActive ? "#E7EFE8" : "transparent",
                borderLeft: isActive ? "3px solid #1B3B22" : "3px solid transparent",
                transition: "all 0.15s ease",
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer Profile */}
        <div
          style={{
            padding: "16px",
            borderTop: "1px solid #E2E8F0",
            background: "#F8FAFC",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#1B3B22",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {admin?.username ? admin.username[0].toUpperCase() : "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {admin?.username || "Admin"}
              </div>
              <div style={{ fontSize: 11, color: "#64748B" }}>Authorized Superuser</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid #FEE2E2",
              background: "#FEF2F2",
              color: "#DC2626",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
            }}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Shifted on desktop to prevent any overlap */}
      <div className="ft-admin-content-area">
        {/* Top Header Bar */}
        <header className="ft-admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
              ☰
            </button>

            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>
                FeatherTown Control
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                {currentNav ? currentNav.label : "Admin"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 99,
                background: "#E7EFE8",
                border: "1px solid #B8D4BA",
                color: "#1B3B22",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1B3B22" }} />
              Live Online
            </span>
          </div>
        </header>

        {/* Route Outlet */}
        <main className="ft-admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
