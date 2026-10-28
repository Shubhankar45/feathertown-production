import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ADMIN_BASE } from "../../config/adminConfig";

export default function ProtectedAdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="ft-spin" style={{ width: 28, height: 28, borderWidth: 3 }} />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to={`${ADMIN_BASE}/login`} state={{ from: location }} replace />;
  }

  return children;
}
