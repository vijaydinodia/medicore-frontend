import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import AuthShell from "./AuthShell";

const dashboardByRole = (user) => {
  if (user?.role === "superAdmin") return "/super-admin/dashboard";
  if (user?.role === "hospital") return "/hospital/dashboard";
  if (user?.role === "doctor") return "/doctor/dashboard";
  if (user?.role === "admin") return "/hospital/dashboard";
  return "/user/dashboard";
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = { email: "", password: "" };
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      return setError("Email and password are required.");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("authChanged"));
      setForm(initialData);
      const from = location.state?.from;
      const redirectPath = from === "/user/dashboard" && user?.role !== "user" ? dashboardByRole(user) : from || dashboardByRole(user);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Secure sign in"
      title="Welcome back"
      subtitle="Use your MediCore account to continue securely."
      footer={
        <>
          New to MediCore?{" "}
          <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950"
            placeholder="name@hospital.com"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <Link to="/forget" className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:disabled:bg-teal-900"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
