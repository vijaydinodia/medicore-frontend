import { Navigate } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/useAuth";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = getAuthInfo();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
