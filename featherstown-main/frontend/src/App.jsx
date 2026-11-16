import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Birds from "./pages/Birds";
import Compare from "./pages/Compare";
import ReviewsPage from "./pages/ReviewsPage";
import Contact from "./pages/Contact";
import Breeds from "./pages/Breeds";
import BreedDetails from "./pages/BreedDetails";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageChrome from "./components/PageChrome";
import CookieConsent from "./components/CookieConsent";
import StickyMobileCTA from "./components/StickyMobileCTA";
import ErrorBoundary from "./components/ErrorBoundary";

import Accessories from "./pages/Accessories";
import AccessoryDetails from "./pages/AccessoryDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import { CartProvider } from "./context/CartContext";
import { UserAuthProvider } from "./context/UserAuthContext";

import { AdminAuthProvider } from "./context/AdminAuthContext";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccessories from "./pages/admin/AdminAccessories";
import AdminBirds from "./pages/admin/AdminBirds";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCreateBill from "./pages/admin/AdminCreateBill";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminBookingTracker from "./pages/admin/AdminBookingTracker";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import { BirdsProvider } from "./context/BirdsContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ADMIN_BASE } from "./config/adminConfig";
import { trackPageView } from "./utils/analytics";

import { scanElements } from "./hooks/useScrollReveal";

/* Scrolls to top on route change, tracks analytics pageviews,
   triggers animation scans, and handles hash links smoothly */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    trackPageView(pathname);
    if (hash) {
      const scroll = () => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          setTimeout(() => scanElements(document.body), 100);
          return true;
        }
        return false;
      };
      if (!scroll()) {
        const timer = setTimeout(scroll, 180);
        return () => clearTimeout(timer);
      }
      return;
    }
    window.scrollTo({ top: 0 });
    setTimeout(() => scanElements(document.body), 60);
  }, [pathname, hash]);

  return null;
}

/* Gateway for root '/' — by default when opening the website, show Login unless authenticated or guest mode chosen */
function RootGateway() {
  const { user, loading, guestModeActivated } = useUserAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #E2DDD3", borderTopColor: "#1B3B22", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1B3B22", fontFamily: "Outfit, system-ui, sans-serif" }}>Opening FeatherTown...</div>
        </div>
      </div>
    );
  }

  // If already authenticated or if visitor activated guest mode during this session
  if ((user && user.emailVerified) || guestModeActivated) {
    return <Home />;
  }

  // Default to standalone Login page on first opening the website
  return <Navigate to="/login" replace />;
}

/* Public site — normal chrome (navbar/footer/cookies/sticky mobile CTA). */
function SiteLayout({ children }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#FAF8F5", margin: 0, padding: 0 }}>
      <PageChrome />
      <ScrollManager />
      <Navbar />
      <main style={{ flex: "1 0 auto", background: "#FAF8F5", display: "flex", flexDirection: "column", margin: 0, padding: 0 }}>{children}</main>
      <Footer />
      <CookieConsent />
      <StickyMobileCTA />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <SettingsProvider>
          <BirdsProvider>
            <UserAuthProvider>
              <CartProvider>
                <Routes>
                  {/* ── Admin console — separate auth flow ── */}
                  <Route path="/admin" element={<Navigate to={`${ADMIN_BASE}/login`} replace />} />
                  <Route path="/admin/login" element={<Navigate to={`${ADMIN_BASE}/login`} replace />} />
                  <Route path={`${ADMIN_BASE}/login`} element={<AdminLogin />} />
                  <Route
                    path={ADMIN_BASE}
                    element={
                      <ProtectedAdminRoute>
                        <AdminLayout />
                      </ProtectedAdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="create-bill" element={<AdminCreateBill />} />
                    <Route path="invoices" element={<AdminInvoices />} />
                    <Route path="bookings" element={<AdminBookingTracker />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="transactions" element={<AdminTransactions />} />
                    <Route path="birds" element={<AdminBirds />} />
                    <Route path="accessories" element={<AdminAccessories />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="subscribers" element={<AdminSubscribers />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* ── Standalone Customer Auth routes (NO Navbar, NO Footer, NO PageChrome) ── */}
                  <Route path="/login" element={<Login defaultTab="login" />} />
                  <Route path="/register" element={<Login defaultTab="register" />} />

                  {/* ── Public site with standard chrome ── */}
                  <Route
                    path="/*"
                    element={
                      <SiteLayout>
                        <Routes>
                          <Route path="/" element={<RootGateway />} />
                          <Route path="/home" element={<Home />} />
                          <Route path="/quiz" element={<Home />} />
                          <Route path="/find-your-bird" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/birds" element={<Birds />} />
                          <Route path="/compare" element={<Compare />} />
                          <Route path="/reviews" element={<ReviewsPage />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/breeds" element={<Breeds />} />
                          <Route path="/breed/:id" element={<BreedDetails />} />
                          <Route path="/accessories" element={<Accessories />} />
                          <Route path="/accessories/:idOrSlug" element={<AccessoryDetails />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route
                            path="/checkout"
                            element={
                              <ProtectedUserRoute requiredAction="complete checkout and track your delivery">
                                <Checkout />
                              </ProtectedUserRoute>
                            }
                          />
                          <Route path="/order-success" element={<OrderSuccess />} />
                          <Route
                            path="/my-orders"
                            element={
                              <ProtectedUserRoute requiredAction="view your companion bird bookings and orders">
                                <MyOrders />
                              </ProtectedUserRoute>
                            }
                          />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsConditions />} />
                          <Route path="/terms-conditions" element={<TermsConditions />} />
                          <Route path="/terms-and-conditions" element={<TermsConditions />} />
                          {/* Custom 404 Catch-All */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </SiteLayout>
                    }
                  />
                </Routes>
              </CartProvider>
            </UserAuthProvider>
          </BirdsProvider>
        </SettingsProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
