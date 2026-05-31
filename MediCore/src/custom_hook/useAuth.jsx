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

export const getUserRole = (user) => {
  const role = String(user?.role || "").trim();

  if (role.toLowerCase() === "medical" || user?.medicalStoreId || user?.medicalId) {
    return "medical";
  }

  return role;
};

export const getDashboardPath = (user) => {
  const role = getUserRole(user);

  if (role === "superAdmin") return "/super-admin/dashboard";
  if (role === "hospital") return "/hospital/dashboard";
  if (role === "doctor") return "/doctor/dashboard";
  if (role === "lab") return "/lab/dashboard";
  if (role === "medical") return "/medical/dashboard";

  if (role === "admin") {
    return "/hospital/dashboard";
  }

  return "/user/dashboard";
};

export const getAuthInfo = () => {
  const storedUser = parseStoredUser();
  const role = getUserRole(storedUser);
  const user = storedUser ? { ...storedUser, role } : null;
  const token = getStoredToken();
  const dashboardPath = getDashboardPath(user);
  const isAuthenticated = Boolean(token && role);

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
