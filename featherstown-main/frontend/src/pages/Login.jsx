/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Standalone Unified Customer Auth Gateway
   /pages/Login.jsx

   - NO Navbar, NO Footer, NO Page Chrome
   - Default Landing Screen when first opening the website
   - Unified Sign In & Create Account tabs with zero page reload
   - 100% Brand Typography (Outfit, system-ui, sans-serif)
   - Exact Brand Logo ("Feather" in #1B3B22 + "Town." in #D9381E)
   - Compact, elegant, fully responsive: EVERYTHING visible without scrolling
   - Full security: Brute-force lockout countdown, Password strength meter,
     Email OTP verification, Password Reset flow, Google & Apple OAuth
   - 1-Click "Continue as Guest" to enter and explore the full store
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
  Eye,
  EyeOff,
  Feather,
  Sparkles,
  Check,
} from "lucide-react";
import SEOHead from "../components/SEOHead";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AppleSignInButton from "../components/AppleSignInButton";
import { useUserAuth } from "../context/UserAuthContext";
import { toast } from "../components/ui/Toast";

// 6 Fast Avian Companion Avatars for Quick Profile Selection
const QUICK_AVATARS = [
  { id: "scarlet-macaw", name: "Scarlet Macaw", path: "/avatars/scarlet-macaw.svg", color: "#D9381E" },
  { id: "cockatiel", name: "Cockatiel", path: "/avatars/cockatiel.svg", color: "#1B3B22" },
  { id: "conure-sun", name: "Sun Conure", path: "/avatars/conure-sun.svg", color: "#EAB308" },
  { id: "african-grey", name: "African Grey", path: "/avatars/african-grey.svg", color: "#64748B" },
  { id: "green-cheek", name: "Green-Cheek", path: "/avatars/green-cheek.svg", color: "#166534" },
  { id: "lovebird", name: "Lovebird", path: "/avatars/lovebird.svg", color: "#EC4899" },
];

