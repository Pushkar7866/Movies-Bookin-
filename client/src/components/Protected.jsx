import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

// Route guard: needs a logged-in account with the given role
export default function Protected({ role, children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}
