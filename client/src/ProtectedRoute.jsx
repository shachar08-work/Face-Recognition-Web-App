// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useUserStore from "./store";

export default function ProtectedRoute({ children }) {
  const code = useUserStore((state) => state.code);

  if (!code) {
    // Not authenticated – redirect to code entry
    return <Navigate to="/" replace />;
  }

  return children;
}
