import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ADMIN_BASE } from "../../config/adminConfig";
import logoImg from "../../assets/logo-optimized.png";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || ADMIN_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid administrator credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at top, #ECFDF5 0%, #F8FAFC 55%, #F1F5F9 100%)",
        padding: 20,
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src={logoImg}
            alt="FeatherTown"
            style={{
              height: 54,
              width: "auto",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: "4px 10px",
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          />
          <h1 style={{ color: "#0F172A", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
            FeatherTown Admin
          </h1>
          <p style={{ color: "#64748B", fontSize: 13 }}>
            Authorized administrator sign in
          </p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Admin Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            placeholder="e.g. bineet"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              fontSize: 13,
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "13px 0",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #10B981, #059669)",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14.5,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
            transition: "transform 0.15s ease",
          }}
        >
          {loading ? "Authenticating…" : "Sign In to Admin Console"}
        </button>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a
            href="/"
            style={{
              fontSize: 12.5,
              color: "#64748B",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
          >
            ← Return to public storefront
          </a>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  color: "#0F172A",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};
