import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import AuthShell from "./AuthShell";

const SignUp = () => {
  const navigate = useNavigate();
  const initialData = {
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
  };
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(form.name.trim() && form.email.trim() && form.phone.trim() && form.age && form.gender && form.password)) {
      return setError("Please complete every required field.");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };
      const res = await axiosInstance.post("/user/signup", payload);
      setSuccess(res.data.message || "Account created successfully. You can now login.");
      setForm(initialData);
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

  return (
    <AuthShell
      wide
      eyebrow="Create access"
      title="Create your account"
      subtitle="Choose the correct role so MediCore can send you to the right workspace after login."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
            Sign in
          </Link>
        </>
      }
    >
      {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
      {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">{success}</div>}

      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</label>
          <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Aarav Sharma" autoComplete="name" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="name@hospital.com" autoComplete="email" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="9876543210" autoComplete="tel" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Age</label>
          <input type="number" min="1" name="age" value={form.age} onChange={handleChange} className={inputClass} placeholder="32" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="Minimum 6 characters" autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loading} className="h-12 rounded-md bg-teal-700 px-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-800 disabled:bg-teal-400 sm:col-span-2 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 dark:disabled:bg-teal-900">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default SignUp;
