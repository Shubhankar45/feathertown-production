import { useEffect } from "react";
import { X } from "lucide-react";
import AvatarPicker from "./AvatarPicker";

export default function AvatarModal({
  isOpen,
  onClose,
  selected,
  onSelect,
  saving = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      {/* Modal Card Matching Clean Light SaaS Aesthetic */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          maxWidth: 520,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          animation: "modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: "#0F172A",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Choose your avatar
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#64748B",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              transition: "color 0.15s ease",
            }}
            title="Close"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Body with Avatar Picker */}
        <div style={{ padding: "0 24px 16px", overflowY: "auto", flex: 1 }}>
          <AvatarPicker
            selected={selected}
            onSelect={onSelect}
            compact={false}
            showCategoryTabs={true}
          />

          {saving && (
            <div
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 13,
                color: "#1B3B22",
                fontWeight: 700,
              }}
            >
              Saving your companion parrot avatar…
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #F1F5F9",
            background: "#F8FAFC",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "8px 22px",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
              transition: "all 0.15s ease",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
