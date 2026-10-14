import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LoginPage from "../pages/LoginPage";
import { ProtectedRoute } from "../auth/ProtectedRoute";
import AppLayout from "../components/AppLayout";
import ChatPage from "../pages/ChatPage";
import AdminPage from "../pages/AdminPage";

export default function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#F4F0EA] text-sm text-[#706B64]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#D6CEC3] border-t-[#C85A32]" />
        Loading your workspace…
      </div>
    );
  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === "ADMIN" ? "/admin" : "/chat"} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={user ? (user.role === "ADMIN" ? "/admin" : "/chat") : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}