import { useLocation, Link } from "react-router-dom";
import { Lock, ArrowRight, UserPlus, LogIn, ShoppingBag, Feather, ShieldCheck } from "lucide-react";
import { useUserAuth } from "../context/UserAuthContext";

export default function ProtectedUserRoute({ children, requiredAction = "access this page" }) {
  const { user, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF8F5" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid #E2DDD3", borderTopColor: "#1B3B22", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1B3B22" }}>Verifying Customer Session...</div>
        </div>
      </div>
    );
  }

  // If user is logged in and verified, render protected children
  if (user && user.emailVerified) {
    return children;
  }

  // Guest Interstitial Screen
  return (
    <div style={{ minHeight: "70vh", background: "#FAF8F5", padding: "60px 16px 100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 500,
          width: "100%",
          background: "#FFFFFF",
          borderRadius: 24,
          border: "1px solid #E2DDD3",
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 12px 36px rgba(27, 59, 34, 0.06)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#EAF2EC",
            color: "#1B3B22",
            marginBottom: 16,
          }}
        >
          <Lock size={30} />
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "#FAF8F5", border: "1px solid #E2DDD3", fontSize: 11.5, fontWeight: 700, color: "#1B3B22", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>
          <ShieldCheck size={14} color="#166534" />
          Guest Mode · Member Area
        </div>

        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#1B3B22",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}
        >
          Sign In to Access This Page
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#64748B",
            lineHeight: 1.6,
            margin: "0 0 28px",
          }}
        >
          You are currently browsing as a guest. To {requiredAction}, track companion bird reservations, and view historical invoices, please sign in or register.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            to="/login"
            state={{ from: location }}
            style={{
              padding: "13px 20px",
              borderRadius: 12,
              background: "#1B3B22",
              color: "#FFFFFF",
              fontSize: 14.5,
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(27, 59, 34, 0.2)",
            }}
          >
            <LogIn size={16} />
            Sign In with Existing Account
          </Link>

          <Link
            to="/register"
            state={{ from: location }}
            style={{
              padding: "13px 20px",
              borderRadius: 12,
              background: "#FAF8F5",
              color: "#1B3B22",
              border: "1.5px solid #1B3B22",
              fontSize: 14.5,
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <UserPlus size={16} />
            Create Free Customer Account
          </Link>

          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 18, marginTop: 6 }}>
            <Link
              to="/accessories"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#64748B",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShoppingBag size={14} /> Continue Exploring Aviary Shop as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
