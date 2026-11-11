import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Package, LogOut, Smile } from "lucide-react";
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
        className="t-btn-press"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textDecoration: "none",
          color: "#1B3B22",
          fontSize: 11,
          fontWeight: 700,
          position: "relative",
        }}
        aria-label="Account Login"
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#FAF8F5",
            border: "1px solid #E2DDD3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1B3B22",
            marginBottom: 1,
          }}
        >
          <User size={19} strokeWidth={2.2} />
        </div>
        <span className="ft-icon-label" style={{ color: "#1B3B22" }}>Account</span>
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
      toast.success("Profile avatar updated successfully!");
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
            flexDirection: "column",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: "#1B3B22",
            fontSize: 11,
            fontWeight: 700,
          }}
          title={user.name}
          aria-label="User Account Menu"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: open ? "#E7EFE8" : "#FAF8F5",
              border: "1px solid #E2DDD3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 1,
              transition: "background 0.15s ease",
            }}
          >
            <Avatar name={user.name} avatar={user.avatar} size={30} border={false} />
          </div>
          <span className="ft-icon-label" style={{ color: "#1B3B22" }}>Account</span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              background: "#FFFFFF",
              borderRadius: 18,
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 0 0 1px #E2DDD3",
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
                borderBottom: "1px solid #E2DDD3",
                marginBottom: 8,
              }}
            >
              <Avatar name={user.name} avatar={user.avatar} size={42} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: "#152B17",
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
                    color: "#736B5E",
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
                border: "1px solid #B8D4BA",
                background: "#E7EFE8",
                color: "#1B3B22",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Smile size={15} strokeWidth={2.2} />
              <span>Change Bird Avatar</span>
            </button>

            <Link
              to="/my-orders"
              onClick={() => setOpen(false)}
              style={{ ...menuItem, display: "flex", alignItems: "center", gap: 8, color: "#152B17" }}
            >
              <Package size={15} strokeWidth={2.2} />
              <span>My Orders</span>
            </Link>

            <div style={{ height: 1, background: "#E2DDD3", margin: "6px 0" }} />

            <button
              onClick={handleLogout}
              style={{
                ...menuItem,
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#D9381E",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LogOut size={15} strokeWidth={2.2} />
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
  color: "#152B17",
  textDecoration: "none",
  transition: "background 0.15s ease",
};
