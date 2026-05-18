import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api";
import AddDepartment from "../components/AddDepartment";
import AddDoctor from "../components/AddDoctor";
import AddSubDepartment from "../components/AddSubDepartment";
import SearchInput from "../components/SearchInput";
import { useAuth } from "../custom_hook/useAuth";

const paths = {
  department: "M4 5h16M4 12h16M4 19h16",
  subDepartment: "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
  doctor: "M12 14a5 5 0 100-10 5 5 0 000 10zM4 21a8 8 0 0116 0M19 8h3M20.5 6.5v3",
  refresh: "M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0012 3M19 9A7 7 0 007 6",
  close: "M6 18L18 6M6 6l12 12",
  hospital: "M4 20V7l8-4 8 4v13M8 20v-8h8v8M3 20h18",
  activity: "M22 12h-4l-3 8-6-16-3 8H2",
};

const Icon = ({ name, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
  </svg>
);

const Pill = ({ children, tone = "neutral" }) => {
  const tones = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  };

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tones[tone]}`}>{children}</span>;
};

const StatCard = ({ label, value, icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
      </div>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
        <Icon name={icon} />
      </span>
    </div>
  </div>
);

const ActionButton = ({ icon, children, variant = "primary", ...props }) => {
  const variants = {
    primary: "border-teal-700 bg-teal-700 text-white hover:bg-teal-800 dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400",
    neutral: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",
  };

  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
      {...props}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
};

const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
    <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close form" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </header>
      <div className="p-6">{children}</div>
    </section>
  </div>
);

const getRecordId = (value) => value?._id || value || "";
const getDoctorImage = (doctor) => doctor.profileImage || doctor.doctorImage?.profileImage || "";

const HospitalDashborad = () => {
  const { user: currentUser } = useAuth();
  const hospitalId = getRecordId(currentUser?.hospitalId);
  const [activeForm, setActiveForm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const hospital = useMemo(
    () => ({
      hospitalName: currentUser?.name || "Your Hospital",
      email: currentUser?.email || "",
      status: currentUser?.status || "approved",
      isActive: (currentUser?.status || "approved") !== "rejected",
    }),
    [currentUser],
  );

  const filteredDepartments = useMemo(
    () => departments.filter((item) => getRecordId(item.hospitalId) === hospitalId),
    [departments, hospitalId],
  );

  const filteredSubDepartments = useMemo(
    () => subDepartments.filter((item) => getRecordId(item.hospitalId) === hospitalId),
    [subDepartments, hospitalId],
  );

  const filteredDoctors = useMemo(
    () => doctors.filter((item) => getRecordId(item.hospitalId) === hospitalId),
    [doctors, hospitalId],
  );

  const searchRecords = (items, keys) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      keys.some((key) => String(item[key] || "").toLowerCase().includes(query)),
    );
  };

  const visibleDepartments = useMemo(
    () => searchRecords(filteredDepartments, ["departmentName", "departmentCode", "description", "status"]),
    [filteredDepartments, searchTerm],
  );

  const visibleSubDepartments = useMemo(
    () => searchRecords(filteredSubDepartments, ["subDepartmentName", "subDepartmentCode", "description", "status"]),
    [filteredSubDepartments, searchTerm],
  );

  const visibleDoctors = useMemo(
    () => searchRecords(filteredDoctors, ["doctorName", "doctorCode", "email", "specialization", "qualification", "status"]),
    [filteredDoctors, searchTerm],
  );

  const statusTone = useMemo(() => {
    if (hospital.status === "approved") return "success";
    if (hospital.status === "rejected") return "danger";
    return "warning";
  }, [hospital.status]);

  const loadDashboard = async () => {
    if (!hospitalId) {
      setMessage("Hospital id is not available for this account. Please login with an approved hospital account.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const [departmentRes, subDepartmentRes, doctorRes] = await Promise.all([
        axiosInstance.get("/department/getAllDepartments"),
        axiosInstance.get("/sub-department/getAllSubDepartments"),
        axiosInstance.get("/doctor/getAllDoctors"),
      ]);

      setDepartments(departmentRes.data.data || []);
      setSubDepartments(subDepartmentRes.data.data || []);
      setDoctors(doctorRes.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load hospital dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [hospitalId]);

  const closeForm = () => setActiveForm("");
  const afterCreate = () => {
    loadDashboard();
  };

  const canAddNestedRecords = filteredDepartments.length > 0;

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-slate-800 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Hospital workspace</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Hospital Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Manage departments, subdepartments, doctors, and daily hospital setup from one focused workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton icon="department" onClick={() => setActiveForm("department")}>Add department</ActionButton>
            <ActionButton
              icon="subDepartment"
              onClick={() => setActiveForm("subDepartment")}
              variant="neutral"
              disabled={!canAddNestedRecords}
              title={!canAddNestedRecords ? "Add a department first" : "Add subdepartment"}
            >
              Add subdepartment
            </ActionButton>
            <ActionButton
              icon="doctor"
              onClick={() => setActiveForm("doctor")}
              variant="neutral"
              disabled={!canAddNestedRecords}
              title={!canAddNestedRecords ? "Add a department first" : "Add doctor"}
            >
              Add doctor
            </ActionButton>
            <button type="button" onClick={loadDashboard} aria-label="Refresh dashboard" title="Refresh dashboard" className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
              <Icon name="refresh" className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="mt-6">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search departments, subdepartments, or doctors"
            className="max-w-xl"
          />
        </section>

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Departments" value={visibleDepartments.length} icon="department" />
          <StatCard label="Subdepartments" value={visibleSubDepartments.length} icon="subDepartment" />
          <StatCard label="Doctors" value={visibleDoctors.length} icon="doctor" />
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                <div className="mt-3"><Pill tone={statusTone}>{hospital.status}</Pill></div>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
                <Icon name="activity" />
              </span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">{hospital.hospitalName}</h2>
                <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">{hospital.email || "No email available"}</p>
              </div>
              <Pill tone={hospital.isActive ? "success" : "warning"}>{hospital.isActive ? "Active" : "Inactive"}</Pill>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {visibleDepartments.slice(0, 6).map((department) => (
                <div key={department._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-bold text-slate-950 dark:text-white">{department.departmentName}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{department.departmentCode}</p>
                </div>
              ))}
              {!loading && visibleDepartments.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-3">
                  {searchTerm ? "No departments match your search." : "No departments yet. Start by adding your first department."}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Subdepartments</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {visibleSubDepartments.slice(0, 4).map((subDepartment) => (
                  <div key={subDepartment._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="font-bold text-slate-950 dark:text-white">{subDepartment.subDepartmentName}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subDepartment.subDepartmentCode}</p>
                  </div>
                ))}
                {!loading && visibleSubDepartments.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2">
                    {searchTerm ? "No subdepartments match your search." : "No subdepartments added yet."}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Doctors roster</h2>
            <div className="mt-5 space-y-3">
              {visibleDoctors.slice(0, 5).map((doctor) => (
                <div key={doctor._id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-700 text-sm font-black text-white dark:bg-teal-500 dark:text-slate-950">
                      {getDoctorImage(doctor) ? (
                        <img src={getDoctorImage(doctor)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (doctor.doctorName || "D").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950 dark:text-white">{doctor.doctorName}</p>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{doctor.specialization}</p>
                    </div>
                  </div>
                  <Pill tone={doctor.status === "active" ? "success" : "warning"}>{doctor.status}</Pill>
                </div>
              ))}
              {!loading && visibleDoctors.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  {searchTerm ? "No doctors match your search." : "No doctors added yet."}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {activeForm === "department" && (
        <Modal title="Add department" subtitle="Create a primary clinical or operational department." onClose={closeForm}>
          <AddDepartment hospitalId={hospitalId} onCreated={afterCreate} />
        </Modal>
      )}

      {activeForm === "subDepartment" && (
        <Modal title="Add subdepartment" subtitle="Create a unit under an existing department." onClose={closeForm}>
          <AddSubDepartment hospitalId={hospitalId} departments={filteredDepartments} onCreated={afterCreate} />
        </Modal>
      )}

      {activeForm === "doctor" && (
        <Modal title="Add doctor" subtitle="Create a doctor profile and send account credentials by email." onClose={closeForm}>
          <AddDoctor hospitalId={hospitalId} departments={filteredDepartments} subDepartments={filteredSubDepartments} onCreated={afterCreate} />
        </Modal>
      )}
    </main>
  );
};

export default HospitalDashborad;
