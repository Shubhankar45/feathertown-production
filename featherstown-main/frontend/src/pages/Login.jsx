import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useUserAuth } from "../context/UserAuthContext";
import { toast } from "../components/ui/Toast";
import logoImg from "../assets/logo-optimized.png";
import { isValidEmail } from "../utils/validation";
import AvatarPicker from "../components/ui/AvatarPicker";

const EMPTY = { name: "", email: "", password: "" };

export default function Login() {
  const { user, loading, googleAuthEnabled, loginWithPassword, register } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(EMPTY);
  const [selectedAvatar, setSelectedAvatar] = useState("/avatars/scarlet-macaw.svg");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  const from = location.state?.from?.pathname || "/my-orders";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [loading, user, from, navigate]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) {
      toast.warn("Please enter a valid email address.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      toast.warn("Password must be at least 6 characters.");
      return;
    }
    if (mode === "register" && (!form.name.trim() || form.name.trim().length < 2)) {
      toast.warn("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithPassword(form.email.trim(), form.password);
        toast.success("Welcome back! 🦜");
      } else {
        await register(form.name.trim(), form.email.trim(), form.password, selectedAvatar);
        toast.success("Account created! Welcome to FeatherTown 🌿");
      }
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next) => {
    setForm(EMPTY);
    navigate(next === "login" ? "/login" : "/register", { state: location.state, replace: true });
  };

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title={mode === "login" ? "Sign In | FeatherTown" : "Create Account | FeatherTown"}
        description="Sign in or register for your FeatherTown account to manage bird orders, accessory tracking, and consultations."
      />

      <PageBanner
        eyebrow="Customer Portal"
        title={mode === "login" ? "Welcome" : "Create an"}
        accent={mode === "login" ? "Back" : "Account"}
        desc="Access your past order receipts, tracking statuses, and customer support."
      />

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "0 clamp(16px, 3.5vw, 24px) 100px" }}>
        <div
          className="rv-scale ft-card-lift"
          style={{
            background: "#FFFFFF",
            borderRadius: 28,
            padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 32px)",
            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            border: "1px solid #E2E8F0",
            textAlign: "center",
          }}
        >
          {/* Brand Logo */}
          <div style={{ marginBottom: 20 }}>
            <img
              src={logoImg}
              alt="FeatherTown"
              style={{ height: 48, width: "auto", margin: "0 auto", display: "block" }}
            />
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              borderRadius: 14,
              padding: 4,
              marginBottom: 24,
              border: "1px solid #E2E8F0",
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                type="button"
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: mode === m ? "1px solid #CBD5E1" : "none",
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 700,
                  textTransform: "capitalize",
                  background: mode === m ? "#FFFFFF" : "transparent",
                  color: mode === m ? "#059669" : "#64748B",
                  boxShadow: mode === m ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form key={mode} className="ft-tab-content" onSubmit={handleSubmit} style={{ textAlign: "left" }}>
            {mode === "register" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="e.g. Priya Sharma"
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <AvatarPicker
                    compact
                    selected={selectedAvatar}
                    onSelect={setSelectedAvatar}
                    title="Pick Your Companion Bird Avatar"
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="priya@example.com"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password (min 6 characters)</label>
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="ft-btn-hover"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                border: "none",
                padding: "13px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 14.5,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
              }}
            >
              {submitting ? "Processing…" : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          {googleAuthEnabled && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                <span style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase" }}>Or</span>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>
              <GoogleSignInButton />
            </div>
          )}

          <div style={{ marginTop: 24, fontSize: 13, color: "#64748B" }}>
            {mode === "login" ? (
              <>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  style={{ background: "none", border: "none", color: "#059669", fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  style={{ background: "none", border: "none", color: "#059669", fontWeight: 700, cursor: "pointer", padding: 0 }}
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1.5px solid #CBD5E1",
  fontSize: 14,
  outline: "none",
  background: "#F8FAFC",
  color: "#0F172A",
  boxSizing: "border-box",
};
