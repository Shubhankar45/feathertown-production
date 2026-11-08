import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageBanner from "../components/PageBanner";
import SEOHead from "../components/SEOHead";
import { useUserAuth } from "../context/UserAuthContext";
import Avatar from "../components/ui/Avatar";
import AvatarModal from "../components/ui/AvatarModal";
import { getAvatarMeta } from "../config/birdAvatars";
import { toast } from "../components/ui/Toast";

const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", fg: "#B45309" },
  confirmed: { bg: "#DBEAFE", fg: "#1E40AF" },
  shipped: { bg: "#E0E7FF", fg: "#4338CA" },
  delivered: { bg: "#DCFCE7", fg: "#15803D" },
  cancelled: { bg: "#FEE2E2", fg: "#991B1B" },
};

export default function MyOrders() {
  const { user, loading: authLoading, updateAvatar } = useUserAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const avatarMeta = user ? getAvatarMeta(user.avatar) : null;

  const handleSelectAvatar = async (newAvatar) => {
    setUpdatingAvatar(true);
    try {
      await updateAvatar(newAvatar);
      toast.success("Profile avatar updated! 🦜");
      setShowPicker(false);
    } catch (err) {
      toast.error(err.message || "Failed to update avatar");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/orders/mine", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div style={{ background: "#F8FAFC", color: "#0F172A", fontFamily: "Outfit, system-ui, sans-serif", minHeight: "100vh" }}>
      <SEOHead
        title="My Orders | FeatherTown"
        description="View your FeatherTown order history, tracking statuses, and past bird care purchases."
      />

      <PageBanner eyebrow="Account" title="Order" accent="History" desc="Track past and ongoing deliveries for your companion bird." />

      <div style={{ width: "100%", maxWidth: "100%", margin: "0 auto", padding: "0 clamp(16px, 4vw, 64px) 80px" }}>
        {/* Customer Profile Banner Card with Bird Avatar */}
        {user && (
          <div
            className="rv"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              padding: "20px 24px",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
              border: "1px solid #E2E8F0",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative" }}>
                <Avatar name={user.name} avatar={user.avatar} size={64} />
                <button
                  onClick={() => setShowPicker(true)}
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    background: "#059669",
                    color: "#FFFFFF",
                    border: "2px solid #FFFFFF",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 10,
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.15)",
                  }}
                  title="Change Bird Avatar"
                >
                  ✏️
                </button>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>
                    {user.name}
                  </h2>
                  <span
                    style={{
                      background: "#ECFDF5",
                      color: "#059669",
                      border: "1px solid #A7F3D0",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    FeatherTown Member 🦜
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{user.email}</div>
                {avatarMeta && (
                  <div style={{ fontSize: 12, color: "#059669", fontWeight: 700, marginTop: 4 }}>
                    Companion: {avatarMeta.name} — {avatarMeta.tagline}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowPicker(true)}
              style={{
                background: "#F8FAFC",
                border: "1.5px solid #CBD5E1",
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                color: "#0F172A",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <span>🦜</span>
              <span>Change Bird Avatar</span>
            </button>
          </div>
        )}

        {authLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#059669" }}>Checking account…</div>
        ) : !user ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <p style={{ color: "#64748B", marginBottom: 20, fontSize: 15 }}>
              Please sign in to view your past purchases and shipment tracking.
            </p>
            <Link
              to="/login"
              state={{ from: location }}
              style={{
                background: "#16A34A",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: 999,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
              }}
            >
              Sign In to Your Account →
            </Link>
          </div>
        ) : loading ? (
          <p style={{ color: "#64748B", textAlign: "center" }}>Loading orders…</p>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#FFFFFF",
              borderRadius: 24,
              border: "1px solid #E2E8F0",
              boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>No orders found</h3>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 20 }}>
              Your future accessory, cage, and treat hauls will appear here.
            </p>
            <Link
              to="/accessories"
              style={{
                background: "#16A34A",
                color: "#FFFFFF",
                padding: "10px 22px",
                borderRadius: 999,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
              }}
            >
              Browse Accessories
            </Link>
          </div>
        ) : (
          <div className="rv-stagger" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map((o) => {
              const c = STATUS_COLORS[o.orderStatus] || STATUS_COLORS.pending;
              return (
                <div
                  key={o._id}
                  className="ft-card-lift"
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 22,
                    padding: "clamp(16px, 3.5vw, 24px) clamp(14px, 3.5vw, 22px)",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                        Order #{o._id?.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                        Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} • {o.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 17, color: "#059669" }}>
                        ₹{o.amount?.toLocaleString("en-IN")}
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: 4,
                          fontSize: 11.5,
                          fontWeight: 800,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: c.bg,
                          color: c.fg,
                        }}
                      >
                        {o.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>Items:</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      {o.items?.map((it, idx) => (
                        <li key={idx} style={{ fontSize: 13, color: "#334155", display: "flex", justifyContent: "space-between" }}>
                          <span>{it.name} × {it.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bird Avatar Selection Modal */}
      <AvatarModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        selected={user?.avatar}
        onSelect={handleSelectAvatar}
        saving={updatingAvatar}
      />
    </div>
  );
}
