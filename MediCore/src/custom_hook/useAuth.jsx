import { useEffect, useState } from "react";

export const parseStoredUser = () => {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem("token") || "";
};

export const getDashboardPath = (user) => {
  if (user?.role === "superAdmin") return "/super-admin/dashboard";
  if (user?.role === "hospital") return "/hospital/dashboard";
  if (user?.role === "doctor") return "/doctor/dashboard";

  if (user?.role === "admin") {
    return "/hospital/dashboard";
  }

  return "/user/dashboard";
};

export const getAuthInfo = () => {
  const user = parseStoredUser();
  const token = getStoredToken();
  const dashboardPath = getDashboardPath(user);
  const isAuthenticated = Boolean(token && user?.role);

  return {
    user,
    token,
    dashboardPath,
    isAuthenticated,
  };
};

export const UseAuth = () => {
  const [auth, setAuth] = useState(getAuthInfo());

  const refreshAuth = () => {
    setAuth(getAuthInfo());
  };

  useEffect(() => {
    window.addEventListener("storage", refreshAuth);
    window.addEventListener("authChanged", refreshAuth);

    return () => {
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("authChanged", refreshAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    window.location.href = "/";
  };

  return {
    ...auth,
    logout,
  };
};
