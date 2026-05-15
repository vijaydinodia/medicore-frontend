import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import AuthShell from "./AuthShell";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      return setError("Email is required.");
    }

    try {
      setLoading(true);
      await axiosInstance.post("/user/forget", { email: email.trim().toLowerCase() });
      navigate("/verifyotp", { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Reset access"
      subtitle="Enter your registered email and we will send an OTP for verification."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
            Back to login
          </Link>
        </>
      }
    >
      {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950"
            placeholder="name@hospital.com"
            autoComplete="email"
          />
        </div>
        <button type="submit" disabled={loading} className="h-12 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:disabled:bg-teal-900">
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ForgetPassword;
