import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import Dashboard from "./pages/dashboard/dashboard";
import DashboardHome from "./pages/dashboard/sections/DashboardHome";
import Rooms from "./pages/dashboard/sections/Rooms";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import "./App.css";
import { DotLoader } from "react-spinners";
import { Toaster } from "react-hot-toast";

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <DotLoader color="rgb(100, 108, 255)" size={60} />
        <p className="text-gray-500 dark:text-gray-400">
          <DotLoader color="rgb(100, 108, 255)" size={60} />
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="rooms" element={<Rooms />} />
      </Route>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { background: "#1a1a1a", color: "#fff" },
          success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </>
  );
}
