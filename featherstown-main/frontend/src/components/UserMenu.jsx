import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";
import Avatar from "./ui/Avatar";
import AvatarModal from "./ui/AvatarModal";
import { toast } from "./ui/Toast";

export default function UserMenu() {
  const { user, loading, logout, updateAvatar } = useUserAuth();
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/login"
        state={{ from: location }}
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: "#0F172A",
          textDecoration: "none",
          padding: "8px 16px",
          borderRadius: 999,
          border: "1.5px solid #CBD5E1",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
          background: "#F8FAFC",
        }}
      >
        Sign in
      </Link>
    );
  }

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  const handleSelectAvatar = async (newAvatar) => {
    setSavingAvatar(true);
    try {
      await updateAvatar(newAvatar);
      toast.success("Profile avatar updated! 🦜");
      setShowPicker(false);
    } catch (err) {
      toast.error(err.message || "Failed to update avatar");
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: open ? "#ECFDF5" : "none",
            border: "none",
            cursor: "pointer",
            padding: "3px 6px",
            borderRadius: 999,
            transition: "background 0.15s ease",
          }}
          title={user.name}
        >
          <Avatar name={user.name} avatar={user.avatar} size={34} border={false} />
          <span style={{ fontSize: 12, color: "#64748B" }}>▾</span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              background: "#FFFFFF",
              borderRadius: 18,
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 0 0 1px #E2E8F0",
              minWidth: 230,
              padding: "12px",
              zIndex: 300,
            }}
          >
            {/* User Profile Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "4px 6px 12px",
                borderBottom: "1px solid #F1F5F9",
                marginBottom: 8,
              }}
            >
              <Avatar name={user.name} avatar={user.avatar} size={42} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: "#0F172A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "#64748B",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>

            {/* Quick Change Parrot Avatar Button */}
            <button
              onClick={() => {
                setShowPicker(true);
                setOpen(false);
              }}
              style={{
                ...menuItem,
                width: "100%",
                border: "1px solid #A7F3D0",
                background: "#ECFDF5",
                color: "#059669",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span>🦜</span>
              <span>Change Bird Avatar</span>
            </button>

            <Link
              to="/my-orders"
              onClick={() => setOpen(false)}
              style={{ ...menuItem, display: "flex", alignItems: "center", gap: 8, color: "#334155" }}
            >
              <span>📦</span>
              <span>My Orders</span>
            </Link>

            <div style={{ height: 1, background: "#F1F5F9", margin: "6px 0" }} />

            <button
              onClick={handleLogout}
              style={{
                ...menuItem,
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🚪</span>
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      {/* Bird Avatar Picker Modal */}
      <AvatarModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        selected={user.avatar}
        onSelect={handleSelectAvatar}
        saving={savingAvatar}
      />
    </>
  );
}

const menuItem = {
  display: "block",
  padding: "9px 12px",
  borderRadius: 10,
  fontSize: 13.5,
  fontWeight: 600,
  color: "#334155",
  textDecoration: "none",
  transition: "background 0.15s ease",
};
