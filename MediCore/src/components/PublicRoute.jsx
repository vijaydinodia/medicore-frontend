import { Navigate } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/UseAuth";

const PublicRoute = ({ children }) => {
  const auth = getAuthInfo();

  if (auth.isAuthenticated) {
    return <Navigate to={auth.dashboardPath} replace />;
  }

  return children;
};

export default PublicRoute;
