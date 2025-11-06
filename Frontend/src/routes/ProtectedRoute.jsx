// src/routes/ProtectedRoute.jsx
// Protect pages that require login (e.g. /dashboard)
// Not logged in => redirect to /login

import { Navigate } from "react-router-dom";
import { isAuthed } from "../services/auth";

export default function ProtectedRoute({ children }) {
  if (!isAuthed()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
