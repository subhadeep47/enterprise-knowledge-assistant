import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { UserRole } from "../api/types";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading your workspace…
      </div>
    );
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={user.role === "ROLE_ADMIN" ? "/admin" : "/chat"} replace />;
  return children;
}
