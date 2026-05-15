import { Navigate, useLocation } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/useAuth";

const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, dashboardPath } = getAuthInfo();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
