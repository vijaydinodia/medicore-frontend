import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/useAuth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = getAuthInfo();

  useEffect(() => {
    if (!isAuthenticated || user.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 text-left dark:bg-slate-900 dark:text-white px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Admin Dashboard</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">This is the admin dashboard placeholder.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