export default function Login({ defaultTab = "login" }) {
  const {
    user,
    loading,
    googleAuthEnabled,
    appleAuthEnabled,
    verificationPending,
    activateGuestMode,
    register,
    loginWithPassword,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
  } = useUserAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'register' | 'verify' | 'forgot'
  const [mode, setMode] = useState(defaultTab === "register" ? "register" : "login");

  // Common Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Register Specific States
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("/avatars/scarlet-macaw.svg");

  // OTP Verification States
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const otpInputRefs = useRef([]);

  // Lockout & Brute-force States
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter otp + new pass
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const from = location.state?.from?.pathname || "/";

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

  // Update mode if defaultTab prop changes
  useEffect(() => {
    if (defaultTab === "register") setMode("register");
  }, [defaultTab]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const t = setInterval(() => {
      setLockoutTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [lockoutTimer]);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (mode !== "verify") return;
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [mode, resendCooldown]);

  // Password Strength Calculation (Register mode)
  const passwordCriteria = {
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    numberOrSymbol: /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
  const strengthScore = Object.values(passwordCriteria).filter(Boolean).length;

  // 1-Click Continue as Guest handler
  const handleContinueAsGuest = () => {
    activateGuestMode();
    navigate(from === "/login" || from === "/register" ? "/" : from, { replace: true });
  };

  // Sign In submit handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      toast.error(`Account temporarily locked. Please wait ${lockoutTimer}s.`);
      return;
    }
    if (!email.trim() || !password) {
      toast.warn("Please enter both your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const loggedUser = await loginWithPassword(email.trim().toLowerCase(), password);

      if (loggedUser && !loggedUser.emailVerified) {
        toast.info("Please enter the verification code sent to your email.");
        setVerifyEmailAddress(email.trim().toLowerCase());
        setMode("verify");
        return;
      }

      toast.success(`Welcome back to FeatherTown, ${loggedUser.name}!`);
      navigate(from === "/login" || from === "/register" ? "/" : from, { replace: true });
    } catch (err) {
      if (err.data?.locked) {
        setLockoutTimer(err.data.lockoutSeconds || 900);
        toast.error(`Too many failed attempts. Locked for ${Math.ceil((err.data.lockoutSeconds || 900) / 60)} mins.`);
      } else if (err.status === 429) {
        setLockoutTimer(60);
        toast.error("Too many attempts. Please pause for 60 seconds.");
      } else {
        toast.error(err.message || "Invalid email or password.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Register submit handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.warn("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warn("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.warn("Password must be at least 8 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(name.trim(), email.trim().toLowerCase(), password, selectedAvatar);
      toast.success("Account created! We've sent a 6-digit verification code to your email.");
      setVerifyEmailAddress(email.trim().toLowerCase());
      setMode("verify");
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // OTP digit input handlers
  const handleOtpChange = (index, val) => {
    const clean = val.replace(/\D/g, "");
    const updated = [...otpDigits];

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (i < 6) updated[i] = c;
      });
      setOtpDigits(updated);
      const nextIdx = Math.min(chars.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    updated[index] = clean ? clean[clean.length - 1] : "";
    setOtpDigits(updated);

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify email submit
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }
    try {
      setSubmitting(true);
      await verifyEmail(verifyEmailAddress, code);
      toast.success("Email verified successfully! Welcome to FeatherTown.");
      navigate(from === "/login" || from === "/register" ? "/" : from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Incorrect verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    try {
      setResending(true);
      await resendOtp(verifyEmailAddress);
      toast.success("A fresh 6-digit code has been dispatched to your email.");
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err.message || "Could not resend code. Please wait.");
    } finally {
      setResending(false);
    }
  };

  // Request password reset OTP
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    try {
      setResetting(true);
      await forgotPassword(forgotEmail.trim());
      toast.success("If an account exists, a 6-digit reset code has been sent!");
      setForgotStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to request password reset code.");
    } finally {
      setResetting(false);
    }
  };

  // Confirm password reset
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!resetOtp.trim() || resetOtp.trim().length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    try {
      setResetting(true);
      await resetPassword(forgotEmail.trim(), resetOtp.trim(), newPassword);
      toast.success("Password reset successfully! Please sign in with your new password.");
      setEmail(forgotEmail.trim());
      setMode("login");
      setForgotStep(1);
      setResetOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Could not reset password. Please check your code.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: "#FAF8F5",
        fontFamily: "Outfit, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(16px, 3vh, 32px) clamp(16px, 4vw, 24px)",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <SEOHead
        title={mode === "register" ? "Create Account | FeatherTown" : "Sign In | FeatherTown"}
        description="Access India's premier companion bird aviary, track orders, and connect with healthy hand-tamed birds."
      />

      {/* Floating Top-Left "Continue as Guest" pill */}
      <button
        type="button"
        onClick={handleContinueAsGuest}
        style={{
          position: "absolute",
          top: "clamp(12px, 2vh, 24px)",
          left: "clamp(12px, 2vw, 28px)",
          background: "#FFFFFF",
          border: "1px solid #E2DDD3",
          borderRadius: 99,
          padding: "7px 14px",
          color: "#1B3B22",
          fontSize: 12.5,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(27, 59, 34, 0.04)",
          fontFamily: "inherit",
          transition: "all 0.15s ease",
        }}
      >
        <Feather size={14} color="#166534" />
        <span>Explore Store as Guest</span>
        <ArrowRight size={13} />
      </button>

      {/* Central Auth Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#FFFFFF",
          borderRadius: 22,
          border: "1px solid #E2DDD3",
          boxShadow: "0 12px 36px rgba(27, 59, 34, 0.06), 0 1px 3px rgba(0,0,0,0.02)",
          padding: "clamp(22px, 3vh, 32px) clamp(20px, 4vw, 32px)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", lineHeight: 1, marginBottom: 6 }}>
            <span
              style={{
                fontFamily: "Outfit, system-ui, sans-serif",
                fontSize: 27,
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
                fontSize: 27,
                fontWeight: 900,
                color: "#D9381E",
                letterSpacing: "-0.025em",
              }}
            >
              Town
            </span>
            <span
              style={{
                fontFamily: "Outfit, system-ui, sans-serif",
                fontSize: 27,
                fontWeight: 900,
                color: "#D9381E",
              }}
            >
              .
            </span>
          </div>
          <p
            style={{
              fontSize: 12.5,
              color: "#64748B",
              margin: 0,
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {mode === "login" && "Sign in to manage companion bird bookings & orders"}
            {mode === "register" && "Join FeatherTown for certified aviary care & member perks"}
            {mode === "verify" && "Enter the 6-digit verification code sent to your inbox"}
            {mode === "forgot" && "Reset your password with secure email verification"}
          </p>
        </div>

        {/* ── MODE: SIGN IN or CREATE ACCOUNT ── */}
        {(mode === "login" || mode === "register") && (
          <>
            {/* Quick Segmented Tabs: Sign In | Create Account */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "#FAF8F5",
                borderRadius: 12,
                padding: 4,
                border: "1px solid #E2DDD3",
                marginBottom: 16,
              }}
            >
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 9,
                  border: "none",
                  background: mode === "login" ? "#1B3B22" : "transparent",
                  color: mode === "login" ? "#FFFFFF" : "#64748B",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 9,
                  border: "none",
                  background: mode === "register" ? "#1B3B22" : "transparent",
                  color: mode === "register" ? "#FFFFFF" : "#64748B",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
              >
                Create Account
              </button>
            </div>

            {/* Lockout Warning Banner */}
            {lockoutTimer > 0 && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12.5,
                  color: "#991B1B",
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={16} />
                <span>Locked for brute-force protection ({lockoutTimer}s remaining)</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={mode === "login" ? handleLoginSubmit : handleRegisterSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {/* Full Name (Register only) */}
                {mode === "register" && (
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <div style={{ position: "relative" }}>
                      <User size={16} color="#64748B" style={iconLeftStyle} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aditi Sharma"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} color="#64748B" style={iconLeftStyle} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setMode("forgot");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#166534",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: 0,
                          fontFamily: "inherit",
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="#64748B" style={iconLeftStyle} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      style={{ ...inputStyle, paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={iconRightBtnStyle}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                    </button>
                  </div>

                  {/* Password strength bar (Register only) */}
                  {mode === "register" && password && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: "flex", gap: 4, height: 4, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                        <div style={{ flex: 1, background: strengthScore >= 1 ? (strengthScore === 1 ? "#DC2626" : strengthScore === 2 ? "#D97706" : "#166534") : "#E2E8F0" }} />
                        <div style={{ flex: 1, background: strengthScore >= 2 ? (strengthScore === 2 ? "#D97706" : "#166534") : "#E2E8F0" }} />
                        <div style={{ flex: 1, background: strengthScore === 3 ? "#166534" : "#E2E8F0" }} />
                      </div>
                      <div style={{ fontSize: 11, color: strengthScore === 3 ? "#166534" : strengthScore === 2 ? "#D97706" : "#DC2626", fontWeight: 600 }}>
                        {strengthScore === 3 ? "Strong password" : strengthScore === 2 ? "Moderate password" : "Weak (include upper, lower & numbers)"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Avatar Row (Register only) */}
                {mode === "register" && (
                  <div>
                    <label style={labelStyle}>Choose Avian Avatar</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                      {QUICK_AVATARS.map((av) => {
                        const isSelected = selectedAvatar === av.path;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av.path)}
                            title={av.name}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              border: isSelected ? "2.5px solid #1B3B22" : "1.5px solid #E2DDD3",
                              background: "#FAF8F5",
                              padding: 3,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <img src={av.path} alt={av.name} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                            {isSelected && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  background: "#1B3B22",
                                  color: "#FFFFFF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Check size={9} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || lockoutTimer > 0}
                  style={{
                    marginTop: 4,
                    width: "100%",
                    height: 42,
                    borderRadius: 11,
                    background: lockoutTimer > 0 ? "#94A3B8" : "#1B3B22",
                    color: "#FFFFFF",
                    border: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: lockoutTimer > 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(27, 59, 34, 0.2)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: "2px solid #FFFFFF",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "login" ? "Sign In to FeatherTown" : "Create My Account"}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            {(googleAuthEnabled || appleAuthEnabled) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  margin: "14px 0 10px",
                }}
              >
                <div style={{ flex: 1, height: 1, background: "#E2DDD3" }} />
                <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: 1, background: "#E2DDD3" }} />
              </div>
            )}

            {/* OAuth Buttons Row */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {googleAuthEnabled && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <GoogleSignInButton
                    size="large"
                    onSuccess={() => navigate(from === "/login" || from === "/register" ? "/" : from, { replace: true })}
                  />
                </div>
              )}
              {appleAuthEnabled && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <AppleSignInButton
                    onSuccess={() => navigate(from === "/login" || from === "/register" ? "/" : from, { replace: true })}
                  />
                </div>
              )}
            </div>

            {/* Prominent Continue as Guest Button */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid #E2DDD3",
                textAlign: "center",
              }}
            >
              <button
                type="button"
                onClick={handleContinueAsGuest}
                style={{
                  background: "#FAF8F5",
                  border: "1px solid #E2DDD3",
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: "#1B3B22",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "inherit",
                  width: "100%",
                  justifyContent: "center",
                  transition: "background 0.15s ease",
                }}
              >
                <Feather size={14} color="#166534" />
                <span>Continue as Guest · Explore Store</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </>
        )}

        {/* ── MODE: EMAIL VERIFICATION (OTP) ── */}
        {mode === "verify" && (
          <form onSubmit={handleVerifySubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ textAlign: "center", margin: "6px 0 10px" }}>
                <span style={{ fontSize: 13, color: "#1B3B22", fontWeight: 700 }}>
                  {verifyEmailAddress}
                </span>
              </div>

              {/* 6 Digit Input Boxes */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: 44,
                      height: 50,
                      borderRadius: 10,
                      border: d ? "2px solid #1B3B22" : "1.5px solid #E2DDD3",
                      background: d ? "#FFFFFF" : "#FAF8F5",
                      fontSize: 22,
                      fontWeight: 800,
                      textAlign: "center",
                      color: "#1B3B22",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: 6,
                  width: "100%",
                  height: 42,
                  borderRadius: 11,
                  background: "#1B3B22",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "inherit",
                }}
              >
                {submitting ? "Verifying..." : "Verify & Complete"}
              </button>

              {/* Resend OTP */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, color: "#64748B" }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || resending}
                  style={{
                    background: "none",
                    border: "none",
                    color: canResend ? "#166534" : "#94A3B8",
                    fontWeight: 700,
                    cursor: canResend ? "pointer" : "default",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  {resending ? "Sending code..." : canResend ? "Resend 6-Digit Code" : `Resend in ${resendCooldown}s`}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("login")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748B",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                    fontWeight: 600,
                  }}
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── MODE: FORGOT PASSWORD ── */}
        {mode === "forgot" && (
          <div>
            {forgotStep === 1 ? (
              <form onSubmit={handleRequestResetOtp}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Registered Email</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={16} color="#64748B" style={iconLeftStyle} />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetting}
                    style={{
                      marginTop: 4,
                      width: "100%",
                      height: 42,
                      borderRadius: 11,
                      background: "#1B3B22",
                      color: "#FFFFFF",
                      border: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontFamily: "inherit",
                    }}
                  >
                    {resetting ? "Dispatching Code..." : "Send Reset Code →"}
                  </button>

                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#166534",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>6-Digit Reset Code</label>
                    <div style={{ position: "relative" }}>
                      <KeyRound size={16} color="#64748B" style={iconLeftStyle} />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        style={{ ...inputStyle, letterSpacing: 3, fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: "relative" }}>
                      <Lock size={16} color="#64748B" style={iconLeftStyle} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        style={{ ...inputStyle, paddingRight: 38 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={iconRightBtnStyle}
                      >
                        {showNewPassword ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetting}
                    style={{
                      marginTop: 4,
                      width: "100%",
                      height: 42,
                      borderRadius: 11,
                      background: "#1B3B22",
                      color: "#FFFFFF",
                      border: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontFamily: "inherit",
                    }}
                  >
                    {resetting ? "Resetting Password..." : "Update Password & Sign In →"}
                  </button>

                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setMode("login");
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#166534",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared Compact Input Styles ──
const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#152B17",
  marginBottom: 4,
  fontFamily: "Outfit, system-ui, sans-serif",
};

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "0 12px 0 36px",
  borderRadius: 10,
  border: "1px solid #E2DDD3",
  background: "#FAF8F5",
  color: "#152B17",
  fontSize: 13.5,
  fontFamily: "Outfit, system-ui, sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease, background 0.15s ease",
};

const iconLeftStyle = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
};

const iconRightBtnStyle = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
