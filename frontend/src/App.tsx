import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "./components/Navbar";

// Route-level code splitting: each page (and only what it uses) is a separate chunk.
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Goals = lazy(() => import("./pages/Goals"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const SetupProfile = lazy(() => import("./pages/SetupProfile"));

function AppLayout() {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {!hideNavbar && <Navbar />}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup-profile" element={<SetupProfile />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
