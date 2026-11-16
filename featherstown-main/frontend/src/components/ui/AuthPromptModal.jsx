import { useNavigate, useLocation } from "react-router-dom";
import { Lock, UserPlus, LogIn, ArrowRight, X, ShieldCheck } from "lucide-react";
import logoImg from "../../assets/logo-optimized.png";

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign In Required",
  description = "Please log in or create an account to access this feature, complete your purchase, and track your orders.",
  redirectPath,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const returnTarget = redirectPath || location.pathname + location.search;

  const handleGoLogin = () => {
    onClose?.();
    navigate("/login", { state: { from: { pathname: returnTarget } } });
  };

  const handleGoRegister = () => {
    onClose?.();
    navigate("/register", { state: { from: { pathname: returnTarget } } });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          maxWidth: 460,
          width: "100%",
          padding: "36px 30px",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(27, 59, 34, 0.25)",
          border: "1px solid #E2DDD3",
          position: "relative",
          animation: "fadeIn .25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "#F1F5F9",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748B",
            cursor: "pointer",
          }}
        >
          <X size={16} />
        </button>

        {/* Icon & Brand */}
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "#EAF2EC", color: "#1B3B22", marginBottom: 16 }}>
          <Lock size={28} />
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, background: "#FAF8F5", border: "1px solid #E2DDD3", fontSize: 11.5, fontWeight: 700, color: "#1B3B22", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
          <ShieldCheck size={14} color="#166534" />
          Customer Access Guard
        </div>

        <h3
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#1B3B22",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: 13.5,
            color: "#64748B",
            lineHeight: 1.5,
            margin: "0 0 24px",
          }}
        >
          {description}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleGoLogin}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: 12,
              background: "#1B3B22",
              color: "#FFFFFF",
              border: "none",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(27, 59, 34, 0.2)",
            }}
          >
            <LogIn size={16} />
            Sign In with Existing Account
          </button>

          <button
            onClick={handleGoRegister}
            style={{
              width: "100%",
              padding: "12px 18px",
              borderRadius: 12,
              background: "#FAF8F5",
              color: "#1B3B22",
              border: "1.5px solid #1B3B22",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <UserPlus size={16} />
            Create a New Account
          </button>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748B",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              padding: "8px 0 0",
              textDecoration: "underline",
            }}
          >
            Continue Exploring as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
