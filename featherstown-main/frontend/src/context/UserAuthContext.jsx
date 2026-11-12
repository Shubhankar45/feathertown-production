import { createContext, useContext, useEffect, useState, useCallback } from "react";

const UserAuthContext = createContext(null);

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.msg || "Something went wrong");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || "");
  const [appleAuthEnabled, setAppleAuthEnabled] = useState(true);
  const [appleClientId, setAppleClientId] = useState(import.meta.env.VITE_APPLE_CLIENT_ID || "");
  const [verificationPending, setVerificationPending] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user/me", { credentials: "include" });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        if (u && !u.emailVerified) {
          setVerificationPending({ email: u.email, name: u.name });
        } else {
          setVerificationPending(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      fetch("/api/auth/user/status")
        .then((r) => (r.ok ? r.json() : { googleAuthEnabled: false, appleAuthEnabled: true }))
        .then((status) => {
          setGoogleAuthEnabled(Boolean(status.googleAuthEnabled));
          if (status.googleClientId) setGoogleClientId(status.googleClientId);
          setAppleAuthEnabled(status.appleAuthEnabled !== false);
          if (status.appleClientId) setAppleClientId(status.appleClientId);
        })
        .catch(() => {
          setGoogleAuthEnabled(false);
          setAppleAuthEnabled(true);
        });

      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const register = useCallback(async (name, email, password, avatar = "") => {
    const data = await postJson("/api/auth/user/register", { name, email, password, avatar });
    setUser(data.user);
    if (data.needsVerification) {
      setVerificationPending({ email, name });
    }
    return data;
  }, []);

  const verifyEmail = useCallback(async (email, otp) => {
    const data = await postJson("/api/auth/user/verify-email", { email, otp });
    setUser(data.user);
    setVerificationPending(null);
    return data.user;
  }, []);

  const resendOtp = useCallback(async (email) => {
    const data = await postJson("/api/auth/user/resend-otp", { email });
    return data;
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    const data = await postJson("/api/auth/user/login", { email, password });
    setUser(data.user);
    if (data.user && !data.user.emailVerified) {
      setVerificationPending({ email: data.user.email, name: data.user.name });
    } else {
      setVerificationPending(null);
    }
    return data.user;
  }, []);

  /** credential = Google ID token from Google Identity Services */
  const loginWithGoogle = useCallback(async (credential) => {
    const data = await postJson("/api/auth/user/google", { credential });
    setUser(data.user);
    setVerificationPending(null);
    return data.user;
  }, []);

  /** id_token = Apple ID token from Sign in with Apple JS */
  const loginWithApple = useCallback(async (id_token, appleUser = null) => {
    const data = await postJson("/api/auth/user/apple", { id_token, user: appleUser });
    setUser(data.user);
    setVerificationPending(null);
    return data.user;
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const data = await postJson("/api/auth/user/refresh", {});
      setUser(data.user);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const updateAvatar = useCallback(async (avatar) => {
    const res = await fetch("/api/auth/user/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ avatar }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.msg || "Failed to update avatar");
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/user/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
      setVerificationPending(null);
    }
  }, []);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loading,
        googleAuthEnabled,
        googleClientId,
        appleAuthEnabled,
        appleClientId,
        verificationPending,
        setVerificationPending,
        register,
        verifyEmail,
        resendOtp,
        loginWithPassword,
        loginWithGoogle,
        loginWithApple,
        refreshToken,
        logout,
        refresh,
        updateAvatar,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used inside <UserAuthProvider>");
  return ctx;
}
