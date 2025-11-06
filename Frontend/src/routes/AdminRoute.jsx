import React from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../services/auth";

export default function AdminRoute({ children }) {
  const me = getMe();
  if (!me) return <Navigate to="/login" replace />;
  if (!me.is_admin_user) return <Navigate to="/dashboard" replace />;
  return children;
}
