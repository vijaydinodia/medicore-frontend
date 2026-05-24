import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import axiosInstance from "../api";
import AddDepartment from "../components/AddDepartment";
import AddDoctor from "../components/AddDoctor";
import AddLab from "../components/AddLab";
import AddSubDepartment from "../components/AddSubDepartment";
import AddTest from "../components/AddTest";
import SearchInput from "../components/SearchInput";
import { UseAuth } from "../custom_hook/useAuth";

const icons = {
  department: MenuRoundedIcon,
  subDepartment: GridViewRoundedIcon,
  doctor: PersonAddAltRoundedIcon,
  lab: ScienceRoundedIcon,
  test: ScienceRoundedIcon,
  refresh: AutorenewRoundedIcon,
  close: CloseRoundedIcon,
  hospital: LocalHospitalRoundedIcon,
  activity: MonitorHeartRoundedIcon,
  edit: EditRoundedIcon,
  archive: ArchiveRoundedIcon,
  restore: RestoreRoundedIcon,
  trash: DeleteRoundedIcon,
  calendar: CalendarMonthRoundedIcon,
  today: TodayRoundedIcon,
  reset: RestartAltRoundedIcon,
  medical: MedicalServicesRoundedIcon,
};

const Icon = ({ name, className = "h-5 w-5" }) => (
  icons[name] ? (() => {
    const Component = icons[name];
    return <Component className={className} aria-hidden="true" />;
  })() : null
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

const StatCard = ({ label, value, icon, helper }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-900">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
        {helper && <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">{helper}</p>}
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
      aria-label={typeof children === "string" ? children : props.title}
      title={typeof children === "string" ? children : props.title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
      {...props}
    >
      <Icon name={icon} className="h-4 w-4" />
      <span className="sr-only">{children}</span>
    </button>
  );
};

const IconButton = ({ icon, label, tone = "neutral", ...props }) => {
  const colors = {
    neutral: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800",
    warning: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
    danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition disabled:opacity-50 ${colors[tone]}`}
      {...props}
    >
      <Icon name={icon} className="h-4 w-4" />
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
const getToday = () => {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};
const formatSelectedDate = (dateValue) =>
  new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const reportTabs = [
  { id: "overview", label: "Overview" },
  { id: "labs-tests", label: "Labs & Tests" },
  { id: "today-patients", label: "Today Patients" },
  { id: "doctor-attendance", label: "Doctor Attendance" },
];

const HospitalDashborad = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = UseAuth();
  const hospitalId = getRecordId(currentUser?.hospitalId);
  const [activeForm, setActiveForm] = useState("");
  const [statsDate, setStatsDate] = useState(getToday());
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labs, setLabs] = useState([]);
  const [tests, setTests] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [actionId, setActionId] = useState("");
  const [patientStats, setPatientStats] = useState({
    todayPatients: 0,
    reachedPatients: 0,
    completedPatients: 0,
    doctorsAttended: 0,
    doctorStats: [],
    appointments: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientStatusFilter, setPatientStatusFilter] = useState("all");
  const [patientSortKey, setPatientSortKey] = useState("timeSlot");
  const [patientSortDirection, setPatientSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const hospital = {
    hospitalName: currentUser?.name || "Your Hospital",
    email: currentUser?.email || "",
    status: currentUser?.status || "approved",
    isActive: (currentUser?.status || "approved") !== "rejected",
  };

  const filteredDepartments = departments.filter((item) => getRecordId(item.hospitalId) === hospitalId);
  const filteredSubDepartments = subDepartments.filter((item) => getRecordId(item.hospitalId) === hospitalId);
  const filteredDoctors = doctors.filter((item) => getRecordId(item.hospitalId) === hospitalId);
  const filteredLabs = labs.filter((item) => getRecordId(item.hospitalId) === hospitalId);
  const filteredTests = tests.filter((item) => getRecordId(item.hospitalId) === hospitalId);

  const searchRecords = (items, keys) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      keys.some((key) => String(item[key] || "").toLowerCase().includes(query)),
    );
  };

  const visibleDepartments = searchRecords(filteredDepartments, ["departmentName", "departmentCode", "description", "status"]);
  const visibleSubDepartments = searchRecords(filteredSubDepartments, ["subDepartmentName", "subDepartmentCode", "description", "status"]);
  const visibleDoctors = searchRecords(filteredDoctors, ["doctorName", "doctorCode", "email", "specialization", "qualification", "status"]);
  const visibleLabs = searchRecords(filteredLabs, ["labName", "labCode", "email", "phone", "inChargeName", "status"]);
  const visibleTests = searchRecords(filteredTests, ["testName", "testCode", "category", "sampleType", "status"]);

  let statusTone = "warning";
  if (hospital.status === "approved") statusTone = "success";
  if (hospital.status === "rejected") statusTone = "danger";

  const loadDashboard = async () => {
    if (!hospitalId) {
      setMessage("Hospital id is not available for this account. Please login with an approved hospital account.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const departmentRes = await axiosInstance.get("/department/getAllDepartments");
      const subDepartmentRes = await axiosInstance.get("/sub-department/getAllSubDepartments");
      const doctorRes = await axiosInstance.get("/doctor/getAllDoctors");
      const labRes = await axiosInstance.get("/lab/getAllLabs");
      const testRes = await axiosInstance.get("/test/getAllTests?includeDeleted=true");
      const patientStatsRes = await axiosInstance.get(`/appointment/hospitalStats?date=${encodeURIComponent(statsDate || getToday())}`);

      setDepartments(departmentRes.data.data || []);
      setSubDepartments(subDepartmentRes.data.data || []);
      setDoctors(doctorRes.data.data || []);
      setLabs(labRes.data.data || []);
      setTests(testRes.data.data || []);
      setPatientStats(patientStatsRes.data.data || {});
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load hospital dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [hospitalId, statsDate]);

  const closeForm = () => {
    setActiveForm("");
    setEditingTest(null);
  };
  const afterCreate = () => {
    loadDashboard();
  };

  const runTestAction = async (test, action) => {
    const confirmMessage = {
      softDelete: "Move this test to deleted list?",
      restore: "Restore this test?",
      hardDelete: "Permanently delete this test?",
    };

    if (!window.confirm(confirmMessage[action])) return;

    const urls = {
      softDelete: `/test/softDeleteTest/${test._id}`,
      restore: `/test/restoreTest/${test._id}`,
      hardDelete: `/test/hardDeleteTest/${test._id}`,
    };

    try {
      setActionId(test._id);
      setMessage("");
      const method = action === "hardDelete" ? "delete" : "patch";
      const res = await axiosInstance[method](urls[action]);
      setMessage(res.data.message || "Test action completed.");
      await loadDashboard();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update test.");
    } finally {
      setActionId("");
    }
  };

  const openEditTest = (test) => {
    setEditingTest(test);
    setActiveForm("editTest");
  };

  const afterUpdateTest = async () => {
    setEditingTest(null);
    setActiveForm("");
    await loadDashboard();
  };

  const canAddNestedRecords = filteredDepartments.length > 0;
  const canAddTest = filteredLabs.length > 0;
  const tabFromUrl = new URLSearchParams(location.search).get("tab");
  const activeReportTab = reportTabs.some((tab) => tab.id === tabFromUrl) ? tabFromUrl : "overview";
  const workspaceNavItems = [
    { id: "overview", label: "Overview", icon: "hospital" },
    { id: "labs-tests", label: "Labs & Tests", icon: "lab" },
    { id: "today-patients", label: "Today Patients", icon: "activity" },
    { id: "doctor-attendance", label: "Doctor Attendance", icon: "doctor" },
  ];
  const openReportTab = (tabId) => {
    navigate(`/hospital/dashboard?tab=${tabId}`);
  };
  const isPatientTab = activeReportTab === "today-patients" || activeReportTab === "doctor-attendance";
  const isSetupTab = activeReportTab === "overview" || activeReportTab === "labs-tests";
  const currentDate = getToday();
  const isCurrentDate = statsDate === currentDate;
  const selectedDateLabel = formatSelectedDate(statsDate || currentDate);
  const addActionItems = [
    { id: "department", label: "Add department", icon: "department", disabled: false, title: "Add department" },
    { id: "subDepartment", label: "Add subdepartment", icon: "subDepartment", disabled: !canAddNestedRecords, title: !canAddNestedRecords ? "Add a department first" : "Add subdepartment" },
    { id: "doctor", label: "Add doctor", icon: "doctor", disabled: !canAddNestedRecords, title: !canAddNestedRecords ? "Add a department first" : "Add doctor" },
    { id: "lab", label: "Add lab", icon: "lab", disabled: false, title: "Add lab" },
    { id: "test", label: "Add test", icon: "test", disabled: !canAddTest, title: !canAddTest ? "Add a lab first" : "Add test" },
  ];
  const patientSearch = patientSearchTerm.trim().toLowerCase();
  const visiblePatientAppointments = (patientStats.appointments || [])
    .filter((appointment) => {
      const statusMatch =
        patientStatusFilter === "all" ||
        appointment.status === patientStatusFilter ||
        (patientStatusFilter === "reached" && appointment.isReached);

      if (!statusMatch) return false;
      if (!patientSearch) return true;

      const values = [
        appointment.userId?.name,
        appointment.userId?.email,
        appointment.userId?.phone,
        appointment.doctorId?.doctorName,
        appointment.doctorId?.specialization,
        appointment.timeSlot,
        appointment.status,
      ];
      return values.some((value) => String(value || "").toLowerCase().includes(patientSearch));
    })
    .sort((a, b) => {
      const getValue = (appointment) => {
        if (patientSortKey === "patient") return appointment.userId?.name || "";
        if (patientSortKey === "doctor") return appointment.doctorId?.doctorName || "";
        return appointment[patientSortKey] || "";
      };

      return String(getValue(a)).localeCompare(String(getValue(b)), undefined, { numeric: true }) * (patientSortDirection === "asc" ? 1 : -1);
    });
  const visibleDoctorStats = (patientStats.doctorStats || [])
    .filter((doctor) => {
      if (!patientSearch) return true;
      return [doctor.doctorName, doctor.specialization, doctor.attendedPatients].some((value) =>
        String(value || "").toLowerCase().includes(patientSearch),
      );
    })
    .sort((a, b) => {
      const aValue = patientSortKey === "doctor" ? a.doctorName : a.attendedPatients;
      const bValue = patientSortKey === "doctor" ? b.doctorName : b.attendedPatients;
      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * (patientSortDirection === "asc" ? 1 : -1);
    });
  const changePatientSort = (key) => {
    if (patientSortKey === key) {
      setPatientSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setPatientSortKey(key);
    setPatientSortDirection("asc");
  };
  const resetPatientFilters = () => {
    setStatsDate(getToday());
    setPatientStatusFilter("all");
    setPatientSearchTerm("");
    setPatientSortKey("timeSlot");
    setPatientSortDirection("asc");
  };
  const sortButtonClass = (key) =>
    `inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
      patientSortKey === key
        ? "border-teal-500 bg-teal-500 text-slate-950 shadow-sm shadow-teal-900/10"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
    }`;
  const sortIcon = {
    timeSlot: "calendar",
    patient: "hospital",
    doctor: "doctor",
    status: "activity",
  };

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 text-left dark:bg-slate-950">
      <aside className="fixed bottom-0 left-0 top-[73px] z-20 hidden w-72 border-r border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950">
            <Icon name="hospital" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight">{hospital.hospitalName}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Hospital Admin</p>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {workspaceNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openReportTab(item.id)}
              aria-label={item.label}
              title={item.label}
              className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-bold transition ${
                activeReportTab === item.id
                  ? "bg-teal-700 text-white shadow-lg shadow-teal-900/10 dark:bg-teal-500 dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Quick add</p>
          <div className="mt-3 space-y-2">
            {addActionItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveForm(item.id)}
                disabled={item.disabled}
                title={item.title}
                aria-label={item.label}
                className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${
                  item.id === "department"
                    ? "bg-teal-700 text-white shadow-sm shadow-teal-900/10 hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Live counts</p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <div className="rounded-md bg-white p-2 dark:bg-slate-950">
              <p className="text-lg font-black">{filteredDepartments.length}</p>
              <p className="text-xs text-slate-500">Dept</p>
            </div>
            <div className="rounded-md bg-white p-2 dark:bg-slate-950">
              <p className="text-lg font-black">{filteredSubDepartments.length}</p>
              <p className="text-xs text-slate-500">Units</p>
            </div>
            <div className="rounded-md bg-white p-2 dark:bg-slate-950">
              <p className="text-lg font-black">{filteredDoctors.length}</p>
              <p className="text-xs text-slate-500">Doctors</p>
            </div>
            <div className="rounded-md bg-white p-2 dark:bg-slate-950">
              <p className="text-lg font-black">{filteredLabs.length}</p>
              <p className="text-xs text-slate-500">Labs</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-[73px] z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6 xl:px-8">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Hospital workspace</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Hospital Dashboard</h1>
                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600 dark:text-slate-300">
                  Manage departments, subdepartments, doctors, and daily hospital setup from one focused workspace.
                </p>
              </div>

              <button type="button" onClick={loadDashboard} aria-label="Refresh dashboard" title="Refresh dashboard" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                <Icon name="refresh" className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_auto] xl:items-center">
              <div className={`grid gap-3 ${isPatientTab ? "md:grid-cols-[minmax(240px,1fr)_170px] xl:grid-cols-[minmax(260px,1fr)_170px]" : ""}`}>
                <SearchInput
                  value={isSetupTab ? searchTerm : patientSearchTerm}
                  onChange={isSetupTab ? setSearchTerm : setPatientSearchTerm}
                  placeholder={isSetupTab ? "Search departments, doctors, labs, tests" : "Search patients or doctors"}
                  className="w-full"
                />
                {isPatientTab && (
                  <select
                    value={patientStatusFilter}
                    onChange={(event) => setPatientStatusFilter(event.target.value)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="all">All status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="reached">Reached</option>
                  </select>
                )}
              </div>

              {isPatientTab && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:justify-end">
                  <label className="relative block min-w-[190px]">
                    <span className="sr-only">Patient stats date</span>
                    <Icon name="calendar" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={statsDate}
                      onChange={(event) => setStatsDate(event.target.value || getToday())}
                      max="9999-12-31"
                      className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-teal-950"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setStatsDate(getToday())}
                    disabled={isCurrentDate}
                    aria-label="Today"
                    title="Today"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    <Icon name="today" className="h-4 w-4" />
                    <span className="sr-only">Today</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
                {workspaceNavItems.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => openReportTab(tab.id)}
                    aria-label={tab.label}
                    title={tab.label}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition ${
                      activeReportTab === tab.id
                        ? "bg-teal-700 text-white shadow-sm dark:bg-teal-400 dark:text-slate-950"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon name={tab.icon} className="h-4 w-4" />
                    <span className="sr-only">{tab.label}</span>
                  </button>
                ))}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 xl:px-8">

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        {activeReportTab === "overview" && (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Departments" value={visibleDepartments.length} icon="department" />
              <StatCard label="Subdepartments" value={visibleSubDepartments.length} icon="subDepartment" />
              <StatCard label="Doctors" value={visibleDoctors.length} icon="doctor" />
              <StatCard label="Labs" value={visibleLabs.length} icon="lab" />
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

                <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">Labs</h2>
                    <Pill tone={statusTone}>{hospital.status}</Pill>
                  </div>
                  <div className="mt-5 space-y-3">
                    {visibleLabs.slice(0, 5).map((lab) => (
                      <div key={lab._id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-950 dark:text-white">{lab.labName}</p>
                            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{lab.email || lab.phone}</p>
                          </div>
                          <Pill tone={lab.status === "active" ? "success" : "warning"}>{lab.status}</Pill>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{lab.labCode}</span>
                          <span>{lab.cityId?.cityName || "City"}</span>
                        </div>
                      </div>
                    ))}
                    {!loading && visibleLabs.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        {searchTerm ? "No labs match your search." : "No labs added yet."}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">Tests</h2>
                    <Pill tone="neutral">{visibleTests.length}</Pill>
                  </div>
                  <div className="mt-5 space-y-3">
                    {visibleTests.slice(0, 8).map((test) => (
                      <div key={test._id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-950 dark:text-white">{test.testName}</p>
                            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                              {test.testCode} | {test.labId?.labName || "Lab"} | Rs. {test.amount || 0}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Pill tone={!test.isDeleted && test.status === "active" ? "success" : "warning"}>
                              {test.isDeleted ? "deleted" : test.status}
                            </Pill>
                            {!test.isDeleted && (
                              <>
                                <IconButton icon="edit" label="Edit test" onClick={() => openEditTest(test)} />
                                <IconButton icon="archive" label="Soft delete test" tone="warning" disabled={actionId === test._id} onClick={() => runTestAction(test, "softDelete")} />
                              </>
                            )}
                            {test.isDeleted && (
                              <IconButton icon="restore" label="Restore test" tone="success" disabled={actionId === test._id} onClick={() => runTestAction(test, "restore")} />
                            )}
                            <IconButton icon="trash" label="Delete test permanently" tone="danger" disabled={actionId === test._id} onClick={() => runTestAction(test, "hardDelete")} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!loading && visibleTests.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        {searchTerm ? "No tests match your search." : "No tests added yet."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeReportTab === "labs-tests" && (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Labs" value={visibleLabs.length} icon="lab" />
              <StatCard label="Tests" value={visibleTests.length} icon="test" />
              <StatCard label="Active tests" value={visibleTests.filter((test) => !test.isDeleted && test.status === "active").length} icon="activity" />
              <StatCard label="Deleted tests" value={visibleTests.filter((test) => test.isDeleted).length} icon="archive" />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">Labs</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hospital labs available for test setup.</p>
                  </div>
                  <ActionButton icon="lab" onClick={() => setActiveForm("lab")}>Add lab</ActionButton>
                </div>

                <div className="mt-5 space-y-3">
                  {visibleLabs.map((lab) => (
                    <div key={lab._id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950 dark:text-white">{lab.labName}</p>
                          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{lab.email || lab.phone}</p>
                        </div>
                        <Pill tone={lab.status === "active" ? "success" : "warning"}>{lab.status}</Pill>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{lab.labCode}</span>
                        <span>{lab.cityId?.cityName || "City"}</span>
                      </div>
                    </div>
                  ))}
                  {!loading && visibleLabs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      {searchTerm ? "No labs match your search." : "No labs added yet."}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">Lab Tests</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create, update, soft delete, restore, and permanently delete tests.</p>
                  </div>
                  <ActionButton icon="test" onClick={() => setActiveForm("test")} disabled={!canAddTest} title={!canAddTest ? "Add a lab first" : "Add test"}>
                    Add test
                  </ActionButton>
                </div>

                <div className="mt-5 space-y-3">
                  {visibleTests.map((test) => (
                    <div key={test._id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950 dark:text-white">{test.testName}</p>
                          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                            {test.testCode} | {test.labId?.labName || "Lab"} | Rs. {test.amount || 0}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill tone={!test.isDeleted && test.status === "active" ? "success" : "warning"}>
                            {test.isDeleted ? "deleted" : test.status}
                          </Pill>
                          {!test.isDeleted && (
                            <>
                              <IconButton icon="edit" label="Edit test" onClick={() => openEditTest(test)} />
                              <IconButton icon="archive" label="Soft delete test" tone="warning" disabled={actionId === test._id} onClick={() => runTestAction(test, "softDelete")} />
                            </>
                          )}
                          {test.isDeleted && (
                            <IconButton icon="restore" label="Restore test" tone="success" disabled={actionId === test._id} onClick={() => runTestAction(test, "restore")} />
                          )}
                          <IconButton icon="trash" label="Delete test permanently" tone="danger" disabled={actionId === test._id} onClick={() => runTestAction(test, "hardDelete")} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loading && visibleTests.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      {searchTerm ? "No tests match your search." : "No tests added yet."}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {isPatientTab && (
          <>
            <section className="mt-6 rounded-lg border border-teal-100 bg-teal-50/70 p-5 shadow-sm dark:border-teal-900/70 dark:bg-teal-950/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-600 text-white dark:bg-teal-400 dark:text-slate-950">
                    <Icon name="calendar" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
                      {isCurrentDate ? "Viewing today" : "Viewing selected date"}
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{selectedDateLabel}</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Patient counts, attendance, and doctor stats are filtered for this calendar date.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetPatientFilters}
                  aria-label="Reset filters"
                  title="Reset filters"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-teal-200 bg-white text-teal-800 transition hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-950 dark:text-teal-200 dark:hover:bg-teal-950/40"
                >
                  <Icon name="reset" className="h-4 w-4" />
                  <span className="sr-only">Reset filters</span>
                </button>
              </div>
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label={isCurrentDate ? "Patients today" : "Patients booked"} value={patientStats.todayPatients || 0} icon="activity" helper={selectedDateLabel} />
              <StatCard label="Patients reached" value={patientStats.reachedPatients || 0} icon="activity" helper="Marked by doctors" />
              <StatCard label="Completed visits" value={patientStats.completedPatients || 0} icon="activity" helper="Medicine/report completed" />
              <StatCard label="Doctors attended" value={patientStats.doctorsAttended || 0} icon="medical" helper="With reached patients" />
            </section>

            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">Sort patient view</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {patientSortDirection === "asc" ? "Ascending" : "Descending"} by {patientSortKey === "timeSlot" ? "time" : patientSortKey}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["timeSlot", "patient", "doctor", "status"].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => changePatientSort(key)}
                      className={sortButtonClass(key)}
                      aria-label={`Sort by ${key === "timeSlot" ? "time" : key}`}
                      title={`Sort by ${key === "timeSlot" ? "time" : key}`}
                    >
                      <Icon name={sortIcon[key]} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6">
              {activeReportTab === "doctor-attendance" && (
                <div id="doctor-attendance" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Doctor attendance</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Reached patients by doctor for the selected day.</p>
                  <div className="mt-5 space-y-3">
                    {visibleDoctorStats.map((doctor) => (
                      <div key={doctor.doctorId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950 dark:text-white">{doctor.doctorName}</p>
                          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{doctor.specialization || "Doctor"}</p>
                        </div>
                        <Pill tone="success">{doctor.attendedPatients} patient(s)</Pill>
                      </div>
                    ))}
                    {!loading && visibleDoctorStats.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        No doctor has marked a patient reached for this day.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeReportTab === "today-patients" && (
                <div id="today-patients" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">{isCurrentDate ? "Today patient list" : "Patient list"}</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Booked patients and attendance status for {selectedDateLabel}.</p>
                    </div>
                    <Pill tone="neutral">{visiblePatientAppointments.length} visible</Pill>
                  </div>
                  <div className="mt-5 space-y-3">
                    {visiblePatientAppointments.slice(0, 8).map((appointment) => (
                      <div key={appointment._id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1fr_auto] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-950 dark:text-white">{appointment.userId?.name || "Patient"}</p>
                          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{appointment.timeSlot || "-"}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{appointment.doctorId?.doctorName || "Doctor"}</p>
                          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{appointment.doctorId?.specialization || ""}</p>
                        </div>
                        <Pill tone={appointment.isReached ? "success" : "warning"}>{appointment.isReached ? "Reached" : appointment.status}</Pill>
                      </div>
                    ))}
                    {!loading && visiblePatientAppointments.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
                        <Icon name="calendar" className="mx-auto h-8 w-8 text-slate-400" />
                        <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No patients booked for {selectedDateLabel}.</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Change the date, status, or search text to check another view.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
        </div>
      </section>

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

      {activeForm === "lab" && (
        <Modal title="Add lab" subtitle="Create a lab account and send credentials by email." onClose={closeForm}>
          <AddLab onCreated={afterCreate} />
        </Modal>
      )}

      {activeForm === "test" && (
        <Modal title="Add test" subtitle="Create a test under one of your hospital labs." onClose={closeForm}>
          <AddTest labs={filteredLabs} onCreated={afterCreate} />
        </Modal>
      )}

      {activeForm === "editTest" && editingTest && (
        <Modal title="Update test" subtitle="Change test details, fees, lab, or status." onClose={closeForm}>
          <AddTest labs={filteredLabs} editTest={editingTest} onUpdated={afterUpdateTest} />
        </Modal>
      )}
    </main>
  );
};

export default HospitalDashborad;
