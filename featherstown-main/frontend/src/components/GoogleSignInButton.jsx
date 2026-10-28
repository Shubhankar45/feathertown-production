import { useEffect, useRef } from "react";
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

export default function GoogleSignInButton({ size = "medium", onSuccess }) {
  const { googleAuthEnabled, loginWithGoogle } = useUserAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);

  useEffect(() => {
    if (!googleAuthEnabled || !CLIENT_ID || !btnRef.current) return;
    let cancelled = false;

    (async () => {
      const ok = await loadGis();
      if (!ok || cancelled || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            toast.success("Signed in");
            onSuccess ? onSuccess() : navigate("/my-orders");
          } catch (err) {
            toast.error(err.message);
          }
        },
      });

      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size,
        shape: "pill",
        text: "signin_with",
      });
    })();

    return () => { cancelled = true; };
  }, [googleAuthEnabled, size, loginWithGoogle, navigate, onSuccess]);

  if (!googleAuthEnabled || !CLIENT_ID) return null;

  return <div ref={btnRef} />;
}
