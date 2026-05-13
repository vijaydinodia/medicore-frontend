import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api";

const Login = () => {
  const navigate = useNavigate();

  const initialData = {
    email: "",
    password: "",
  };

  const [form, setForm] = useState(initialData);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear error
    setError("");
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!form.email || !form.password) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      // login api
      const res = await axiosInstance.post("/user/login", form);

      console.log(res.data);

      // save token
      localStorage.setItem("token", res.data.token);

      // save user
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // sync auth state in the current tab
      window.dispatchEvent(new Event("authChanged"));

      const role = res.data.user.role;

      if (role === "superAdmin") {
        navigate("/super-admin/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }

      // success message
      alert(res.data.message);

      // clear form
      setForm(initialData);

    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-900">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Login</h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Welcome back to MediCore</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50"
            />
          </div>

          <div className="text-right">
            <Link
              to="/forget"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`h-11 w-full rounded-md text-sm font-semibold text-white shadow-sm transition
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed dark:bg-blue-800"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
