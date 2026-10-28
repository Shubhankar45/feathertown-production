import { useEffect, useState, useMemo } from "react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/admin/subscribers");
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this subscriber?")) return;
    try {
      await adminFetch(`/api/admin/subscribers/${id}`, { method: "DELETE" });
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
      toast.success("Subscriber removed");
    } catch (err) {
      toast.error(err.message || "Failed to delete subscriber");
    }
  };

  const copyEmail = (email) => {
    navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  };

  const exportCSV = () => {
    if (!subscribers.length) return toast.warn("No subscribers to export");
    const headers = ["Email", "Joined Date"];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      s.createdAt ? new Date(s.createdAt).toISOString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `featherstown-subscribers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscribers list exported as CSV");
  };

  const filtered = useMemo(() => {
    return subscribers.filter((s) =>
      search === "" || s.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [subscribers, search]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
            📬 Email Subscribers ({subscribers.length})
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            Newsletter signups who receive welcome emails, breeding updates, and seasonal care discounts.
          </p>
        </div>

        <button
          onClick={exportCSV}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 10,
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#334155",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <span>📥</span> Export CSV
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Filter by email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: "10px 14px",
            borderRadius: 8,
            background: "#FFFFFF",
            border: "1px solid #CBD5E1",
            color: "#0F172A",
            fontSize: 13.5,
            outline: "none",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
          Loading subscribers...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "#FFFFFF",
            border: "1px dashed #CBD5E1",
            borderRadius: 14,
            padding: "50px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
            No subscribers found
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            border: "1px solid #E2E8F0",
            overflowX: "auto",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, color: "#334155" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Subscriber Email</th>
                <th style={{ padding: "14px 16px", textAlign: "left", color: "#475569", fontWeight: 700 }}>Subscribed On</th>
                <th style={{ padding: "14px 16px", textAlign: "right", color: "#475569", fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#0F172A" }}>
                    {s.email}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#64748B", fontSize: 12.5 }}>
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }) : "—"}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <button
                        onClick={() => copyEmail(s.email)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "#F1F5F9",
                          border: "1px solid #CBD5E1",
                          color: "#334155",
                          fontSize: 12,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: "#FEF2F2",
                          border: "1px solid #FECACA",
                          color: "#DC2626",
                          fontSize: 12,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
