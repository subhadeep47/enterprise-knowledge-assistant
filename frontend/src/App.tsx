import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 text-sm text-slate-600"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />Loading your workspace…</div>;
  return <Routes>
    <Route path="/login" element={user ? <Navigate to={user.role === "ADMIN" ? "/admin" : "/chat"} replace /> : <LoginPage />} />
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/chat" element={<ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}><ChatPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminPage /></ProtectedRoute>} />
    </Route>
    <Route path="*" element={<Navigate to={user ? (user.role === "ADMIN" ? "/admin" : "/chat") : "/login"} replace />} />
  </Routes>;
}
export default function App() { return <AppRoutes />; }
