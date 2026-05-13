import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api";

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
      return setError("Email and OTP are required");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/verifyOtp", { email, otp });
      alert(res.data.message || "OTP verified");
      navigate("/resetpassword", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-left shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="m-0 text-3xl font-bold text-blue-600">Verify OTP</h1>
          <p className="mt-2 text-gray-500">Check your email for the reset code</p>
        </div>
        {error && <div className="mb-4 rounded-md bg-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-700">OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter OTP" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
