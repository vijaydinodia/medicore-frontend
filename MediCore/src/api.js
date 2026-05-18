import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete?.("Content-Type");
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  return config;
});

export default axiosInstance;
