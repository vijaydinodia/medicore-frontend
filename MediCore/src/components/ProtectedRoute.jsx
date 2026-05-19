import { Navigate, useLocation } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/UseAuth";

const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const auth = getAuthInfo();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const hasRoleCheck = roles.length > 0;
  const userRole = auth.user?.role;

  if (hasRoleCheck && !roles.includes(userRole)) {
    return <Navigate to={auth.dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
