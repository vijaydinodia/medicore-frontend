import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/useAuth";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = getAuthInfo();

  useEffect(() => {
    if (!isAuthenticated || user.role !== "user") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-slate-100 text-left dark:bg-slate-900 dark:text-white px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white">User Dashboard</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Welcome, {user?.name || "user"}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
