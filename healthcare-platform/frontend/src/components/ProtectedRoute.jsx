import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../api/client";

export default function ProtectedRoute({ children, role }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user?.role || "").toLowerCase().trim();
  const requiredRole = String(role || "").toLowerCase().trim();

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
}