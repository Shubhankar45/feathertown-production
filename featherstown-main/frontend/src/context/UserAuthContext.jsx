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
  if (!res.ok) throw new Error(data?.msg || "Something went wrong");
  return data;
}

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user/me", { credentials: "include" });
      setUser(res.ok ? await res.json() : null);
    } catch {
      setUser(null);
    }
  }, []);

  // Email/password sessions work regardless of Google config, so the
  // session check always runs — only the button visibility depends on
  // whether Google is set up.
  useEffect(() => {
    (async () => {
      fetch("/api/auth/user/status")
        .then((r) => (r.ok ? r.json() : { googleAuthEnabled: false }))
        .then((status) => setGoogleAuthEnabled(Boolean(status.googleAuthEnabled)))
        .catch(() => setGoogleAuthEnabled(false));

      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const register = useCallback(async (name, email, password, avatar = "") => {
    const data = await postJson("/api/auth/user/register", { name, email, password, avatar });
    setUser(data.user);
    return data.user;
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

  const loginWithPassword = useCallback(async (email, password) => {
    const data = await postJson("/api/auth/user/login", { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  /** credential = the Google ID token from Google Identity Services */
  const loginWithGoogle = useCallback(async (credential) => {
    const data = await postJson("/api/auth/user/google", { credential });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/user/logout", { method: "POST", credentials: "include" });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loading,
        googleAuthEnabled,
        register,
        loginWithPassword,
        loginWithGoogle,
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
