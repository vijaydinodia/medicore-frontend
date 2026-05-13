import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthInfo } from "../custom_hook/useAuth";

const Pill = ({ children, tone = "neutral" }) => {
  const className =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
      : tone === "danger"
        ? "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
        : tone === "warning"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
};

const HospitalDashborad = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = getAuthInfo();

  const [message, setMessage] = useState("");
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    // Backend currently assigns hospital-approved accounts as role="admin".
    // We keep this UI accessible for both: admin users and (future) hospital role.
    // If you later add a dedicated role, tighten this check.
    const role = user?.role;
    if (role !== "admin" && role !== "hospital") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const statusTone = useMemo(() => {
    const status = hospital?.status || "pending";
    if (status === "approved") return "success";
    if (status === "rejected") return "danger";
    return "warning";
  }, [hospital]);

  useEffect(() => {
    // No hospital-specific backend endpoint exists in this repo to fetch hospital profile.
    // So we show dashboard based on what is available in the stored user.
    // If later you add endpoints like /hospital/me, wire them here.
    const nextHospital = {
      hospitalName: user?.name || "Your Hospital",
      email: user?.email || "",
      status: user?.status || "pending",
      isActive: user?.status === "approved" ? true : false,
    };
    setHospital(nextHospital);
  }, [user]);

  const onGoToProfile = () => {
    setMessage(
      "Profile screen not implemented in this repo. Add your hospital profile APIs/UI if needed.",
    );
  };

  const onGoToAddHospitalRequest = () => {
    navigate("/add-hospital");
  };

  const hospitalStatus = hospital?.status || "pending";

  return (
    <div className="min-h-screen bg-slate-100 text-left dark:bg-slate-900 dark:text-white px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
              Hospital Dashboard
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Manage your registration status and (future) hospital profile.
            </p>
          </div>

          <div className="flex gap-2">
            <Pill tone={statusTone}>{hospitalStatus}</Pill>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-slate-900">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 px-4 py-5 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Hospital
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {hospital?.hospitalName || "-"}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-5 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-300">Email</p>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {hospital?.email || "-"}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-5 dark:bg-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Account Status
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              {hospital?.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
            Quick actions
          </h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onGoToProfile}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View / Edit Profile
            </button>

            {hospitalStatus === "pending" ? (
              <button
                onClick={onGoToAddHospitalRequest}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                Submit / Update Registration Request
              </button>
            ) : (
              <button
                onClick={() =>
                  setMessage(
                    "No further hospital actions are implemented in the backend for this status yet.",
                  )
                }
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                View Request Details
              </button>
            )}
          </div>

          <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">
            Note: This repo currently only supports hospital registration
            creation (/addHospital) and admin/super-admin approval flows. To
            make this dashboard fully functional, add hospital-specific APIs
            (e.g., GET /hospital/me, PATCH /hospital/profile).
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashborad;
