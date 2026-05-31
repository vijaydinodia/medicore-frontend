import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import axiosInstance from "../api";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import { UsePagination } from "../custom_hook/UsePagination";
import { getAuthInfo } from "../custom_hook/useAuth";

const AppointmentModal = lazy(() => import("../components/AppointmentModal"));

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const getId = (value) => {
  if (!value) return "";
  return value._id || value;
};

const getHospitalPhoto = (hospital) => {
  if (hospital.logo) return hospital.logo;
  const firstImage = (hospital.images || []).find((item) => item?.url);
  return firstImage?.url || "";
};

const getDoctorPhoto = (doctor) => {
  return doctor.profileImage || doctor.doctorImage?.profileImage || doctor.doctorImage?.url || "";
};

const getHistoryDoctorId = (appointment) => getId(appointment.doctorId) || "unknown-doctor";

const getTestPhoto = (test) => {
  if (test.labId?.logo) return test.labId.logo;
  if (test.hospitalId?.logo) return test.hospitalId.logo;
  const firstImage = (test.hospitalId?.images || []).find((item) => item?.url);
  return firstImage?.url || "";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusBadgeClass = (status = "pending") => {
  const tones = {
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    confirmed: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
    cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  };

  return `w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${tones[status] || tones.pending}`;
};

const getDateInputValue = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const formatDoctorTiming = (doctor) => {
  const days = (doctor.availableDays || []).join(", ");
  const start = doctor.availableTime?.startTime || "";
  const end = doctor.availableTime?.endTime || "";

  if (days && start && end) return `${days} | ${start} - ${end}`;
  if (start && end) return `${start} - ${end}`;
  if (days) return days;
  return "Timing not available";
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = getAuthInfo();

  const [activeTab, setActiveTab] = useState("hospital");
  const [searchText, setSearchText] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [historySortDirection, setHistorySortDirection] = useState("desc");
  const [historyDate, setHistoryDate] = useState("");
  const [selectedHistoryDoctorId, setSelectedHistoryDoctorId] = useState("");
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [hospitalPage, setHospitalPage] = useState(1);
  const [hospitalLimit] = useState(6);
  const [hospitalTotalPages, setHospitalTotalPages] = useState(1);
  const [hospitalTotalRecords, setHospitalTotalRecords] = useState(0);

  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cancelId, setCancelId] = useState("");

  const canUsePatientActions = isAuthenticated && user?.role === "user";

  const loadAppointments = async () => {
    if (!canUsePatientActions) {
      setAppointments([]);
      return;
    }

    const response = await axiosInstance.get("/appointment/myAppointments");
    setAppointments(response.data.data || []);
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const hospitalResult = await axiosInstance.get(
        `/hospital/getAllHospital?page=${hospitalPage}&limit=${hospitalLimit}`,
      );
      const doctorResult = await axiosInstance.get("/doctor/getAllDoctors");
      const departmentResult = await axiosInstance.get("/department/getAllDepartments");
      setHospitals(hospitalResult.data.data || []);
      setHospitalTotalPages(hospitalResult.data.totalPages || 1);
      setHospitalTotalRecords(hospitalResult.data.totalRecords || 0);
      setDoctors(doctorResult.data.data || []);
      setDepartments(departmentResult.data.data || []);

      if (isAuthenticated) {
        const testResult = await axiosInstance.get("/test/getAllTests");
        setTests(testResult.data.data || []);
      } else {
        setTests([]);
      }

      if (canUsePatientActions) {
        const appointmentResult = await axiosInstance.get("/appointment/myAppointments");
        setAppointments(appointmentResult.data.data || []);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [canUsePatientActions, hospitalPage]);

  useEffect(() => {
    const view = new URLSearchParams(location.search).get("view");

    if (view === "history" && canUsePatientActions) {
      setActiveTab("history");
      setSelectedHospitalId("");
      setSelectedDepartmentId("all");
    }
  }, [location.search, canUsePatientActions]);

  const activeHospitals = hospitals.filter((hospital) => {
    return !hospital.isDeleted && hospital.isActive !== false && hospital.status === "approved";
  });

  const activeHospitalIds = activeHospitals.map((hospital) => getId(hospital));

  const activeDoctors = doctors.filter((doctor) => {
    return doctor.status === "active" && activeHospitalIds.includes(getId(doctor.hospitalId));
  });

  const selectedHospital = activeHospitals.find((hospital) => getId(hospital) === selectedHospitalId);

  const getDepartmentCount = (hospitalId) => {
    return departments.filter((department) => {
      return getId(department.hospitalId) === hospitalId && department.status !== "inactive";
    }).length;
  };

  const getDoctorCount = (hospitalId) => {
    return activeDoctors.filter((doctor) => getId(doctor.hospitalId) === hospitalId).length;
  };

  const text = searchText.trim().toLowerCase();

  const visibleHospitals = activeHospitals.filter((hospital) => {
    if (!text) return true;
    const values = [
      hospital.hospitalName,
      hospital.address,
      hospital.cityId?.cityName,
      hospital.districtId?.districtName,
      hospital.stateId?.stateName,
      hospital.hospitalType,
    ];
    return values.some((value) => String(value || "").toLowerCase().includes(text));
  });

  const visibleDepartments = departments.filter((department) => {
    return (
      selectedHospitalId &&
      getId(department.hospitalId) === selectedHospitalId &&
      department.status !== "inactive"
    );
  });

  const visibleDoctors = activeDoctors.filter((doctor) => {
    const sameHospital = !selectedHospitalId || getId(doctor.hospitalId) === selectedHospitalId;
    const sameDepartment =
      selectedDepartmentId === "all" || getId(doctor.departmentId) === selectedDepartmentId;

    if (!sameHospital || !sameDepartment) return false;
    if (!text) return true;

    const values = [
      doctor.doctorName,
      doctor.qualification,
      doctor.specialization,
      doctor.hospitalId?.hospitalName,
      doctor.departmentId?.departmentName,
      (doctor.availableDays || []).join(" "),
    ];

    return values.some((value) => String(value || "").toLowerCase().includes(text));
  });

  const visibleAppointments = appointments.filter((appointment) => {
    if (historyStatusFilter !== "all" && appointment.status !== historyStatusFilter) return false;
    if (historyDate && getDateInputValue(appointment.date) !== historyDate) return false;
    if (selectedHistoryDoctorId && getHistoryDoctorId(appointment) !== selectedHistoryDoctorId) return false;
    if (!text) return true;

    const values = [
      appointment.doctorId?.doctorName,
      appointment.hospitalId?.hospitalName,
      appointment.timeSlot,
      appointment.status,
      formatDate(appointment.date),
    ];

    return values.some((value) => String(value || "").toLowerCase().includes(text));
  }).sort((a, b) => {
    const aDate = new Date(a.date || a.createdAt || 0).getTime();
    const bDate = new Date(b.date || b.createdAt || 0).getTime();
    return (aDate - bDate) * (historySortDirection === "asc" ? 1 : -1);
  });

  const historyDoctorGroups = appointments.reduce((groups, appointment) => {
    if (historyStatusFilter !== "all" && appointment.status !== historyStatusFilter) return groups;
    if (historyDate && getDateInputValue(appointment.date) !== historyDate) return groups;

    const doctorId = getHistoryDoctorId(appointment);
    const doctorName = appointment.doctorId?.doctorName || "Doctor not available";
    const hospitalName = appointment.hospitalId?.hospitalName || "Hospital not available";
    const group = groups[doctorId] || {
      doctorId,
      doctorName,
      specialization: appointment.doctorId?.specialization || "Doctor",
      hospitalNames: [],
      appointmentCount: 0,
      medicineCount: 0,
      reportCount: 0,
      latestDate: appointment.date || appointment.createdAt,
    };

    if (!group.hospitalNames.includes(hospitalName)) {
      group.hospitalNames.push(hospitalName);
    }

    group.appointmentCount += 1;
    if (appointment.medicine) group.medicineCount += 1;
    group.reportCount += (appointment.reports || []).length;

    const latestTime = new Date(group.latestDate || 0).getTime();
    const appointmentTime = new Date(appointment.date || appointment.createdAt || 0).getTime();
    if (appointmentTime > latestTime) {
      group.latestDate = appointment.date || appointment.createdAt;
    }

    groups[doctorId] = group;
    return groups;
  }, {});

  const visibleHistoryDoctorGroups = Object.values(historyDoctorGroups)
    .filter((group) => {
      if (!text) return true;
      const values = [
        group.doctorName,
        group.specialization,
        group.hospitalNames.join(" "),
        formatDate(group.latestDate),
      ];
      return values.some((value) => String(value || "").toLowerCase().includes(text));
    })
    .sort((a, b) => {
      const aDate = new Date(a.latestDate || 0).getTime();
      const bDate = new Date(b.latestDate || 0).getTime();
      return (aDate - bDate) * (historySortDirection === "asc" ? 1 : -1);
    });
  const selectedHistoryDoctor = selectedHistoryDoctorId ? historyDoctorGroups[selectedHistoryDoctorId] : null;

  const visibleTests = tests.filter((test) => {
    const activeTest = !test.isDeleted && test.status !== "inactive";
    const activeHospital = activeHospitalIds.includes(getId(test.hospitalId));

    if (!activeTest || !activeHospital) return false;
    if (!text) return true;

    const values = [
      test.testName,
      test.hospitalId?.hospitalName,
      test.labId?.labName,
      test.labId?.address,
      test.hospitalId?.address,
      test.amount,
    ];

    return values.some((value) => String(value || "").toLowerCase().includes(text));
  });

  const doctorPagination = UsePagination(visibleDoctors, {
    pageSize: 9,
    resetKeys: [searchText, selectedHospitalId, selectedDepartmentId, activeTab],
  });
  const testPagination = UsePagination(visibleTests, {
    pageSize: 9,
    resetKeys: [searchText, activeTab],
  });
  const historyGroupPagination = UsePagination(visibleHistoryDoctorGroups, {
    pageSize: 8,
    resetKeys: [searchText, historyDate, historyStatusFilter, selectedHistoryDoctorId, activeTab],
  });
  const historyAppointmentPagination = UsePagination(visibleAppointments, {
    pageSize: 8,
    resetKeys: [searchText, historyDate, historyStatusFilter, selectedHistoryDoctorId, activeTab],
  });

  let resultCount = searchText ? visibleHospitals.length : hospitalTotalRecords;
  if (activeTab === "doctor") resultCount = visibleDoctors.length;
  if (activeTab === "test") resultCount = visibleTests.length;
  if (activeTab === "history") {
    resultCount = selectedHistoryDoctorId ? visibleAppointments.length : visibleHistoryDoctorGroups.length;
  }

  const openHospitalDoctors = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setSelectedDepartmentId("all");
    setActiveTab("doctor");
  };

  const showHospitals = () => {
    setActiveTab("hospital");
    setShowHistoryFilters(false);
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const showDoctors = () => {
    setActiveTab("doctor");
    setShowHistoryFilters(false);
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const showTests = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/user/dashboard" } });
      return;
    }

    setActiveTab("test");
    setShowHistoryFilters(false);
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const showHistory = () => {
    if (!canUsePatientActions) {
      navigate("/login", { state: { from: "/user/dashboard" } });
      return;
    }

    setActiveTab("history");
    setShowHistoryFilters(false);
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
    setSelectedHistoryDoctorId("");
  };

  const openBooking = (doctor) => {
    if (!canUsePatientActions) {
      navigate("/login", { state: { from: "/user/dashboard" } });
      return;
    }

    setBookingDoctor(doctor);
  };

  const afterBooking = async (bookingMessage) => {
    setBookingDoctor(null);
    setMessage(bookingMessage);
    await loadAppointments();
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setCancelId(appointmentId);
      setMessage("");
      const response = await axiosInstance.patch(`/appointment/cancelAppointment/${appointmentId}`);
      setMessage(response.data.message || "Appointment cancelled successfully");
      await loadAppointments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to cancel appointment.");
    } finally {
      setCancelId("");
    }
  };

  const toggleShareMedicalHistory = async (appointmentId, shareMedicalHistory) => {
    try {
      setMessage("");
      const response = await axiosInstance.patch(`/appointment/shareMedicalHistory/${appointmentId}`, {
        shareMedicalHistory,
      });
      setMessage(response.data.message || "Medical history sharing updated");
      await loadAppointments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update medical history sharing.");
    }
  };

  const tabButtonClass = (tabName) => {
    if (activeTab === tabName) {
      return "h-10 rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition dark:bg-teal-400 dark:text-slate-950";
    }

    return "h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800";
  };

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-6 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="border-b border-slate-200 pb-4 dark:border-slate-800">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Patient browse
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Find Care
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Welcome, {user?.name || "guest"}. Search hospitals and doctors from one place.
              </p>
            </div>
            <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {resultCount} result(s)
            </p>
          </div>
        </section>

        <nav className="sticky top-[73px] z-20 mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <SearchInput
              value={searchText}
              onChange={setSearchText}
              placeholder={`Search ${activeTab === "hospital" ? "hospitals" : activeTab === "doctor" ? "doctors" : activeTab === "test" ? "tests" : "appointments"}`}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button type="button" onClick={showHospitals} className={tabButtonClass("hospital")}>
                By Hospital
              </button>
              <button type="button" onClick={showDoctors} className={tabButtonClass("doctor")}>
                By Doctor
              </button>
              <button type="button" onClick={showTests} className={tabButtonClass("test")}>
                Test
              </button>
              <button type="button" onClick={showHistory} className={tabButtonClass("history")}>
                History
              </button>
            </div>
          </div>
          {activeTab === "history" && (
            <div className="relative mt-3 flex justify-end border-t border-slate-200 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowHistoryFilters((value) => !value)}
                aria-expanded={showHistoryFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <FilterListRoundedIcon className="!h-4 !w-4" aria-hidden="true" />
                Filters
              </button>
              {showHistoryFilters && (
                <div className="absolute right-0 top-14 z-30 w-full max-w-sm rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={historyDate}
                      onChange={(event) => setHistoryDate(event.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      aria-label="Appointment history date"
                    />
                    <select
                      value={historyStatusFilter}
                      onChange={(event) => setHistoryStatusFilter(event.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      aria-label="Status filter"
                    >
                      <option value="all">All appointments</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      value={historySortDirection}
                      onChange={(event) => setHistorySortDirection(event.target.value)}
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      aria-label="Sort appointments by date"
                    >
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setHistoryDate("");
                        setHistoryStatusFilter("all");
                        setHistorySortDirection("desc");
                        setSelectedHistoryDoctorId("");
                      }}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <RestartAltRoundedIcon className="!h-4 !w-4" aria-hidden="true" />
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        {loading && (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
            ))}
          </section>
        )}

        {!loading && activeTab === "hospital" && (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleHospitals.map((hospital) => {
                const hospitalId = getId(hospital);
                const image = getHospitalPhoto(hospital);

                return (
                  <article
                    key={hospital._id}
                    onClick={() => openHospitalDoctors(hospitalId)}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700"
                  >
                    <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
                      {image ? (
                        <img src={image} alt={hospital.hospitalName || "Hospital"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-teal-700 text-4xl font-black text-white dark:bg-teal-500 dark:text-slate-950">
                          {(hospital.hospitalName || "H").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                        {hospital.hospitalType || "Hospital"}
                      </p>
                      <h2 className="mt-2 line-clamp-2 text-xl font-black text-slate-950 dark:text-white">
                        {hospital.hospitalName || "Hospital"}
                      </h2>
                      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {hospital.address || "Address not available"}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                            Departments
                          </p>
                          <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                            {getDepartmentCount(hospitalId)}
                          </p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                          <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                            Doctors
                          </p>
                          <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                            {getDoctorCount(hospitalId) || hospital.totalDoctors || 0}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openHospitalDoctors(hospitalId);
                          }}
                          className="h-11 rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
                        >
                          View Doctors
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/hospital/details/${hospital._id}`);
                          }}
                          className="h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {visibleHospitals.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-3">
                  {searchText ? "No hospitals match your search." : "No hospitals available yet."}
                </div>
              )}
            </section>

            <Pagination
              className="mt-5"
              currentPage={hospitalPage}
              endItem={Math.min(hospitalPage * hospitalLimit, hospitalTotalRecords)}
              onPageChange={setHospitalPage}
              startItem={hospitalTotalRecords === 0 ? 0 : (hospitalPage - 1) * hospitalLimit + 1}
              totalItems={hospitalTotalRecords}
              totalPages={hospitalTotalPages}
            />
          </>
        )}

        {!loading && activeTab === "history" && (
          <section className="mt-4 space-y-3">
            {!selectedHistoryDoctorId && historyGroupPagination.paginatedItems.map((group) => (
              <article
                key={group.doctorId}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedHistoryDoctorId(group.doctorId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedHistoryDoctorId(group.doctorId);
                  }
                }}
                className="block w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
                      <MedicalServicesRoundedIcon className="!h-5 !w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{group.specialization}</p>
                      <h2 className="mt-0.5 truncate text-lg font-black text-slate-950 dark:text-white">
                        {group.doctorName}
                      </h2>
                      <p className="truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {group.hospitalNames.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[32rem]">
                    <InfoBox label="Appointments" value={group.appointmentCount} />
                    <InfoBox label="Medicine" value={group.medicineCount} />
                    <InfoBox label="Reports" value={group.reportCount} />
                    <InfoBox label="Latest Visit" value={formatDate(group.latestDate)} />
                  </div>
                </div>
              </article>
            ))}

            {selectedHistoryDoctorId && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Doctor history</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                      {selectedHistoryDoctor?.doctorName || "Doctor not available"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryDoctorId("")}
                    className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Back to Doctors
                  </button>
                </div>
              </div>
            )}

            {selectedHistoryDoctorId && historyAppointmentPagination.paginatedItems.map((appointment) => (
              <article key={appointment._id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
                      <MedicalServicesRoundedIcon className="!h-5 !w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Appointment</p>
                      <h2 className="mt-0.5 truncate text-lg font-black text-slate-950 dark:text-white">
                        {appointment.doctorId?.doctorName || "Doctor not available"}
                      </h2>
                      <p className="truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {appointment.hospitalId?.hospitalName || "Hospital not available"}
                      </p>
                    </div>
                  </div>
                  <span className={statusBadgeClass(appointment.status)}>
                    {appointment.status || "pending"}
                  </span>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-3">
                  <InfoBox icon={CalendarMonthRoundedIcon} label="Date" value={formatDate(appointment.date)} />
                  <InfoBox icon={AccessTimeRoundedIcon} label="Time Slot" value={appointment.timeSlot || "-"} />
                  <InfoBox icon={EventNoteRoundedIcon} label="Booked On" value={formatDate(appointment.createdAt)} />
                </div>

                <div className="mx-4 mb-4 rounded-md bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 dark:bg-slate-900 dark:text-teal-200">
                        <ShareRoundedIcon className="!h-4 !w-4" aria-hidden="true" />
                      </span>
                      <div>
                      <p className="text-sm font-black text-slate-950 dark:text-white">Medical history sharing</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Allow future doctors to see this appointment and medicine.
                      </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={appointment.shareMedicalHistory !== false}
                        onChange={(event) => toggleShareMedicalHistory(appointment._id, event.target.checked)}
                      />
                      Share
                    </label>
                  </div>
                  <MedicineHistory medicine={appointment.medicine} reports={appointment.reports} />
                </div>

                {["pending", "confirmed"].includes(appointment.status) && (
                  <div className="flex justify-end border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => cancelAppointment(appointment._id)}
                      disabled={cancelId === appointment._id}
                      className="h-9 rounded-md bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-700 disabled:opacity-60 dark:bg-rose-500 dark:hover:bg-rose-400"
                    >
                      {cancelId === appointment._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  </div>
                )}
              </article>
            ))}

            {!selectedHistoryDoctorId && visibleHistoryDoctorGroups.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {searchText || historyDate || historyStatusFilter !== "all" ? "No doctors match this history view." : "No appointments booked yet."}
              </div>
            )}

            {selectedHistoryDoctorId && visibleAppointments.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {searchText || historyDate || historyStatusFilter !== "all" ? "No appointments match this history view." : "No appointments booked yet."}
              </div>
            )}
            {!selectedHistoryDoctorId && (
              <Pagination
                currentPage={historyGroupPagination.currentPage}
                endItem={historyGroupPagination.endItem}
                onPageChange={historyGroupPagination.setCurrentPage}
                startItem={historyGroupPagination.startItem}
                totalItems={historyGroupPagination.totalItems}
                totalPages={historyGroupPagination.totalPages}
              />
            )}
            {selectedHistoryDoctorId && (
              <Pagination
                currentPage={historyAppointmentPagination.currentPage}
                endItem={historyAppointmentPagination.endItem}
                onPageChange={historyAppointmentPagination.setCurrentPage}
                startItem={historyAppointmentPagination.startItem}
                totalItems={historyAppointmentPagination.totalItems}
                totalPages={historyAppointmentPagination.totalPages}
              />
            )}
          </section>
        )}

        {!loading && activeTab === "test" && (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testPagination.paginatedItems.map((test) => (
              <TestCard key={test._id} test={test} />
            ))}

            {visibleTests.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-3">
                {searchText ? "No tests match your search." : "No tests available yet."}
              </div>
            )}
            <Pagination
              className="md:col-span-2 xl:col-span-3"
              currentPage={testPagination.currentPage}
              endItem={testPagination.endItem}
              onPageChange={testPagination.setCurrentPage}
              startItem={testPagination.startItem}
              totalItems={testPagination.totalItems}
              totalPages={testPagination.totalPages}
            />
          </section>
        )}

        {!loading && activeTab === "doctor" && (
          <>
            {selectedHospital && (
              <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                      Hospital doctors
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                      {selectedHospital.hospitalName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Filter doctors by department.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={showHospitals}
                    className="h-10 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Back to Hospitals
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <DepartmentButton
                    active={selectedDepartmentId === "all"}
                    label="All Departments"
                    onClick={() => setSelectedDepartmentId("all")}
                  />
                  {visibleDepartments.map((department) => (
                    <DepartmentButton
                      key={department._id}
                      active={selectedDepartmentId === department._id}
                      label={department.departmentName}
                      onClick={() => setSelectedDepartmentId(department._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {doctorPagination.paginatedItems.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} onBook={() => openBooking(doctor)} />
              ))}

              {visibleDoctors.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-3">
                  {searchText ? "No doctors match your search." : "No doctors available yet."}
                </div>
              )}
              <Pagination
                className="md:col-span-2 xl:col-span-3"
                currentPage={doctorPagination.currentPage}
                endItem={doctorPagination.endItem}
                onPageChange={doctorPagination.setCurrentPage}
                startItem={doctorPagination.startItem}
                totalItems={doctorPagination.totalItems}
                totalPages={doctorPagination.totalPages}
              />
            </section>
          </>
        )}

        {bookingDoctor && (
          <Suspense fallback={null}>
            <AppointmentModal
              doctor={bookingDoctor}
              user={user}
              onClose={() => setBookingDoctor(null)}
              onBooked={afterBooking}
            />
          </Suspense>
        )}

      </div>
    </main>
  );
};

const InfoBox = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-center gap-3 rounded-md bg-slate-50 p-3 dark:bg-slate-950">
      {Icon && (
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-300">
          <Icon className="!h-4 !w-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 truncate font-black text-slate-950 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

const MedicineHistory = ({ medicine, reports = [] }) => {
  if (!medicine) {
    return (
      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
        No medicine added by doctor yet.
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
      <p className="text-sm font-black text-slate-950 dark:text-white">Medicine</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <InfoBox label="Symptoms" value={medicine.symptoms || "-"} />
        <InfoBox label="Diagnosis" value={medicine.diagnosis || "-"} />
        <InfoBox label="Blood Pressure" value={medicine.bloodPressure || "-"} />
        <InfoBox label="Next Visit" value={formatDate(medicine.nextVisitDate)} />
      </div>
      <div className="mt-3 space-y-2">
        {(medicine.medicines || []).map((item, index) => (
          <div key={index} className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-black text-slate-950 dark:text-white">
              {item.medicineName || "Medicine"} {item.dosage ? `- ${item.dosage}` : ""}
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {item.timing || "-"} | {item.days || 1} day(s) | {item.instruction || "No instruction"}
            </p>
          </div>
        ))}
      </div>
      {(medicine.tests || []).length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-black text-slate-950 dark:text-white">Tests</p>
          <div className="mt-3 space-y-2">
            {(medicine.tests || []).map((item, index) => (
              <div key={index} className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="font-black text-slate-950 dark:text-white">
                  {item.testName || item.testId?.testName || "Test"}
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  {item.labId?.labName || "Lab not available"} | {item.status || "pending"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {reports.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-black text-slate-950 dark:text-white">Reports</p>
          <div className="mt-3 space-y-2">
            {reports.map((report) => (
              <a key={report._id} href={report.fileUrl} target="_blank" rel="noreferrer" className="block rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="font-black text-slate-950 dark:text-white">{report.reportName || "Report"}</span>
                <span className="mt-1 block text-slate-600 dark:text-slate-300">
                  {report.testId?.testName || report.reportType || "Lab report"} | {report.status || "verified"}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
      {medicine.notes && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white">Notes:</span> {medicine.notes}
        </p>
      )}
    </div>
  );
};

const DepartmentButton = ({ active, label, onClick }) => {
  const className = active
    ? "h-10 rounded-md bg-teal-700 px-3 text-sm font-black text-white transition dark:bg-teal-400 dark:text-slate-950"
    : "h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
};

const DoctorCard = ({ doctor, onBook }) => {
  const image = getDoctorPhoto(doctor);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onBook}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onBook();
      }}
      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700 dark:focus:ring-teal-950"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-700 text-2xl font-black text-white dark:bg-teal-500 dark:text-slate-950">
          {image ? (
            <img src={image} alt={doctor.doctorName || "Doctor"} className="h-full w-full object-cover" />
          ) : (
            (doctor.doctorName || "D").slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            {doctor.specialization || "Doctor"}
          </p>
          <h2 className="mt-1 truncate text-xl font-black text-slate-950 dark:text-white">
            {doctor.doctorName || "Doctor"}
          </h2>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
            {doctor.hospitalId?.hospitalName || "Hospital not available"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <p><span className="font-bold text-slate-900 dark:text-white">Qualification:</span> {doctor.qualification || "Not provided"}</p>
        <p><span className="font-bold text-slate-900 dark:text-white">Experience:</span> {doctor.experience || 0} years</p>
        <p><span className="font-bold text-slate-900 dark:text-white">Fees:</span> {money.format(doctor.consultationFee || 0)}</p>
        <p><span className="font-bold text-slate-900 dark:text-white">Timing:</span> {formatDoctorTiming(doctor)}</p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onBook();
        }}
        className="mt-5 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
      >
        Book Appointment
      </button>
    </article>
  );
};

const TestCard = ({ test }) => {
  const navigate = useNavigate();
  const image = getTestPhoto(test);
  const address = test.labId?.address || test.hospitalId?.address || "Address not available";
  const hospitalId = getId(test.hospitalId);

  return (
    <article
      role={hospitalId ? "button" : undefined}
      tabIndex={hospitalId ? 0 : undefined}
      onClick={() => {
        if (hospitalId) navigate(`/hospital/details/${hospitalId}`);
      }}
      onKeyDown={(event) => {
        if (hospitalId && (event.key === "Enter" || event.key === " ")) navigate(`/hospital/details/${hospitalId}`);
      }}
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900 ${hospitalId ? "cursor-pointer hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-teal-100 dark:hover:border-teal-700 dark:focus:ring-teal-950" : ""}`}
    >
      <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800">
        {image ? (
          <img src={image} alt={test.testName || "Test"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-teal-700 text-4xl font-black text-white dark:bg-teal-500 dark:text-slate-950">
            {(test.testName || "T").slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
          Lab Test
        </p>
        <h2 className="mt-2 line-clamp-2 text-xl font-black text-slate-950 dark:text-white">
          {test.testName || "Test name not available"}
        </h2>

        <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            <span className="font-bold text-slate-900 dark:text-white">Hospital:</span>{" "}
            {test.hospitalId?.hospitalName || "Hospital not available"}
          </p>
          <p>
            <span className="font-bold text-slate-900 dark:text-white">Lab:</span>{" "}
            {test.labId?.labName || "Lab not available"}
          </p>
          <p>
            <span className="font-bold text-slate-900 dark:text-white">Test fees:</span>{" "}
            {money.format(test.amount || 0)}
          </p>
          <p>
            <span className="font-bold text-slate-900 dark:text-white">Address:</span> {address}
          </p>
        </div>
      </div>
    </article>
  );
};

export default UserDashboard;
