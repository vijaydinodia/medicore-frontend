import { useEffect, useState } from "react";

export const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem("token") || "";

export const getDashboardPath = (user) => {
  if (user?.role === "superAdmin") return "/super-admin/dashboard";
  if (user?.role === "hospital") return "/hospital/dashboard";
  if (user?.role === "doctor") return "/doctor/dashboard";
  if (user?.role === "admin") {
    return user?.hospitalId ? "/hospital/dashboard" : "/admin/dashboard";
  }
  return "/user/dashboard";
};

export const getAuthInfo = () => {
  const user = parseStoredUser();
  const token = getStoredToken();
  const isAuthenticated = Boolean(token && user?.role);
  const dashboardPath = getDashboardPath(user);

  return { user, token, isAuthenticated, dashboardPath };
};

export const useAuth = () => {
  const [auth, setAuth] = useState(() => getAuthInfo());

  useEffect(() => {
    const syncAuth = () => setAuth(getAuthInfo());
    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChanged", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChanged", syncAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    window.location.href = "/login";
  };

  return {
    ...auth,
    logout,
  };
};
