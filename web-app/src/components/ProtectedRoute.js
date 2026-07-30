import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  user:      "/dashboard/user",
  recruiter: "/dashboard/recruiter",
  admin:     "/admin",
};

/**
 * Wraps a route so only authenticated users with the correct role can access it.
 * Usage: <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (role && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
