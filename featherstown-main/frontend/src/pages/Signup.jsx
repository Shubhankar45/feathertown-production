/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Dedicated Customer Registration
   /pages/Signup.jsx
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
} from "lucide-react";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AppleSignInButton from "../components/AppleSignInButton";
import { useUserAuth } from "../context/UserAuthContext";
import { toast } from "../components/ui/Toast";
import AvatarPicker from "../components/ui/AvatarPicker";

export default function Signup() {
  const {
    user,
    loading,
    googleAuthEnabled,
    appleAuthEnabled,
    register,
    verifyEmail,
    resendOtp,
  } = useUserAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'register' | 'verify'
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("/avatars/scarlet-macaw.svg");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const otpInputRefs = useRef([]);

  const from = location.state?.from?.pathname || "/my-orders";

  // Redirect if logged in and verified
  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      navigate(from, { replace: true });
    }
  }, [loading, user, from, navigate]);

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

  // Password Strength Calculation
  const passwordCriteria = {
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    numberOrSymbol: /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const strengthScore = Object.values(passwordCriteria).filter(Boolean).length;

  // Handle Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service to create an account.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await register(name.trim(), email.trim(), password, selectedAvatar);

      if (data.needsVerification) {
        setVerifyEmailAddress(email.trim());
        setMode("verify");
        toast.info("Account created! A 6-digit code has been sent to your email.");
      } else {
        toast.success(`Welcome to FeatherTown, ${name.trim()}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Registration failed. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  // OTP Handlers
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

  return (
    <>
      <SEOHead
        title="Create Account | FeatherTown Companion Aviary"
        description="Join the FeatherTown flock! Create a free customer account to reserve companion birds, receive verified care guidelines, and access rapid checkout."
      />

      <PageBanner
        tag="JOIN THE FLOCK"
        title="Create Customer Account"
        description="Reserve hand-tamed companion birds, track organic diet deliveries, and access personalized aviary records."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Register Account" },
        ]}
      />

      <div style={{ background: "#FAF8F5", minHeight: "75vh", padding: "48px 16px 80px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
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
                Want to browse birds first?
              </span>
            </div>
            <Link
              to="/birds"
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

          {/* Main Registration Card */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2DDD3",
              padding: "36px 32px",
              boxShadow: "0 12px 36px rgba(27, 59, 34, 0.05)",
            }}
          >
            {mode === "register" ? (
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
                      color: "#1B3B22",
                      marginBottom: 12,
                    }}
                  >
                    <Feather size={24} />
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
                    Create Your Account
                  </h1>
                  <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#64748B" }}>
                    Join thousands of happy companion bird families across India.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Avatar Picker */}
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 8, textAlign: "center" }}>
                      Choose Your Companion Bird Avatar
                    </label>
                    <AvatarPicker value={selectedAvatar} onChange={setSelectedAvatar} />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      Full Name
                    </label>
                    <div style={{ position: "relative" }}>
                      <User
                        size={17}
                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                      />
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Ramesh Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "11px 14px 11px 40px",
                          borderRadius: 12,
                          border: "1.5px solid #CBD5E1",
                          fontSize: 14,
                          outline: "none",
                          background: "#FAF8F5",
                        }}
                      />
                    </div>
                  </div>

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
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                      Password (min 8 characters)
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock
                        size={17}
                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
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

                    {/* Password Strength Meter */}
                    {password && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 4, background: "#E2E8F0", borderRadius: 99, overflow: "hidden", display: "flex", gap: 3 }}>
                          <div
                            style={{
                              flex: 1,
                              background: strengthScore >= 1 ? (strengthScore === 1 ? "#DC2626" : strengthScore === 2 ? "#D97706" : "#166534") : "transparent",
                              borderRadius: 99,
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              background: strengthScore >= 2 ? (strengthScore === 2 ? "#D97706" : "#166534") : "transparent",
                              borderRadius: 99,
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              background: strengthScore >= 3 ? "#166534" : "transparent",
                              borderRadius: 99,
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginTop: 4 }}>
                          <span>Strength: {strengthScore === 3 ? "Strong" : strengthScore === 2 ? "Medium" : "Weak"}</span>
                          <span>{passwordCriteria.length ? "✓ 8+ chars" : "Min 8 chars"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Agree Terms Checkbox */}
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12.5, color: "#475569", cursor: "pointer", marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      style={{ marginTop: 2, accentColor: "#1B3B22" }}
                    />
                    <span>
                      I agree to the{" "}
                      <Link to="/terms" target="_blank" style={{ color: "#1B3B22", fontWeight: 600 }}>
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy-policy" target="_blank" style={{ color: "#1B3B22", fontWeight: 600 }}>
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Submit Button */}
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
                      boxShadow: "0 4px 14px rgba(27, 59, 34, 0.22)",
                      marginTop: 4,
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                {/* OAuth Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                  <span style={{ fontSize: 11.5, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Or sign up with
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                </div>

                {/* 1-Click Social Sign-in */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {googleAuthEnabled && <GoogleSignInButton onSuccess={() => navigate(from, { replace: true })} />}
                  {appleAuthEnabled && <AppleSignInButton onSuccess={() => navigate(from, { replace: true })} />}
                </div>

                {/* Switch to Login */}
                <div style={{ marginTop: 24, textAlign: "center", fontSize: 13.5, color: "#64748B" }}>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    state={{ from: location.state?.from }}
                    style={{ fontWeight: 700, color: "#1B3B22", textDecoration: "underline" }}
                  >
                    Sign In
                  </Link>
                </div>
              </>
            ) : (
              /* OTP Verification View */
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
                        Activating Account...
                      </>
                    ) : (
                      <>
                        Activate Account <CheckCircle2 size={17} />
                      </>
                    )}
                  </button>

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
          </div>
        </div>
      </div>
    </>
  );
}
