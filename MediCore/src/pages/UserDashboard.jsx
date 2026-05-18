import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import SearchInput from "../components/SearchInput";
import { getAuthInfo } from "../custom_hook/useAuth";

const AppointmentModal = lazy(() => import("../components/AppointmentModal"));
const HospitalDetails = lazy(() => import("../components/HospitalDetails"));

const getRecordId = (value) => value?._id || value || "";

const getHospitalImage = (hospital) =>
  hospital.logo || hospital.images?.find((image) => image?.url)?.url || "";

const getDoctorImage = (doctor) =>
  doctor.profileImage || doctor.doctorImage?.profileImage || doctor.doctorImage?.url || "";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const matchesSearch = (item, fields, query) =>
  fields.some((field) => String(field(item) || "").toLowerCase().includes(query));

const formatDoctorTiming = (doctor) => {
  const days = (doctor.availableDays || []).filter(Boolean).join(", ");
  const start = doctor.availableTime?.startTime || "";
  const end = doctor.availableTime?.endTime || "";
  const time = start || end ? `${start || "Start"} - ${end || "End"}` : "";

  if (days && time) return `${days} | ${time}`;
  return days || time || "Timing not available";
};

const formatDate = (value) => {
  if (!value) return "Date not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = getAuthInfo();
  const [activeView, setActiveView] = useState("hospital");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("all");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [detailsHospital, setDetailsHospital] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "user") {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const fetchAppointments = async () => {
    const response = await axiosInstance.get("/appointment/myAppointments");
    setAppointments(response.data.data || []);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [hospitalRes, doctorRes, departmentRes, appointmentRes] = await Promise.all([
        axiosInstance.get("/hospital/getAllHospital"),
        axiosInstance.get("/doctor/getAllDoctors"),
        axiosInstance.get("/department/getAllDepartments"),
        axiosInstance.get("/appointment/myAppointments"),
      ]);

      setHospitals(hospitalRes.data.data || []);
      setDoctors(doctorRes.data.data || []);
      setDepartments(departmentRes.data.data || []);
      setAppointments(appointmentRes.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "user") {
      fetchDashboardData();
    }
  }, [isAuthenticated, user?.role]);

  const query = searchTerm.trim().toLowerCase();

  const activeHospitals = useMemo(
    () =>
      hospitals.filter(
        (hospital) =>
          !hospital.isDeleted &&
          hospital.isActive !== false &&
          hospital.status === "approved",
      ),
    [hospitals],
  );

  const activeHospitalIds = useMemo(
    () => new Set(activeHospitals.map((hospital) => getRecordId(hospital))),
    [activeHospitals],
  );

  const activeDoctors = useMemo(
    () =>
      doctors.filter(
        (doctor) =>
          doctor.status === "active" &&
          activeHospitalIds.has(getRecordId(doctor.hospitalId)),
      ),
    [activeHospitalIds, doctors],
  );

  const selectedHospital = useMemo(
    () => activeHospitals.find((hospital) => getRecordId(hospital) === selectedHospitalId),
    [activeHospitals, selectedHospitalId],
  );

  const hospitalStats = useMemo(() => {
    const departmentCounts = departments.reduce((counts, department) => {
      const hospitalId = getRecordId(department.hospitalId);
      if (!activeHospitalIds.has(hospitalId) || department.status === "inactive") return counts;
      counts[hospitalId] = (counts[hospitalId] || 0) + 1;
      return counts;
    }, {});

    const doctorCounts = activeDoctors.reduce((counts, doctor) => {
      const hospitalId = getRecordId(doctor.hospitalId);
      counts[hospitalId] = (counts[hospitalId] || 0) + 1;
      return counts;
    }, {});

    return { departmentCounts, doctorCounts };
  }, [activeDoctors, activeHospitalIds, departments]);

  const visibleHospitals = useMemo(() => {
    if (!query) return activeHospitals;

    return activeHospitals.filter((hospital) =>
      matchesSearch(
        hospital,
        [
          (item) => item.hospitalName,
          (item) => item.address,
          (item) => item.cityId?.cityName,
          (item) => item.districtId?.districtName,
          (item) => item.stateId?.stateName,
          (item) => item.hospitalType,
        ],
        query,
      ),
    );
  }, [activeHospitals, query]);

  const departmentFilters = useMemo(
    () =>
      departments.filter(
        (department) =>
          selectedHospitalId &&
          getRecordId(department.hospitalId) === selectedHospitalId &&
          department.status !== "inactive",
      ),
    [departments, selectedHospitalId],
  );

  const visibleDoctors = useMemo(() => {
    const scopedDoctors = activeDoctors.filter((doctor) => {
      const hospitalMatch = !selectedHospitalId || getRecordId(doctor.hospitalId) === selectedHospitalId;
      const departmentMatch =
        selectedDepartmentId === "all" || getRecordId(doctor.departmentId) === selectedDepartmentId;

      return hospitalMatch && departmentMatch;
    });

    if (!query) return scopedDoctors;

    return scopedDoctors.filter((doctor) =>
      matchesSearch(
        doctor,
        [
          (item) => item.doctorName,
          (item) => item.qualification,
          (item) => item.specialization,
          (item) => item.hospitalId?.hospitalName,
          (item) => item.departmentId?.departmentName,
          (item) => item.availableDays?.join(" "),
        ],
        query,
      ),
    );
  }, [activeDoctors, query, selectedDepartmentId, selectedHospitalId]);

  const visibleAppointments = useMemo(() => {
    if (!query) return appointments;

    return appointments.filter((appointment) =>
      matchesSearch(
        appointment,
        [
          (item) => item.doctorId?.doctorName,
          (item) => item.hospitalId?.hospitalName,
          (item) => item.timeSlot,
          (item) => item.status,
          (item) => formatDate(item.date),
        ],
        query,
      ),
    );
  }, [appointments, query]);

  const resultCount =
    activeView === "hospital"
      ? visibleHospitals.length
      : activeView === "doctor"
      ? visibleDoctors.length
      : visibleAppointments.length;

  const showHospitalDoctors = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setSelectedDepartmentId("all");
    setActiveView("doctor");
  };

  const showHospitals = () => {
    setActiveView("hospital");
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const showAllDoctors = () => {
    setActiveView("doctor");
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const showHistory = () => {
    setActiveView("history");
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const handleBooked = async (bookingMessage) => {
    setBookingDoctor(null);
    setMessage(bookingMessage);
    await fetchAppointments();
  };

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Patient browse</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Find Care</h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                Welcome, {user?.name || "user"}. Search hospitals and doctors from one place.
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{resultCount} result(s)</p>
          </div>
        </section>

        <nav className="sticky top-[73px] z-20 mt-6 border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={`Search ${
                activeView === "hospital"
                  ? "hospitals"
                  : activeView === "doctor"
                  ? "doctors"
                  : "appointments"
              }`}
              className="flex-1"
            />
            <div className="grid grid-cols-3 gap-2 sm:flex">
              <button
                type="button"
                onClick={showHospitals}
                className={`h-11 rounded-md px-4 text-sm font-black transition ${
                  activeView === "hospital"
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-400 dark:text-slate-950"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                By Hospital
              </button>
              <button
                type="button"
                onClick={showAllDoctors}
                className={`h-11 rounded-md px-4 text-sm font-black transition ${
                  activeView === "doctor"
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-400 dark:text-slate-950"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                By Doctor
              </button>
              <button
                type="button"
                onClick={showHistory}
                className={`h-11 rounded-md px-4 text-sm font-black transition ${
                  activeView === "history"
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-400 dark:text-slate-950"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                History
              </button>
            </div>
          </div>
        </nav>

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        {loading ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
            ))}
          </section>
        ) : activeView === "hospital" ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleHospitals.map((hospital) => {
              const hospitalId = getRecordId(hospital);
              const image = getHospitalImage(hospital);

              return (
                <article
                  key={hospital._id}
                  onClick={() => showHospitalDoctors(hospitalId)}
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
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">{hospital.hospitalType || "Hospital"}</p>
                    <h2 className="mt-2 line-clamp-2 text-xl font-black text-slate-950 dark:text-white">{hospital.hospitalName || "Hospital"}</h2>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">{hospital.address || "Address not available"}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Departments</p>
                        <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{hospitalStats.departmentCounts[hospitalId] || 0}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Doctors</p>
                        <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{hospitalStats.doctorCounts[hospitalId] || hospital.totalDoctors || 0}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          showHospitalDoctors(hospitalId);
                        }}
                        className="h-11 rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
                      >
                        View Doctors
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDetailsHospital(hospital);
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
                {searchTerm ? "No hospitals match your search." : "No hospitals available yet."}
              </div>
            )}
          </section>
        ) : activeView === "history" ? (
          <section className="mt-6 space-y-4">
            {visibleAppointments.map((appointment) => (
              <article key={appointment._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Appointment</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                      {appointment.doctorId?.doctorName || "Doctor not available"}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {appointment.hospitalId?.hospitalName || "Hospital not available"}
                    </p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${
                    appointment.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : appointment.status === "cancelled"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                      : appointment.status === "completed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                  }`}>
                    {appointment.status || "pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Date</p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">{formatDate(appointment.date)}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Time Slot</p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">{appointment.timeSlot || "-"}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Booked On</p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">{formatDate(appointment.createdAt)}</p>
                  </div>
                </div>
              </article>
            ))}

            {visibleAppointments.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {searchTerm ? "No appointments match your search." : "No appointments booked yet."}
              </div>
            )}
          </section>
        ) : (
          <>
          {selectedHospital && (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Hospital doctors</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{selectedHospital.hospitalName}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Filter doctors by department.</p>
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
                <button
                  type="button"
                  onClick={() => setSelectedDepartmentId("all")}
                  className={`h-10 rounded-md px-3 text-sm font-black transition ${
                    selectedDepartmentId === "all"
                      ? "bg-teal-700 text-white dark:bg-teal-400 dark:text-slate-950"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  All Departments
                </button>
                {departmentFilters.map((department) => (
                  <button
                    key={department._id}
                    type="button"
                    onClick={() => setSelectedDepartmentId(department._id)}
                    className={`h-10 rounded-md px-3 text-sm font-black transition ${
                      selectedDepartmentId === department._id
                        ? "bg-teal-700 text-white dark:bg-teal-400 dark:text-slate-950"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {department.departmentName}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleDoctors.map((doctor) => {
              const image = getDoctorImage(doctor);

              return (
                <article key={doctor._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-700 text-2xl font-black text-white dark:bg-teal-500 dark:text-slate-950">
                      {image ? (
                        <img src={image} alt={doctor.doctorName || "Doctor"} className="h-full w-full object-cover" />
                      ) : (
                        (doctor.doctorName || "D").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">{doctor.specialization || "Doctor"}</p>
                      <h2 className="mt-1 truncate text-xl font-black text-slate-950 dark:text-white">{doctor.doctorName || "Doctor"}</h2>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-500 dark:text-slate-400">{doctor.hospitalId?.hospitalName || "Hospital not available"}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <p><span className="font-bold text-slate-900 dark:text-white">Qualification:</span> {doctor.qualification || "Not provided"}</p>
                    <p><span className="font-bold text-slate-900 dark:text-white">Experience:</span> {doctor.experience || 0} years</p>
                    <p><span className="font-bold text-slate-900 dark:text-white">Fees:</span> {currency.format(doctor.consultationFee || 0)}</p>
                    <p><span className="font-bold text-slate-900 dark:text-white">Timing:</span> {formatDoctorTiming(doctor)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingDoctor(doctor)}
                    className="mt-5 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
                  >
                    Book Appointment
                  </button>
                </article>
              );
            })}

            {visibleDoctors.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-3">
                {searchTerm ? "No doctors match your search." : "No doctors available yet."}
              </div>
            )}
          </section>
          </>
        )}

        {bookingDoctor && (
          <Suspense fallback={null}>
            <AppointmentModal
              doctor={bookingDoctor}
              user={user}
              onClose={() => setBookingDoctor(null)}
              onBooked={handleBooked}
            />
          </Suspense>
        )}

        {detailsHospital && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-6">
            <div className="mx-auto max-w-5xl rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <Suspense fallback={null}>
                <HospitalDetails hospital={detailsHospital} onClose={() => setDetailsHospital(null)} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default UserDashboard;
