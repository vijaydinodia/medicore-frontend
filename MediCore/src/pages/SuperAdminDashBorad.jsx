import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
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

const SuperAdminDashBorad = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState("hospital");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchHospitals = async () => {
    setLoading(true);
    setMessage("");
    try {
      let endpoint = "/super-admin/hospitals/all";

      if (statusFilter === "active") {
        endpoint = "/super-admin/hospitals/active";
      }
      if (statusFilter === "inactive") {
        endpoint = "/super-admin/hospitals/inactive";
      }
      if (statusFilter === "deleted") {
        endpoint = "/super-admin/hospitals/deleted";
      }

      const response = await axiosInstance.get(endpoint);
      setHospitals(response.data.data || []);
    } catch (error) {
      setMessage("Unable to load hospitals. Refresh page.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHospitals();
  }, [statusFilter]);

  const handleApproveHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(`/super-admin/approveHospital/${hospitalId}`);
      setMessage("Hospital approved successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) {
        setSelectedHospital((prev) => ({ ...prev, status: "approved" }));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Approve failed.");
    }
  };

  const handleRejectHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(`/super-admin/rejectHospital/${hospitalId}`);
      setMessage("Hospital rejected successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) {
        setSelectedHospital((prev) => ({ ...prev, status: "rejected" }));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Reject failed.");
    }
  };

  const handleSoftDeleteHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(
        `/super-admin/hospitals/${hospitalId}/soft-delete`,
      );
      setMessage("Hospital soft deleted successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) {
        setSelectedHospital((prev) => ({ ...prev, isDeleted: true }));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Delete failed.");
    }
  };

  const handleRestoreHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(`/super-admin/hospitals/${hospitalId}/restore`);
      setMessage("Hospital restored successfully.");
      fetchHospitals();
      if (selectedHospital?._id === hospitalId) {
        setSelectedHospital((prev) => ({ ...prev, isDeleted: false }));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Restore failed.");
    }
  };

  const handleToggleActiveHospital = async (hospitalId) => {
    try {
      await axiosInstance.patch(
        `/super-admin/hospitals/${hospitalId}/toggle-active`,
      );
      setMessage("Hospital status updated successfully.");
      fetchHospitals();
    } catch (error) {
      setMessage(error.response?.data?.message || "Status update failed.");
    }
  };

  const handleViewDetails = (hospital) => {
    setSelectedHospital(hospital);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && selectedHospital) {
        setSelectedHospital(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedHospital]);

  return (
    <main className="min-h-screen bg-slate-100 text-left dark:bg-slate-900 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-slate-950 text-white lg:block dark:border-slate-700">
        <div className="mb-8">
          <p className="text-2xl font-bold tracking-tight">MediCore</p>
          <p className="mt-1 text-sm text-slate-400">Super Admin Console</p>
        </div>

        <nav className="space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Menu
          </p>
          <button
            type="button"
            onClick={() => setActiveMenu("location")}
            className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
              activeMenu === "location"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>Add Location</span>
            <span className="text-xs opacity-70">01</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMenu("hospital")}
            className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-semibold transition ${
              activeMenu === "hospital"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <span>Hospital Requests</span>
            <span className="text-xs opacity-70">02</span>
          </button>
        </nav>

        <div className="absolute bottom-20 left-4 right-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-700 px-3 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="absolute bottom-5 left-4 right-4 rounded-md border border-slate-700 px-3 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-200"
        >
          Logout
        </button>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 xl:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                  Super Admin
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {activeMenu === "hospital"
                    ? "Hospital Management"
                    : "Location Management"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {user.name
                    ? `Signed in as ${user.name}`
                    : activeMenu === "hospital"
                      ? "Manage hospital approvals and review registration details."
                      : "Create and review state, district, and city records."}
                </p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Current Action
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {activeMenu === "hospital"
                    ? "Hospital Management"
                    : "Add Location"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto lg:hidden">
              <button
                type="button"
                onClick={() => setActiveMenu("location")}
                className={`min-w-32 rounded-md px-4 py-2 text-sm font-semibold transition ${
                  activeMenu === "location"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                Add Location
              </button>
              <button
                type="button"
                onClick={() => setActiveMenu("hospital")}
                className={`min-w-32 rounded-md px-4 py-2 text-sm font-semibold transition ${
                  activeMenu === "hospital"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                Hospitals
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 xl:px-8">
          {activeMenu === "location" && <AddLocation />}

          {activeMenu === "hospital" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Hospital Management
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">
                      Hospital Requests
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Review hospitals, manage active/inactive records, and
                      restore soft-deleted entries.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    {statusTabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setStatusFilter(tab.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          statusFilter === tab.value
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {message && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-slate-900">
                  {message}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <HospitalTableView
                      hospitals={hospitals}
                      onApprove={handleApproveHospital}
                      onReject={handleRejectHospital}
                      onToggleActive={handleToggleActiveHospital}
                      onDelete={handleSoftDeleteHospital}
                      onRestore={handleRestoreHospital}
                      onViewDetails={handleViewDetails}
                    />
                  </div>

                  {selectedHospital && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
                      onClick={() => setSelectedHospital(null)}
                    >
                      <div
                        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HospitalDetails
                          hospital={selectedHospital}
                          onClose={() => setSelectedHospital(null)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-950">
                      Quick stats
                    </h3>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 px-4 py-5">
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          {
                            hospitals.filter(
                              (item) => item.status === "pending",
                            ).length
                          }
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 px-4 py-5">
                        <p className="text-sm text-slate-500">Approved</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          {
                            hospitals.filter(
                              (item) => item.status === "approved",
                            ).length
                          }
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 px-4 py-5">
                        <p className="text-sm text-slate-500">Rejected</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          {
                            hospitals.filter(
                              (item) => item.status === "rejected",
                            ).length
                          }
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 px-4 py-5">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          {hospitals.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default SuperAdminDashBorad;
