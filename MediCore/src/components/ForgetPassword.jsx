
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      return setError("Email is required");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/forget", { email });
      alert(res.data.message || "OTP sent successfully");
      navigate("/verifyotp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-left shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="m-0 text-3xl font-bold text-blue-600">Forgot Password</h1>
          <p className="mt-2 text-gray-500">Enter your email to receive an OTP</p>
        </div>
        {error && <div className="mb-4 rounded-md bg-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Remember password? <Link to="/login" className="font-medium text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword
