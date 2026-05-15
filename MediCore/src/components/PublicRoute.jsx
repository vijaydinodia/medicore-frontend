import { Navigate } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/useAuth";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, dashboardPath } = getAuthInfo();

  if (isAuthenticated) {
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default PublicRoute;