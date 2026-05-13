import { useState, useEffect } from "react";

export const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem("token") || "";

export const getAuthInfo = () => {
  const user = parseStoredUser();
  const token = getStoredToken();
  const isAuthenticated = Boolean(token && user?.role);
  const dashboardPath = user?.role === "superAdmin"
    ? "/super-admin/dashboard"
    : user?.role === "admin"
      ? "/admin/dashboard"
      : "/user/dashboard";

  return { user, token, isAuthenticated, dashboardPath };
};

export const useAuth = () => {
  const [auth, setAuth] = useState(() => getAuthInfo());

  useEffect(() => {
    const syncAuth = () => setAuth(getAuthInfo());
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return {
    ...auth,
    logout,
  };
};