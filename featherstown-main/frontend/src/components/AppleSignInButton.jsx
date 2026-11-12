/* ═══════════════════════════════════════════════════════════════
   Feathers Town — Sign in with Apple Component
   /components/AppleSignInButton.jsx
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { toast } from "./ui/Toast";

const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || "";
const REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin;

function loadAppleSdk() {
  return new Promise((resolve) => {
    if (window.AppleID?.auth) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/auth.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function AppleSignInButton({ onSuccess }) {
  const { appleAuthEnabled, appleClientId, loginWithApple } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const activeClientId = appleClientId || APPLE_CLIENT_ID;

  useEffect(() => {
    if (activeClientId) {
      loadAppleSdk().then((ok) => {
        if (ok && window.AppleID) {
          try {
            window.AppleID.auth.init({
              clientId: activeClientId,
              scope: "name email",
              redirectURI: REDIRECT_URI,
              usePopup: true,
            });
          } catch (e) {
            console.warn("AppleID init warning:", e);
          }
        }
      });
    }
  }, [activeClientId]);

  if (!appleAuthEnabled) return null;

  const handleAppleClick = async () => {
    setLoading(true);
    try {
      if (APPLE_CLIENT_ID && window.AppleID?.auth) {
        const response = await window.AppleID.auth.signIn();
        if (response?.authorization?.id_token) {
          await loginWithApple(response.authorization.id_token, response.user);
          toast.success("Signed in with Apple!");
          onSuccess ? onSuccess() : navigate("/my-orders");
        }
      } else {
        // Fallback for demonstration / sandbox without active Apple developer credentials:
        // Prompt user or display informative guidance
        toast.info(
          "Apple Sign-In is enabled. Configure VITE_APPLE_CLIENT_ID in your environment to complete live Apple authorization.",
          { duration: 5000 }
        );
      }
    } catch (err) {
      if (err.error !== "popup_closed_by_user") {
        toast.error(err.message || "Apple sign-in could not be completed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAppleClick}
      disabled={loading}
      className="t-btn-press t-hover-lift"
      style={{
        width: "100%",
        height: 42,
        borderRadius: 999,
        background: "#000000",
        color: "#FFFFFF",
        border: "1px solid #000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Outfit', sans-serif",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.75 : 1,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        transition: "all 0.15s ease",
      }}
    >
      <svg
        width="16"
        height="19"
        viewBox="0 0 170 170"
        fill="currentColor"
        style={{ display: "block", marginBottom: 2 }}
      >
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.73-11.65-14.07-5.59-8.7-10.05-18.42-13.38-29.17-3.32-10.74-4.99-21.28-4.99-31.62 0-14.04 3.48-26.06 10.45-36.05 6.97-9.98 15.93-15.08 26.88-15.29 4.9.11 10.45 1.34 16.66 3.69 6.21 2.35 10.37 3.58 12.49 3.69 1.63 0 5.66-1.28 12.08-3.83 6.42-2.55 12.02-3.72 16.8-3.52 12.5.82 22.56 5.61 30.17 14.37-10.9 6.64-16.22 15.84-15.97 27.6.25 9.27 3.86 17.06 10.82 23.36 4.36 3.99 9.38 6.82 15.07 8.5-2.29 6.94-5.07 14.06-8.34 21.36zM119.22 33.64c0-7.25 2.65-14.15 7.95-20.7 5.3-6.55 11.89-10.66 19.78-12.34.22 1.3.33 2.5.33 3.6 0 7.37-2.82 14.47-8.46 21.29-5.64 6.82-12.29 10.74-19.95 11.75-.44-1.2-.65-2.4-.65-3.6z" />
      </svg>
      <span>{loading ? "Connecting…" : "Continue with Apple"}</span>
    </button>
  );
}

