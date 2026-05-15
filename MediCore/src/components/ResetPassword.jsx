import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import AuthShell from "./AuthShell";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!location.state?.email) {
      navigate("/forget", { replace: true });
    }
  }, [location.state?.email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(form.email.trim() && form.newPassword)) {
      return setError("Email and new password are required.");
    }

    if (form.newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.patch("/user/resetPassword", {
        email: form.email.trim().toLowerCase(),
        newPassword: form.newPassword,
      });
      setSuccess(res.data.message || "Password updated successfully.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

  return (
    <AuthShell
      eyebrow="New password"
      title="Set a new password"
      subtitle="Choose a strong password to restore account access."
      footer={
        <>
          Back to{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
            login
          </Link>
        </>
      }
    >
      {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
      {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} autoComplete="email" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">New password</label>
          <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className={inputClass} placeholder="Minimum 6 characters" autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loading} className="h-12 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:disabled:bg-teal-900">
          {loading ? "Updating..." : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
