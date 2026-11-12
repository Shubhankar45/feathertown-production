/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Customer Portal Authentication & Security
   /pages/Login.jsx

   Upgraded authentication system:
   - Rate limiting on Sign In with temporary account/IP lockout detection
   - Google & Apple OAuth 1-click buttons
   - Dual-token JWT authentication with token rotation & refresh
   - Real email verification via 6-digit OTP with 10-minute expiry
   - Resend cooldown (60s) & attempt counters (max 5 attempts)
   - Password security validator & disposable email filter
   - Strict 60-30-10 palette (Oat Milk, Forest Green, Tomato Red)
   - 100% Lucide React line icons (zero emojis)
═══════════════════════════════════════════════════════════════ */
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AppleSignInButton from "../components/AppleSignInButton";
import { useUserAuth } from "../context/UserAuthContext";
import { toast } from "../components/ui/Toast";
import AvatarPicker from "../components/ui/AvatarPicker";

const EMPTY = { name: "", email: "", password: "" };

export default function Login() {
  const {
    user,
    loading,
    googleAuthEnabled,
    appleAuthEnabled,
    verificationPending,
    setVerificationPending,
    loginWithPassword,
    register,
    verifyEmail,
    resendOtp,
  } = useUserAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = location.pathname === "/register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'verify'
  const [form, setForm] = useState(EMPTY);
  const [selectedAvatar, setSelectedAvatar] = useState("/avatars/scarlet-macaw.svg");
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const otpInputRefs = useRef([]);

  // Lockout & Brute-force state
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  useEffect(() => {
    if (mode !== "verify") {
      setMode(location.pathname === "/register" ? "register" : "login");
    }
  }, [location.pathname, mode]);

  const from = location.state?.from?.pathname || "/my-orders";

  // Redirect if logged in and verified
  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      navigate(from, { replace: true });
    } else if (!loading && user && !user.emailVerified) {
      setVerifyEmailAddress(user.email);
      setMode("verify");
    }
  }, [loading, user, from, navigate]);

  // Handle verificationPending from context
  useEffect(() => {
    if (verificationPending?.email) {
      setVerifyEmailAddress(verificationPending.email);
      setMode("verify");
    }
  }, [verificationPending]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setResendCooldown((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Password rules validation
  const passLengthOk = form.password.length >= 8;
  const passComplexOk = /[\d!@#$%^&*(),.?":{}|<>]/.test(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (lockoutTimer > 0) {
      toast.error(`Account temporarily locked for security. Please wait ${lockoutTimer} seconds.`);
      return;
    }

    if (mode === "login") {
      if (!form.email.trim() || !form.password) {
        toast.warn("Please enter both email and password.");
        return;
      }

      setSubmitting(true);
      try {
        const loggedUser = await loginWithPassword(form.email.trim(), form.password);
        setRemainingAttempts(null);
        if (loggedUser && !loggedUser.emailVerified) {
          setVerifyEmailAddress(loggedUser.email);
          setMode("verify");
          setResendCooldown(60);
          setCanResend(false);
          toast.info("Please verify your email address to continue.");
        } else {
          toast.success("Welcome back to FeatherTown!");
          navigate(from, { replace: true });
        }
      } catch (err) {
        if (err.status === 429) {
          const retrySec = err.data?.retryAfterSeconds || 900;
          setLockoutTimer(retrySec);
          toast.error(err.message || "Too many failed attempts. Temporary account lockout applied.");
        } else {
          toast.error(err.message || "Invalid credentials.");
        }
      } finally {
        setSubmitting(false);
      }
    } else if (mode === "register") {
      if (!form.name.trim() || form.name.trim().length < 2) {
        toast.warn("Please enter your name (minimum 2 characters).");
        return;
      }
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        toast.warn("Please enter a valid email address.");
        return;
      }
      if (!passLengthOk || !passComplexOk) {
        toast.warn("Password must be at least 8 characters and include numbers or symbols.");
        return;
      }

      setSubmitting(true);
      try {
        const regRes = await register(
          form.name.trim(),
          form.email.trim(),
          form.password,
          selectedAvatar
        );
        toast.success("Account created! A 6-digit verification code was sent to your email.");
        setVerifyEmailAddress(form.email.trim());
        setMode("verify");
        setResendCooldown(60);
        setCanResend(false);
      } catch (err) {
        toast.error(err.message || "Registration failed. Please check your details.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const copy = [...otpDigits];
      copy[index] = "";
      setOtpDigits(copy);
      return;
    }

    if (clean.length > 1) {
      // Pasted full OTP code
      const pasted = clean.slice(0, 6).split("");
      const copy = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) copy[i] = char;
      });
      setOtpDigits(copy);
      const nextIdx = Math.min(5, pasted.length - 1);
      otpInputRefs.current[nextIdx]?.focus();
      if (copy.every((d) => d !== "")) {
        handleVerifyOtp(copy.join(""));
      }
      return;
    }

    const copy = [...otpDigits];
    copy[index] = clean.slice(-1);
    setOtpDigits(copy);

    if (index < 5 && clean) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (copy.every((d) => d !== "")) {
      handleVerifyOtp(copy.join(""));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (codeOverride) => {
    const code = codeOverride || otpDigits.join("");
    if (code.length !== 6) {
      toast.warn("Please enter all 6 digits of your verification code.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyEmail(verifyEmailAddress, code);
      toast.success("Email verified successfully! Welcome to FeatherTown.");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Invalid verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      await resendOtp(verifyEmailAddress);
      toast.success("A fresh 6-digit verification code was sent to your email!");
      setResendCooldown(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const switchMode = (next) => {
    setForm(EMPTY);
    setRemainingAttempts(null);
    setLockoutTimer(0);
    setMode(next);
    navigate(next === "login" ? "/login" : "/register", {
      state: location.state,
      replace: true,
    });
  };

  return (
    <div
      style={{
        background: "#FAF8F5",
        color: "#152B17",
        fontFamily: "Outfit, system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      <SEOHead
        title={
          mode === "verify"
            ? "Verify Email | FeatherTown"
            : mode === "login"
            ? "Sign In | FeatherTown"
            : "Create Account | FeatherTown"
        }
        description="Secure customer portal for FeatherTown companion birds, nutrition subscriptions, and order tracking."
      />

      <PageBanner
        eyebrow="Customer Security Portal"
        title={mode === "verify" ? "Account" : mode === "login" ? "Welcome" : "Create an"}
        accent={mode === "verify" ? "Verification" : mode === "login" ? "Back" : "Account"}
        desc={
          mode === "verify"
            ? "Protect your account with verified 2-factor email confirmation."
            : "Access your order history, verified DNA certificates, and lifetime aviary support."
        }
      />

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 clamp(16px, 3.5vw, 24px) 100px" }}>
        <div
          className="rv-scale ft-card-lift"
          style={{
            background: "#FFFFFF",
            borderRadius: 28,
            padding: "clamp(24px, 4vw, 40px) clamp(16px, 4vw, 32px)",
            boxShadow: "0 4px 20px rgba(27, 59, 34, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)",
            border: "1.5px solid #E2DDD3",
            textAlign: "center",
          }}
        >
          {/* Typographic Brand Logo */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 27,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                display: "inline-flex",
                alignItems: "baseline",
              }}
            >
              <span style={{ color: "#1B3B22" }}>Feather</span>
              <span style={{ color: "#D9381E" }}>Town</span>
              <span style={{ color: "#D9381E", fontSize: 32, lineHeight: 0 }}>.</span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#EAF2EC",
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                color: "#1B3B22",
                marginTop: 6,
              }}
            >
              <ShieldCheck size={12} strokeWidth={2.4} />
              <span>Hardened Security Protected</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              MODE 1: 6-DIGIT EMAIL VERIFICATION (OTP)
             ══════════════════════════════════════════════════════ */}
          {mode === "verify" ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#EAF2EC",
                  color: "#1B3B22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <KeyRound size={24} strokeWidth={2.2} />
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#152B17", margin: "0 0 6px 0" }}>
                Verify Your Email
              </h2>
              <p style={{ fontSize: 13.5, color: "#736B5E", margin: "0 0 20px 0", lineHeight: 1.5 }}>
                We sent a 6-digit confirmation code to: <br />
                <strong style={{ color: "#1B3B22" }}>{verifyEmailAddress}</strong>
              </p>

              {/* 6 Digit Inputs */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: 44,
                      height: 52,
                      borderRadius: 12,
                      border: digit ? "2px solid #1B3B22" : "1.5px solid #CBD5E1",
                      background: digit ? "#EAF2EC" : "#FAF8F5",
                      fontSize: 22,
                      fontWeight: 800,
                      textAlign: "center",
                      color: "#152B17",
                      outline: "none",
                      transition: "all 0.15s ease",
                    }}
                  />
                ))}
              </div>

              <p style={{ fontSize: 12, color: "#736B5E", marginBottom: 20 }}>
                Code expires in <strong>10 minutes</strong>. Single use only.
              </p>

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={submitting || otpDigits.some((d) => !d)}
                className="ft-btn-hover t-btn-press"
                style={{
                  width: "100%",
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "13px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14.5,
                  cursor: submitting || otpDigits.some((d) => !d) ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(27, 59, 34, 0.25)",
                  opacity: submitting || otpDigits.some((d) => !d) ? 0.6 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <span>{submitting ? "Verifying…" : "Confirm & Activate"}</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>

              {/* Resend Cooldown Strip */}
              <div style={{ fontSize: 13, color: "#736B5E" }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#D9381E",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <RefreshCw size={13} strokeWidth={2.2} />
                    <span>{resending ? "Sending…" : "Resend 6-Digit Code"}</span>
                  </button>
                ) : (
                  <span>
                    Resend code available in <strong>{resendCooldown}s</strong>
                  </span>
                )}
              </div>

              <div style={{ marginTop: 20, borderTop: "1px solid #E2DDD3", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#736B5E",
                    fontSize: 12.5,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ArrowLeft size={13} strokeWidth={2} />
                  <span>Entered wrong email? Start over</span>
                </button>
              </div>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════
                MODE 2: SIGN IN & CREATE ACCOUNT TABS
               ══════════════════════════════════════════════════ */
            <>
              {/* Tab Switcher */}
              <div
                style={{
                  display: "flex",
                  background: "#FAF8F5",
                  borderRadius: 14,
                  padding: 4,
                  marginBottom: 20,
                  border: "1px solid #E2DDD3",
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
                      border: mode === m ? "1px solid #E2DDD3" : "none",
                      cursor: "pointer",
                      fontSize: 13.5,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      background: mode === m ? "#FFFFFF" : "transparent",
                      color: mode === m ? "#1B3B22" : "#736B5E",
                      boxShadow: mode === m ? "0 1px 3px rgba(27, 59, 34, 0.08)" : "none",
                      transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Lockout Warning Banner */}
              {lockoutTimer > 0 && (
                <div
                  style={{
                    background: "#FEE2E2",
                    border: "1px solid #FCA5A5",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 16,
                    textAlign: "left",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 12.5, color: "#991B1B", lineHeight: 1.4 }}>
                    <strong>Account Temporarily Locked</strong>
                    <br />
                    Too many consecutive failed login attempts. Unlocks automatically in{" "}
                    <strong>
                      {Math.floor(lockoutTimer / 60)}:
                      {(lockoutTimer % 60).toString().padStart(2, "0")}
                    </strong>
                    .
                  </div>
                </div>
              )}

              {/* 1-Click Social OAuth Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <GoogleSignInButton size="large" />
                <AppleSignInButton />
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 20px" }}>
                <div style={{ flex: 1, height: 1, background: "#E2DDD3" }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    color: "#736B5E",
                    textTransform: "uppercase",
                  }}
                >
                  Or with email
                </span>
                <div style={{ flex: 1, height: 1, background: "#E2DDD3" }} />
              </div>

              <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                {mode === "register" && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelStyle}>Your Full Name</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={form.name}
                          onChange={update("name")}
                          placeholder="e.g. Priya Sharma"
                          required
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <AvatarPicker
                        compact
                        selected={selectedAvatar}
                        onSelect={setSelectedAvatar}
                        title="Choose Companion Bird Avatar"
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

                <div style={{ marginBottom: mode === "register" ? 10 : 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={labelStyle}>Password</label>
                    {mode === "login" && (
                      <span style={{ fontSize: 11.5, color: "#736B5E" }}>Min 8 characters</span>
                    )}
                  </div>
                  <input
                    type="password"
                    value={form.password}
                    onChange={update("password")}
                    placeholder="••••••••"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Password Quality Criteria (Register only) */}
                {mode === "register" && (
                  <div
                    style={{
                      background: "#FAF8F5",
                      border: "1px solid #E2DDD3",
                      borderRadius: 10,
                      padding: "8px 12px",
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#736B5E", marginBottom: 4 }}>
                      Security Requirements:
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: passLengthOk ? "#166534" : "#991B1B",
                        marginBottom: 2,
                      }}
                    >
                      <CheckCircle2 size={13} strokeWidth={2.4} />
                      <span>At least 8 characters ({form.password.length}/8)</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: passComplexOk ? "#166534" : "#991B1B",
                      }}
                    >
                      <CheckCircle2 size={13} strokeWidth={2.4} />
                      <span>Contains a number or special character</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || lockoutTimer > 0}
                  className="ft-btn-hover t-btn-press"
                  style={{
                    width: "100%",
                    background: "#D9381E",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "13px",
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: 14.5,
                    cursor: submitting || lockoutTimer > 0 ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(217, 56, 30, 0.25)",
                    transition: "all 0.15s ease",
                    opacity: submitting || lockoutTimer > 0 ? 0.6 : 1,
                  }}
                >
                  {submitting
                    ? "Processing…"
                    : lockoutTimer > 0
                    ? `Locked (${lockoutTimer}s)`
                    : mode === "login"
                    ? "Sign In →"
                    : "Create Account →"}
                </button>
              </form>

              <div style={{ marginTop: 22, fontSize: 13, color: "#736B5E" }}>
                {mode === "login" ? (
                  <>
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1B3B22",
                        fontWeight: 800,
                        cursor: "pointer",
                        padding: 0,
                      }}
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
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1B3B22",
                        fontWeight: 800,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Sign in here
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#152B17",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1.5px solid #E2DDD3",
  fontSize: 14,
  outline: "none",
  background: "#FAF8F5",
  color: "#152B17",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
