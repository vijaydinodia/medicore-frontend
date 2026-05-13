
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api";

const SignUp = () => {
  const navigate = useNavigate();
  const initialData = {
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    role: "user",
  };
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

    if (!(form.name && form.email && form.phone && form.age && form.gender && form.password)) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/signup", form);
      alert(res.data.message || "Signup successful");
      setForm(initialData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-73px)] bg-slate-100 px-4 py-10 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create Account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Join MediCore</p>
        </div>

        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300">{error}</div>}

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50" placeholder="Full name" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50" placeholder="Email address" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50" placeholder="Phone number" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50" placeholder="Age" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50">
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superAdmin">Super Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900/50" placeholder="Password" />
          </div>
          <button type="submit" disabled={loading} className="h-11 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300 sm:col-span-2 dark:disabled:bg-blue-800">
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account? <Link to="/login" className="font-medium text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
