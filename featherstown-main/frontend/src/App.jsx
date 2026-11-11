import { Routes, Route, useLocation } from "react-router-dom";
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
                  {/* ── Admin console — no navbar/footer, separate auth flow ── */}
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
                    <Route path="birds" element={<AdminBirds />} />
                    <Route path="accessories" element={<AdminAccessories />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="subscribers" element={<AdminSubscribers />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* ── Public site ── */}
                  <Route
                    path="/*"
                    element={
                      <SiteLayout>
                        <Routes>
                          <Route path="/" element={<Home />} />
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
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/order-success" element={<OrderSuccess />} />
                          <Route path="/my-orders" element={<MyOrders />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Login />} />
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
