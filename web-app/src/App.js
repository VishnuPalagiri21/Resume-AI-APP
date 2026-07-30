import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage          from "./pages/LandingPage";
import RecruiterAuth        from "./pages/auth/RecruiterAuth";
import AdminLogin           from "./pages/auth/AdminLogin";
import AuthCallback         from "./pages/auth/AuthCallback";
import UserDashboard        from "./pages/user/UserDashboard";
import RecruiterDashboard   from "./pages/recruiter/RecruiterDashboard";
import AdminPanel           from "./pages/admin/AdminPanel";
import EditorPage           from "./pages/editor/EditorPage";
import ForgotPassword       from "./pages/auth/ForgotPassword";
import VerifyOtp            from "./pages/auth/VerifyOtp";
import ResetPassword        from "./pages/auth/ResetPassword";

function AppContent() {
  const vantaRef = useRef(null);
  const location = useLocation();

  // Determine if the current route is an authenticated dashboard/application route
  const isDashboard =
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/editor");

  useEffect(() => {
    let vantaEffect = null;
    // Only run Vanta animated net effect on landing & auth screens, not inside dashboards
    if (!isDashboard && window.VANTA && window.VANTA.NET && vantaRef.current) {
      vantaEffect = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x8b5cf6,          // Purple net nodes
        backgroundColor: 0x0f172a, // Deep slate background
        points: 10.00,
        maxDistance: 20.00,
        spacing: 20.00
      });
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [isDashboard]);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Dynamic Background: Animated Vanta for Public Landing/Login; Clean Modern Dark Grid Theme for Dashboard */}
      {!isDashboard ? (
        <div ref={vantaRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -10 }} />
      ) : (
        <div className="app-dashboard-bg" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -10 }} />
      )}

      <Routes>
        {/* Public — User-facing (main page) */}
        <Route path="/"                element={<LandingPage />} />

        {/* OAuth Callback */}
        <Route path="/auth/callback"   element={<AuthCallback />} />

        {/* Password Reset Verification System */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp"      element={<VerifyOtp />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Recruiter portal — separate page */}
        <Route path="/recruiter"       element={<RecruiterAuth />} />

        {/* Admin portal */}
        <Route path="/admin-login"     element={<AdminLogin />} />

        {/* Legacy routes kept for compatibility */}
        <Route path="/login/user"      element={<LandingPage />} />
        <Route path="/login/recruiter" element={<RecruiterAuth />} />
        <Route path="/login/admin"     element={<AdminLogin />} />

        {/* Job Seeker Dashboard */}
        <Route path="/dashboard/user" element={
          <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
        } />

        {/* Recruiter Dashboard */}
        <Route path="/dashboard/recruiter" element={
          <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
        } />

        {/* Admin Panel */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>
        } />

        {/* LaTeX Editor (user only) */}
        <Route path="/editor" element={
          <ProtectedRoute role="user"><EditorPage /></ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute role="user"><EditorPage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}