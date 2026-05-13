import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    newPassword: "",
  });

  // keep flow intact on refresh/back
  if (!form.email) {
    navigate("/forget", { replace: true });
  }

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(form.email && form.newPassword)) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.patch("/user/resetPassword", {
        email: form.email,
        newPassword: form.newPassword,
      });

      alert(res.data.message || "Password updated successfully");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-left shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="m-0 text-3xl font-bold text-blue-600">
            Reset Password
          </h1>
          <p className="mt-2 text-gray-500">Update your MediCore password</p>
        </div>
        {error && (
          <div className="mb-4 rounded-md bg-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Back to{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
