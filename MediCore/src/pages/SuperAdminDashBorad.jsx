import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import EditProfile from "../components/EditProfile";
import AddLocation from "../components/AddLocation";
import HospitalDetails from "../components/HospitalDetails";
import HospitalTableView from "../components/HospitalTableView";
import { useTheme } from "../custom_hook/useTheme";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deleted", label: "Deleted" },
];

const paths = {
  hospital: "M4 20V7l8-4 8 4v13M8 20v-8h8v8M3 20h18",
  location: "M12 21s7-5.4 7-12a7 7 0 10-14 0c0 6.6 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z",
  moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H9M13 5V4a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2h6a2 2 0 002-2v-1",
  refresh: "M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0012 3M19 9A7 7 0 007 6",
  plus: "M12 5v14M5 12h14",
  users: "M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  archive: "M3 7h18M5 7l1 13h12l1-13M9 11h6M4 4h16v3H4V4z",
};

const Icon = ({ name, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
  </svg>
);

const IconButton = ({ label, icon, tone = "neutral", className = "", ...props }) => {
  const tones = {
    primary: "border-teal-700 bg-teal-700 text-white hover:bg-teal-800 dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400",
    danger: "border-rose-500 bg-rose-500 text-white hover:bg-rose-600",
    neutral: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
    dark: "border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-900 dark:border-slate-700",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition focus:outline-none focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-950 ${tones[tone]} ${className}`}
      {...props}
    >
      <Icon name={icon} />
      <span className="sr-only">{label}</span>
    </button>
  );
};

const StatTile = ({ label, value, icon, tone = "teal" }) => {
  const tones = {
    teal: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon name={icon} />
        </span>
      </div>
    </div>
  );
};

const SuperAdminDashBorad = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState("hospital");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

  const stats = {
    total: hospitals.length,
    pending: hospitals.filter((item) => item.status === "pending").length,
    approved: hospitals.filter((item) => item.status === "approved").length,
    rejected: hospitals.filter((item) => item.status === "rejected").length,
    inactive: hospitals.filter((item) => item.isActive === false).length,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchHospitals = async () => {
    setLoading(true);
    setMessage("");
    try {
      const endpointByStatus = {
        all: "/super-admin/hospitals/all",
        active: "/super-admin/hospitals/active",
        inactive: "/super-admin/hospitals/inactive",
        deleted: "/super-admin/hospitals/deleted",
      };

      const response = await axiosInstance.get(endpointByStatus[statusFilter]);
      setHospitals(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load hospitals. Refresh page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [statusFilter]);

  const handleApproveHospital = async (hospitalId) => {
    const targetHospital = hospitals.find((item) => item._id === hospitalId);

    if (targetHospital?.status === "approved") {
      setMessage("Hospital already approved.");
      return;
    }

    try {
      await axiosInstance.patch(`/super-admin/hospitals/${hospitalId}/approve`);
      setMessage("Hospital approved successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) setSelectedHospital((prev) => ({ ...prev, status: "approved" }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Approve failed.");
    }
  };

  const handleRejectHospital = async (hospitalId) => {
    const targetHospital = hospitals.find((item) => item._id === hospitalId);

    if (targetHospital?.status === "rejected") {
      setMessage("Hospital already rejected.");
      return;
    }

    try {
      await axiosInstance.patch(`/super-admin/hospitals/${hospitalId}/reject`);
      setMessage("Hospital rejected successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) setSelectedHospital((prev) => ({ ...prev, status: "rejected" }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Reject failed.");
    }
  };

  const handleSoftDeleteHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(`/super-admin/hospitals/${hospitalId}/soft-delete`);
      setMessage("Hospital soft deleted successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) setSelectedHospital((prev) => ({ ...prev, isDeleted: true }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Delete failed.");
    }
  };

  const handleRestoreHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(`/super-admin/hospitals/${hospitalId}/restore`);
      setMessage("Hospital restored successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) setSelectedHospital((prev) => ({ ...prev, isDeleted: false }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Restore failed.");
    }
  };

  const handleToggleActiveHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(`/super-admin/hospitals/${hospitalId}/toggle-active`);
      setMessage("Hospital status updated successfully.");
      fetchHospitals();
    } catch (error) {
      setMessage(error.response?.data?.message || "Status update failed.");
    }
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && selectedHospital) setSelectedHospital(null);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedHospital]);

  const navItems = [
    { id: "hospital", label: "Hospitals", icon: "hospital" },
    { id: "location", label: "Locations", icon: "location" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-left text-slate-950 dark:bg-slate-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950">
            <Icon name="hospital" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight">MediCore</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Super Admin</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const active = activeMenu === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMenu(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-teal-700 text-white shadow-lg shadow-teal-900/10 dark:bg-teal-500 dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
          <IconButton label="Toggle theme" icon={theme === "light" ? "moon" : "sun"} tone="neutral" onClick={toggleTheme} />
          <IconButton label="Logout" icon="logout" tone="danger" onClick={handleLogout} />
          <div className="min-w-0 pl-2">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{currentUser.name || "Super Admin"}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{currentUser.email || "System access"}</p>
          </div>
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Command center</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                  {activeMenu === "hospital" ? "Hospital Governance" : "Location Registry"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {activeMenu === "hospital"
                    ? "Review hospital registrations, approve access, and control live records."
                    : "Create state, district, city, and location records for hospital onboarding."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeMenu === "hospital" && <IconButton label="Refresh hospitals" icon="refresh" tone="neutral" onClick={fetchHospitals} />}
                {activeMenu === "location" && <IconButton label="Add location" icon="plus" tone="primary" onClick={() => setActiveMenu("location")} />}
                <EditProfile user={currentUser} onUpdated={setCurrentUser} />
                <div className="lg:hidden">
                  <IconButton label="Logout" icon="logout" tone="danger" onClick={handleLogout} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto lg:hidden">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMenu(item.id)}
                  className={`inline-flex min-w-12 items-center justify-center rounded-md border px-3 py-2 transition ${
                    activeMenu === item.id
                      ? "border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950"
                      : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon name={item.icon} />
                  <span className="sr-only">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 xl:px-8">
          {activeMenu === "location" && <AddLocation />}

          {activeMenu === "hospital" && (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <StatTile label="Total" value={stats.total} icon="hospital" />
                <StatTile label="Pending" value={stats.pending} icon="users" tone="slate" />
                <StatTile label="Approved" value={stats.approved} icon="check" tone="emerald" />
                <StatTile label="Rejected" value={stats.rejected} icon="x" tone="rose" />
                <StatTile label="Inactive" value={stats.inactive} icon="archive" tone="slate" />
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">Hospital requests</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Filter records and use icon actions to approve, reject, activate, delete, or view details.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusTabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setStatusFilter(tab.value)}
                        className={`rounded-md px-4 py-2 text-sm font-bold transition ${
                          statusFilter === tab.value
                            ? "bg-teal-700 text-white shadow-sm dark:bg-teal-500 dark:text-slate-950"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {message && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 px-5 py-4 text-sm font-semibold text-teal-900 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-100">
                  {message}
                </div>
              )}

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                {loading ? (
                  <div className="grid gap-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="h-16 animate-pulse rounded-md bg-slate-100 dark:bg-slate-900" />
                    ))}
                  </div>
                ) : (
                  <HospitalTableView
                    hospitals={hospitals}
                    onApprove={handleApproveHospital}
                    onReject={handleRejectHospital}
                    onToggleActive={handleToggleActiveHospital}
                    onDelete={handleSoftDeleteHospital}
                    onRestore={handleRestoreHospital}
                    onViewDetails={setSelectedHospital}
                  />
                )}
              </section>
            </div>
          )}
        </div>
      </section>

      {selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={() => setSelectedHospital(null)}>
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            <HospitalDetails hospital={selectedHospital} onClose={() => setSelectedHospital(null)} />
          </div>
        </div>
      )}
    </main>
  );
};

export default SuperAdminDashBorad;
