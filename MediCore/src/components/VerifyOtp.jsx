import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import AuthShell from "./AuthShell";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!(email.trim() && otp.trim())) {
      return setError("Email and OTP are required.");
    }

    try {
      setLoading(true);
      await axiosInstance.post("/user/verifyOtp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      navigate("/resetpassword", { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

  return (
    <AuthShell
      eyebrow="Verify identity"
      title="Enter OTP"
      subtitle="Use the verification code sent to your registered email."
      footer={
        <>
          Need another code?{" "}
          <Link to="/forget" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
            Request again
          </Link>
        </>
      }
    >
      {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">OTP code</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} className={inputClass} placeholder="Enter OTP" inputMode="numeric" />
        </div>
        <button type="submit" disabled={loading} className="h-12 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:disabled:bg-teal-900">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </AuthShell>
  );
};

export default VerifyOtp;
