import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import { toast } from "./ui/Toast";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function loadGis() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function GoogleSignInButton({ size = "large", onSuccess }) {
  const { googleAuthEnabled, loginWithGoogle } = useUserAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [gisRendered, setGisRendered] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !btnRef.current) return;
    let cancelled = false;

    (async () => {
      const ok = await loadGis();
      if (!ok || cancelled || !window.google?.accounts?.id || !btnRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential);
              toast.success("Signed in with Google!");
              onSuccess ? onSuccess() : navigate("/my-orders");
            } catch (err) {
              toast.error(err.message || "Google authentication failed");
            }
          },
        });

        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 380,
          text: "continue_with",
        });
        setGisRendered(true);
      } catch (e) {
        console.warn("GIS render error:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [googleAuthEnabled, loginWithGoogle, navigate, onSuccess]);

  const handleFallbackClick = () => {
    if (!CLIENT_ID) {
      toast.info(
        "Google Sign-In is enabled. Configure VITE_GOOGLE_CLIENT_ID in your environment to complete live Google authorization.",
        { duration: 5000 }
      );
    }
  };

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div ref={btnRef} style={{ display: gisRendered ? "block" : "none", width: "100%" }} />

      {!gisRendered && (
        <button
          type="button"
          onClick={handleFallbackClick}
          className="t-btn-press t-hover-lift"
          style={{
            width: "100%",
            height: 42,
            borderRadius: 999,
            background: "#FFFFFF",
            color: "#3C4043",
            border: "1.5px solid #DADCE0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "Outfit, system-ui, sans-serif",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
            transition: "all 0.15s ease",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
}
