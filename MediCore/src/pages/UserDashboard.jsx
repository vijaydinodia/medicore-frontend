import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import SearchInput from "../components/SearchInput";
import { getAuthInfo } from "../custom_hook/useAuth";

const AppointmentModal = lazy(() => import("../components/AppointmentModal"));
const HospitalDetails = lazy(() => import("../components/HospitalDetails"));

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

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

      const hospitalResult = await axiosInstance.get("/hospital/getAllHospital");
      const doctorResult = await axiosInstance.get("/doctor/getAllDoctors");
      const departmentResult = await axiosInstance.get("/department/getAllDepartments");
      setHospitals(hospitalResult.data.data || []);
      setDoctors(doctorResult.data.data || []);
      setDepartments(departmentResult.data.data || []);

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
  }, [canUsePatientActions]);

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

  let resultCount = visibleHospitals.length;
  if (activeTab === "doctor") resultCount = visibleDoctors.length;
  if (activeTab === "history") resultCount = visibleAppointments.length;

  const openHospitalDoctors = (hospitalId) => {
    setSelectedHospitalId(hospitalId);
    setSelectedDepartmentId("all");
    setActiveTab("doctor");
  };

  const showHospitals = () => {
    setActiveTab("hospital");
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const showDoctors = () => {
    setActiveTab("doctor");
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
  };

  const showHistory = () => {
    if (!canUsePatientActions) {
      navigate("/login", { state: { from: "/user/dashboard" } });
      return;
    }

    setActiveTab("history");
    setSelectedHospitalId("");
    setSelectedDepartmentId("all");
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
      return "h-11 rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition dark:bg-teal-400 dark:text-slate-950";
    }

    return "h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800";
  };

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Patient browse
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Find Care
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
                Welcome, {user?.name || "guest"}. Search hospitals and doctors from one place.
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {resultCount} result(s)
            </p>
          </div>
        </section>

        <nav className="sticky top-[73px] z-20 mt-6 border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchInput
              value={searchText}
              onChange={setSearchText}
              placeholder={`Search ${activeTab === "hospital" ? "hospitals" : activeTab === "doctor" ? "doctors" : "appointments"}`}
              className="flex-1"
            />
            <div className="grid grid-cols-3 gap-2 sm:flex">
              <button type="button" onClick={showHospitals} className={tabButtonClass("hospital")}>
                By Hospital
              </button>
              <button type="button" onClick={showDoctors} className={tabButtonClass("doctor")}>
                By Doctor
              </button>
              <button type="button" onClick={showHistory} className={tabButtonClass("history")}>
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

        {loading && (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
            ))}
          </section>
        )}

        {!loading && activeTab === "hospital" && (
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
                {searchText ? "No hospitals match your search." : "No hospitals available yet."}
              </div>
            )}
          </section>
        )}

        {!loading && activeTab === "history" && (
          <section className="mt-6 space-y-4">
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Status filter</span>
                <select
                  value={historyStatusFilter}
                  onChange={(event) => setHistoryStatusFilter(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Sort by date</span>
                <select
                  value={historySortDirection}
                  onChange={(event) => setHistorySortDirection(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </label>
            </div>
            {visibleAppointments.map((appointment) => (
              <article key={appointment._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                      Appointment
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
                      {appointment.doctorId?.doctorName || "Doctor not available"}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {appointment.hospitalId?.hospitalName || "Hospital not available"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    {appointment.status || "pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoBox label="Date" value={formatDate(appointment.date)} />
                  <InfoBox label="Time Slot" value={appointment.timeSlot || "-"} />
                  <InfoBox label="Booked On" value={formatDate(appointment.createdAt)} />
                </div>

                <div className="mt-5 rounded-md bg-slate-50 p-4 dark:bg-slate-950">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-950 dark:text-white">Medical history sharing</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Allow future doctors to see this appointment and medicine.
                      </p>
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
                  <MedicineHistory medicine={appointment.medicine} />
                </div>

                {["pending", "confirmed"].includes(appointment.status) && (
                  <div className="mt-5 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => cancelAppointment(appointment._id)}
                      disabled={cancelId === appointment._id}
                      className="h-10 rounded-md bg-rose-600 px-4 text-sm font-black text-white transition hover:bg-rose-700 disabled:opacity-60 dark:bg-rose-500 dark:hover:bg-rose-400"
                    >
                      {cancelId === appointment._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  </div>
                )}
              </article>
            ))}

            {visibleAppointments.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {searchText ? "No appointments match your search." : "No appointments booked yet."}
              </div>
            )}
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
              {visibleDoctors.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} onBook={() => openBooking(doctor)} />
              ))}

              {visibleDoctors.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-3">
                  {searchText ? "No doctors match your search." : "No doctors available yet."}
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
              onBooked={afterBooking}
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

const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
};

const MedicineHistory = ({ medicine }) => {
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
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
        onClick={onBook}
        className="mt-5 h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
      >
        Book Appointment
      </button>
    </article>
  );
};

export default UserDashboard;
