import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  MessageCircle,
  Compass,
  ArrowRight,
  Menu,
  X,
  Truck,
  ShieldCheck,
  Scale,
  User,
  Tag,
  Feather,
  Heart,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUserAuth } from "../context/UserAuthContext";
import { useSettings } from "../context/SettingsContext";
import UserMenu from "./UserMenu";
import Avatar from "./ui/Avatar";
import { trackWhatsAppClick } from "../utils/analytics";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Shop All", path: "/accessories" },
  { label: "Companion Birds", path: "/birds" },
  { label: "Food & Nutrition", path: "/accessories?category=food" },
  { label: "Cages & Aviaries", path: "/accessories?category=cages" },
  { label: "Toys & Play", path: "/accessories?category=toys" },
  { label: "Compare Breeds", path: "/compare" },
  { label: "Bird Quiz", path: "/quiz", badge: "Quiz", highlight: true },
  { label: "Deals", path: "/accessories?badge=Sale" },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const { user } = useUserAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartBouncing, setCartBouncing] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setCartBouncing(true);
      const timer = setTimeout(() => setCartBouncing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/accessories?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const handleWhatsApp = () => {
    trackWhatsAppClick("navbar_header");
    const wa = settings?.whatsapp || "919556747518";
    window.open(`https://wa.me/${wa}?text=Hi%20FeatherTown,%20I'd%20like%20to%20know%20more%20about%20your%20parrots%20and%20accessories!`, "_blank");
  };

  return (
          <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid #E2DDD3",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
          transition: "box-shadow 0.3s ease",
          fontFamily: "Outfit, system-ui, sans-serif",
        }}
      >
        {/* Top Announcement Bar (Configurable from Admin Settings) */}
        {settings?.announcementActive !== false && (
          <div className="ft-announcement-bar">
            <div className="ft-announcement-desktop">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Truck size={13} strokeWidth={2.2} />
                <span>{settings?.announcementText ? settings.announcementText.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim() : `Free Shipping on Orders Over ₹${settings?.freeShippingThreshold || 999}`}</span>
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Feather size={13} strokeWidth={2.2} />
                <span>100% Healthy Companion Birds</span>
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Tag size={13} strokeWidth={2.2} />
                <span>10% Off Your First Order | Use Code: <strong style={{ color: "#FAF8F5", letterSpacing: "0.5px" }}>FEATHER10</strong></span>
              </span>
            </div>
            <div className="ft-announcement-mobile">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Truck size={12} strokeWidth={2.2} />
                <span>Free Shipping ₹{settings?.freeShippingThreshold || 999}+</span>
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Tag size={12} strokeWidth={2.2} />
                <span>Code: FEATHER10</span>
              </span>
            </div>
          </div>
        )}

        {/* Main Header Row */}
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
            padding: "8px clamp(12px, 3.5vw, 64px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "clamp(6px, 1.8vw, 24px)",
          }}
        >
          {/* Left: Mobile hamburger & Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 12px)", minWidth: 0, flexShrink: 0 }}>
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (!mobileMenuOpen) setMobileSearchOpen(false);
              }}
              className="ft-hamburger-btn"
              aria-label="Toggle Navigation Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                textDecoration: "none",
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: "clamp(21px, 2.8vw, 26px)",
                  fontWeight: 900,
                  color: "#1B3B22",
                  letterSpacing: "-0.025em",
                }}
              >
                Feather
              </span>
              <span
                style={{
                  fontFamily: "Outfit, system-ui, sans-serif",
                  fontSize: "clamp(21px, 2.8vw, 26px)",
                  fontWeight: 900,
                  color: "#D9381E",
                  letterSpacing: "-0.025em",
                }}
              >
                Town
              </span>
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#D9381E",
                  marginLeft: 3,
                }}
              />
            </Link>
          </div>

          {/* Center: Search Bar (Desktop Only via CSS class) */}
          <form
            onSubmit={handleSearchSubmit}
            className="ft-desktop-search"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companion birds, cages, food..."
              style={{
                width: "100%",
                background: "#FAF8F5",
                border: "1.5px solid #E2DDD3",
                borderRadius: 999,
                padding: "9px 46px 9px 18px",
                fontSize: 13.5,
                color: "#152B17",
                outline: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1B3B22")}
              onBlur={(e) => (e.target.style.borderColor = "#E2DDD3")}
            />
            <button
              type="submit"
              className="t-btn-press"
              style={{
                position: "absolute",
                right: 3,
                top: 3,
                bottom: 3,
                width: 34,
                height: 34,
                background: "#D9381E",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              aria-label="Search"
            >
              <Search size={16} strokeWidth={2.2} />
            </button>
          </form>

          {/* Right Action Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.6vw, 16px)", flexShrink: 0 }}>
            {/* Mobile Search Toggle Button (Mobile/Tablet Only via CSS) */}
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (!mobileSearchOpen) setMobileMenuOpen(false);
              }}
              className="ft-mobile-search-btn"
              aria-label="Toggle Search Bar"
            >
              {mobileSearchOpen ? (
                <X size={18} strokeWidth={2.2} />
              ) : (
                <Search size={18} strokeWidth={2.2} />
              )}
            </button>

            {/* Account / User Menu (Desktop & Tablet) */}
            <div className="ft-header-account">
              <UserMenu />
            </div>

            {/* Bird Quiz Match Button (Desktop & Tablet) */}
            <Link
              to="/#quiz"
              className="ft-header-quiz t-btn-press"
              style={{
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
                color: "#1B3B22",
                fontSize: 11,
                fontWeight: 700,
                position: "relative",
              }}
              aria-label="Find Your Bird Quiz"
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#E7EFE8",
                  border: "1.5px solid #B8D4BA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B3B22",
                  marginBottom: 1,
                  boxShadow: "0 1px 3px rgba(27, 59, 34, 0.1)",
                }}
              >
                <Compass size={18} strokeWidth={2.2} />
              </div>
              <span className="ft-icon-label" style={{ color: "#1B3B22" }}>Bird Quiz</span>
            </Link>

            {/* Compare Link with Icon (Desktop & Tablet) */}
            <Link
              to="/compare"
              className="ft-header-compare t-btn-press"
              style={{
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
                color: "#1B3B22",
                fontSize: 11,
                fontWeight: 700,
                position: "relative",
              }}
              aria-label="Compare Breeds"
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#FAF8F5",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B3B22",
                  marginBottom: 1,
                }}
              >
                <Scale size={18} strokeWidth={2.2} />
              </div>
              <span className="ft-icon-label" style={{ color: "#1B3B22" }}>Compare</span>
            </Link>

            {/* Cart with Live Count Badge */}
            <Link
              to="/cart"
              className="t-btn-press"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textDecoration: "none",
                color: "#1B3B22",
                fontSize: 11,
                fontWeight: 700,
                position: "relative",
              }}
              aria-label="View Shopping Cart"
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#FAF8F5",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1B3B22",
                  position: "relative",
                  marginBottom: 1,
                }}
              >
                <ShoppingCart size={19} strokeWidth={2.2} />
                {cartCount > 0 && (
                  <span
                    className={cartBouncing ? "ft-cart-bounce" : ""}
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 999,
                      background: "#D9381E",
                      color: "#FFFFFF",
                      fontSize: 10.5,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      boxShadow: "0 2px 6px rgba(217, 56, 30, 0.4)",
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="ft-icon-label" style={{ color: "#1B3B22" }}>Cart</span>
            </Link>

            {/* WhatsApp Quick Chat */}
            <button
              onClick={handleWhatsApp}
              style={{
                background: "#1B3B22",
                color: "#FFFFFF",
                border: "none",
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(27, 59, 34, 0.2)",
              }}
              className="ft-desktop-wa t-btn-press"
            >
              <MessageCircle size={15} strokeWidth={2.2} />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Row (Dropdown when toggled on mobile) */}
        {mobileSearchOpen && (
          <div className="ft-mobile-search-bar" style={{ background: "#FAF8F5", borderTop: "1px solid #E2DDD3" }}>
            <form onSubmit={handleSearchSubmit} style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, cages, companion birds..."
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1.5px solid #E2DDD3",
                  borderRadius: 999,
                  padding: "10px 44px 10px 18px",
                  fontSize: 14,
                  color: "#152B17",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  position: "absolute",
                  right: 4,
                  top: 4,
                  bottom: 4,
                  width: 34,
                  height: 34,
                  background: "#D9381E",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Search size={15} strokeWidth={2.2} />
              </button>
            </form>
          </div>
        )}

        {/* Category Navigation Bar (Clean Sub-Row, Desktop Only) */}
        <nav
          aria-label="Site Navigation"
          style={{
            background: "#FAF8F5",
            borderTop: "1px solid #E2DDD3",
            borderBottom: "1px solid #E2DDD3",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
          className="ft-desktop-nav"
        >
          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              margin: "0 auto",
              padding: "0 clamp(16px, 4vw, 64px)",
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path || (link.path.startsWith("/#") && location.hash === link.path.substring(1));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    padding: "10px 0",
                    fontSize: 13,
                    fontWeight: isActive ? 800 : link.highlight ? 800 : 600,
                    color: isActive ? "#1B3B22" : link.highlight ? "#D9381E" : "#736B5E",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    borderBottom: isActive ? "2px solid #1B3B22" : "2px solid transparent",
                    transition: "color 0.2s, border-color 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.target.style.color = "#1B3B22";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.target.style.color = link.highlight ? "#D9381E" : "#736B5E";
                  }}
                >
                  {link.label}
                  {link.badge && (
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        background: "#D9381E",
                        color: "#FFFFFF",
                        padding: "2px 7px",
                        borderRadius: 999,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              background: "#FAF8F5",
              borderTop: "1px solid #E2DDD3",
              padding: "16px 20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              animation: "slideDown 0.25s ease",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              boxShadow: "0 20px 30px rgba(0,0,0,0.08)",
            }}
            className="lg:hidden"
          >
            {/* Mobile Account / Sign In Card */}
            {!user ? (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "12px 14px",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#E7EFE8",
                      color: "#1B3B22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <User size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#152B17" }}>Hello, Bird Lover!</div>
                    <div style={{ fontSize: 11, color: "#736B5E" }}>Track orders &amp; care history</div>
                  </div>
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: "#D9381E",
                    color: "#FFFFFF",
                    padding: "7px 15px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Sign In →
                </Link>
              </div>
            ) : (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "12px 14px",
                  border: "1px solid #E2DDD3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <Avatar name={user.name} avatar={user.avatar} size={38} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#152B17", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#736B5E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </div>
                  </div>
                </div>
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: "#E7EFE8",
                    border: "1px solid #B8D4BA",
                    color: "#1B3B22",
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  My Orders
                </Link>
              </div>
            )}

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} style={{ position: "relative", marginBottom: 8 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companion birds, cages, food..."
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1.5px solid #E2DDD3",
                  color: "#152B17",
                  borderRadius: 999,
                  padding: "10px 42px 10px 16px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{
                  position: "absolute",
                  right: 4,
                  top: 4,
                  bottom: 4,
                  width: 32,
                  height: 32,
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={14} strokeWidth={2.2} />
              </button>
            </form>

            {/* Mobile Bird Quiz Quick Banner */}
            <Link
              to="/#quiz"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2DDD3",
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                textDecoration: "none",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#E7EFE8",
                    color: "#1B3B22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Compass size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#152B17" }}>Which Bird Fits You?</div>
                  <div style={{ fontSize: 11, color: "#736B5E" }}>Take our 60-sec lifestyle quiz</div>
                </div>
              </div>
              <span
                style={{
                  background: "#D9381E",
                  color: "#FFFFFF",
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                Start Quiz →
              </span>
            </Link>

            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#1B3B22" : "#152B17",
                    background: isActive ? "#E7EFE8" : "transparent",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        background: "#D9381E",
                        color: "#FFFFFF",
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <button
              onClick={handleWhatsApp}
              style={{
                marginTop: 8,
                background: "#1B3B22",
                color: "#FFFFFF",
                border: "none",
                padding: "12px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <MessageCircle size={16} strokeWidth={2.2} />
              <span>Chat on WhatsApp ({settings?.phone || "+91 9556747518"})</span>
            </button>
          </div>
        )}
      </header>
  );
}
