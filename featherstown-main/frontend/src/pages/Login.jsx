/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Dedicated Customer Login
   /pages/Login.jsx
═══════════════════════════════════════════════════════════════ */
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  User,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AppleSignInButton from "../components/AppleSignInButton";
import { useUserAuth } from "../context/UserAuthContext";
import { toast } from "../components/ui/Toast";

export default function Login() {
  const {
    user,
    loading,
    googleAuthEnabled,
    appleAuthEnabled,
    verificationPending,
    setVerificationPending,
    loginWithPassword,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
  } = useUserAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'verify' | 'forgot'
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter otp + new pass
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  // Submit Password Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    if (lockoutTimer > 0) {
      toast.error(`Account temporarily locked for security. Try again in ${lockoutTimer}s.`);
      return;
    }

    try {
      setSubmitting(true);
      const loggedUser = await loginWithPassword(email.trim(), password);

      if (loggedUser && !loggedUser.emailVerified) {
        setVerifyEmailAddress(loggedUser.email);
        setMode("verify");
        toast.info("Please verify your email address to complete sign in.");
      } else {
        toast.success(`Welcome back, ${loggedUser?.name || "Member"}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failure:", err);
      if (err.status === 429) {
        const lockout = err.data?.lockoutRemaining || 300;
        setLockoutTimer(lockout);
        toast.error(`Too many failed attempts. Temporary lockout for ${Math.ceil(lockout / 60)} minutes.`);
      } else {
        if (err.data?.remainingAttempts !== undefined) {
          setRemainingAttempts(err.data.remainingAttempts);
        }
        toast.error(err.message || "Invalid credentials. Please verify your details.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // OTP Input handlers
  const handleOtpChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, "");
    if (!clean) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("");
      const next = [...otpDigits];
      pasted.forEach((ch, i) => {
        if (i < 6) next[i] = ch;
      });
      setOtpDigits(next);
      const focusIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (index < 5 && clean) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP Verification
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
      navigate(from, { replace: true });
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

  // Forgot Password Handlers
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    try {
      setResetting(true);
      await forgotPassword(forgotEmail.trim());
      toast.success("If an account exists, a 6-digit code has been sent!");
      setForgotStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to request password reset code.");
    } finally {
      setResetting(false);
    }
  };

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
      toast.success("Password reset successfully! Please log in.");
      setEmail(forgotEmail.trim());
      setMode("login");
      setForgotStep(1);
      setResetOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.message || "Could not reset password. Please verify code.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Sign In | FeatherTown Companion Aviary"
        description="Log in to your FeatherTown customer account to track orders, manage companion bird bookings, and access exclusive flock benefits."
      />

      <PageBanner
        tag="CUSTOMER PORTAL"
        title="Sign In to FeatherTown"
        description="Access your companion bird records, order history, and seamless aviary services."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Customer Sign In" },
        ]}
      />

      <div style={{ background: "#FAF8F5", minHeight: "70vh", padding: "48px 16px 80px" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          {/* Guest Browsing Shortcut Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2DDD3",
              borderRadius: 14,
              padding: "12px 18px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#166534" }} />
              <span style={{ fontSize: 13, color: "#475569" }}>
                Just looking around?
              </span>
            </div>
            <Link
              to="/accessories"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1B3B22",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Browse as Guest <ArrowRight size={14} />
            </Link>
          </div>

          {/* Main Auth Card */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2DDD3",
              padding: "36px 32px",
              boxShadow: "0 12px 36px rgba(27, 59, 34, 0.05)",
            }}
          >
            {/* Mode 1: Standard Login */}
            {mode === "login" && (
              <>
                <div style={{ textAlign: "center", marginBottom: 26 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "#EAF2EC",
                      color: "#1B3B22",
                      marginBottom: 12,
                    }}
                  >
                    <Lock size={24} />
                  </div>
                  <h1
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#1B3B22",
                      margin: 0,
                    }}
                  >
                    Welcome Back
                  </h1>
                  <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#64748B" }}>
                    Sign in with your email and password to continue.
                  </p>
                </div>

                {/* Brute force lockout warning */}
                {lockoutTimer > 0 && (
                  <div
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FEE2E2",
                      borderRadius: 12,
                      padding: "12px 16px",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: "#DC2626",
                    }}
                  >
                    <AlertTriangle size={18} />
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                      Account locked for security. Please wait {lockoutTimer}s before retrying.
                    </div>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Email */}
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      Email Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail
                        size={17}
                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                      />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px 11px 40px",
                          borderRadius: 12,
                          border: "1.5px solid #CBD5E1",
                          fontSize: 14,
                          outline: "none",
                          background: "#FAF8F5",
                          transition: "all 0.15s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: "#334155" }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setMode("forgot");
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: 12,
                          color: "#1B3B22",
                          fontWeight: 700,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div style={{ position: "relative" }}>
                      <Lock
                        size={17}
                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 40px 11px 40px",
                          borderRadius: 12,
                          border: "1.5px solid #CBD5E1",
                          fontSize: 14,
                          outline: "none",
                          background: "#FAF8F5",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          color: "#94A3B8",
                          cursor: "pointer",
                        }}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || lockoutTimer > 0}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: 12,
                      background: "#1B3B22",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: submitting || lockoutTimer > 0 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(27, 59, 34, 0.22)",
                      marginTop: 4,
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                {/* OAuth Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                  <span style={{ fontSize: 11.5, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Or continue with
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                </div>

                {/* 1-Click Social Sign-in */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {googleAuthEnabled && <GoogleSignInButton onSuccess={() => navigate(from, { replace: true })} />}
                  {appleAuthEnabled && <AppleSignInButton onSuccess={() => navigate(from, { replace: true })} />}
                </div>

                {/* Switch to Register */}
                <div style={{ marginTop: 24, textAlign: "center", fontSize: 13.5, color: "#64748B" }}>
                  Don't have an account yet?{" "}
                  <Link
                    to="/register"
                    state={{ from: location.state?.from }}
                    style={{ fontWeight: 700, color: "#1B3B22", textDecoration: "underline" }}
                  >
                    Create Account
                  </Link>
                </div>
              </>
            )}

            {/* Mode 2: Email OTP Verification */}
            {mode === "verify" && (
              <>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "#EAF2EC",
                      color: "#166534",
                      marginBottom: 12,
                    }}
                  >
                    <Mail size={24} />
                  </div>
                  <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 26, fontWeight: 700, color: "#1B3B22", margin: 0 }}>
                    Verify Your Email
                  </h2>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B" }}>
                    We sent a 6-digit verification code to:
                  </p>
                  <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 13.5, marginTop: 2 }}>
                    {verifyEmailAddress}
                  </div>
                </div>

                <form onSubmit={handleVerifySubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
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
                          width: 46,
                          height: 52,
                          textAlign: "center",
                          fontSize: 22,
                          fontWeight: 700,
                          borderRadius: 10,
                          border: digit ? "2px solid #1B3B22" : "1.5px solid #CBD5E1",
                          background: digit ? "#EAF2EC" : "#FAF8F5",
                          color: "#1B3B22",
                          outline: "none",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: 12,
                      background: "#1B3B22",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: submitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Verifying Code...
                      </>
                    ) : (
                      <>
                        Confirm &amp; Activate Account <CheckCircle2 size={17} />
                      </>
                    )}
                  </button>

                  {/* Resend Cooldown */}
                  <div style={{ textAlign: "center", fontSize: 13, color: "#64748B" }}>
                    Didn't receive the email?{" "}
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#1B3B22",
                          fontWeight: 700,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {resending ? "Sending..." : "Resend Code"}
                      </button>
                    ) : (
                      <span style={{ color: "#94A3B8" }}>Resend in {resendCooldown}s</span>
                    )}
                  </div>
                </form>
              </>
            )}

            {/* Mode 3: Forgot Password Flow */}
            {mode === "forgot" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    style={{
                      background: "#F1F5F9",
                      border: "none",
                      borderRadius: 8,
                      padding: "6px 8px",
                      cursor: "pointer",
                      color: "#475569",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 24, fontWeight: 700, color: "#1B3B22", margin: 0 }}>
                    Reset Password
                  </h2>
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestResetOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                      Enter your account's email address. We'll send you a 6-digit verification code to reset your password.
                    </p>
                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: "1.5px solid #CBD5E1",
                          fontSize: 14,
                          background: "#FAF8F5",
                          outline: "none",
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resetting}
                      style={{
                        padding: "12px",
                        borderRadius: 12,
                        background: "#1B3B22",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: resetting ? "not-allowed" : "pointer",
                      }}
                    >
                      {resetting ? "Sending Code..." : "Send Verification Code"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
                      Enter the 6-digit code sent to <strong>{forgotEmail}</strong> and choose a new password.
                    </p>
                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                        6-Digit Reset Code
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: "1.5px solid #CBD5E1",
                          fontSize: 18,
                          letterSpacing: 4,
                          textAlign: "center",
                          fontWeight: 700,
                          background: "#FAF8F5",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                        New Password (min 8 characters)
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "11px 40px 11px 14px",
                            borderRadius: 12,
                            border: "1.5px solid #CBD5E1",
                            fontSize: 14,
                            background: "#FAF8F5",
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            color: "#94A3B8",
                            cursor: "pointer",
                          }}
                        >
                          {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={resetting}
                      style={{
                        padding: "12px",
                        borderRadius: 12,
                        background: "#1B3B22",
                        color: "#FFFFFF",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: resetting ? "not-allowed" : "pointer",
                      }}
                    >
                      {resetting ? "Updating Password..." : "Update Password & Sign In"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
