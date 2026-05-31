import { useEffect, useState } from "react";
import axiosInstance from "../api";
import SearchInput from "../components/SearchInput";
import StatReportsSection from "../components/StatReportsSection";
import { getAuthInfo } from "../custom_hook/UseAuth";

const emptyMedicine = {
  medicineName: "",
  dosage: "",
  timing: "",
  days: 1,
  instruction: "",
  morning: false,
  afternoon: false,
  night: false,
  beforeFood: false,
  afterFood: true,
};

const getToday = () => {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getDateInputValue = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getId = (value) => {
  if (!value) return "";
  return value._id || value;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DoctorDashboard = () => {
  const auth = getAuthInfo();
  const user = auth.user;
  const name = user?.name || user?.doctorName || "Doctor";

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [historyDate, setHistoryDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("timeSlot");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("patients");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setMessage("");
      const response = await axiosInstance.get(`/appointment/doctorAppointments?date=${selectedDate}`);
      setAppointments(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const markReached = async (appointment) => {
    try {
      setMessage("");
      await axiosInstance.patch(`/appointment/reached/${appointment._id}`);
      setActiveAppointment({ ...appointment, isReached: true });
      await loadAppointments();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update reached status.");
    }
  };

  const handleSavedMedicine = async (successMessage) => {
    setActiveAppointment(null);
    setMessage(successMessage);
    await loadAppointments();
  };

  const reachedCount = appointments.filter((appointment) => appointment.isReached).length;
  const completedCount = appointments.filter((appointment) => appointment.status === "completed").length;
  const pendingCount = appointments.filter((appointment) => appointment.status === "pending").length;
  const confirmedCount = appointments.filter((appointment) => appointment.status === "confirmed").length;
  const cancelledCount = appointments.filter((appointment) => appointment.status === "cancelled").length;
  const search = searchTerm.trim().toLowerCase();
  const visibleAppointments = appointments
    .filter((appointment) => {
      const statusMatch = statusFilter === "all" || appointment.status === statusFilter || (statusFilter === "reached" && appointment.isReached);
      if (!statusMatch) return false;
      if (!search) return true;

      const values = [
        appointment.userId?.name,
        appointment.userId?.email,
        appointment.userId?.phone,
        appointment.timeSlot,
        appointment.status,
      ];
      return values.some((value) => String(value || "").toLowerCase().includes(search));
    })
    .sort((a, b) => {
      const aValue = sortKey === "patient" ? a.userId?.name || "" : a[sortKey] || "";
      const bValue = sortKey === "patient" ? b.userId?.name || "" : b[sortKey] || "";
      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * (sortDirection === "asc" ? 1 : -1);
    });

  const changeSort = (key) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const statReports = [
    {
      id: "doctor-day-summary",
      section: "Appointments",
      title: `Appointment Summary - ${formatDate(selectedDate)}`,
      description: "Patient appointment status report for the selected date.",
      metrics: [
        { label: "Appointments", value: appointments.length },
        { label: "Reached", value: reachedCount },
        { label: "Completed", value: completedCount },
        { label: "Pending", value: pendingCount },
        { label: "Confirmed", value: confirmedCount },
        { label: "Cancelled", value: cancelledCount },
      ],
      rows: visibleAppointments.map((appointment) => ({
        date: appointment.date || selectedDate,
        text: `${appointment.timeSlot || "-"} | ${appointment.userId?.name || "Patient"} | ${appointment.status || "pending"} | Reached: ${appointment.isReached ? "Yes" : "No"}`,
      })),
    },
  ];

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              Doctor workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
              Welcome, {name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Review today's patients, mark arrivals, and write medicine for completed visits.
            </p>
          </div>

          <label className="w-full max-w-xs">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Appointment date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-teal-950"
            />
          </label>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto">
          {[
            { id: "patients", label: "Patients" },
            { id: "reports", label: "Reports" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-10 rounded-md px-4 text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-teal-700 text-white dark:bg-teal-400 dark:text-slate-950"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "reports" && (
          <StatReportsSection title="Doctor Reports" subtitle="Section-wise appointment and patient statistics." reports={statReports} loading={loading} />
        )}

        {activeTab === "patients" && (
          <>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat label="Appointments" value={appointments.length} />
          <Stat label="Reached" value={reachedCount} />
          <Stat label="Completed" value={completedCount} />
        </section>

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        <section id="patients" className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Appointments</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDate(selectedDate)}</p>
            </div>
            <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto] xl:items-end">
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search patients" />
              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Filter</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-2 h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="reached">Reached</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Patient history date</span>
                <input
                  type="date"
                  value={historyDate}
                  onChange={(event) => setHistoryDate(event.target.value)}
                  className="mt-2 h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => changeSort("timeSlot")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Time</button>
                <button type="button" onClick={() => changeSort("patient")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Patient</button>
                <button type="button" onClick={() => changeSort("status")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Status</button>
                {historyDate && (
                  <button type="button" onClick={() => setHistoryDate("")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">All History</button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Loading appointments...</div>
          ) : visibleAppointments.length === 0 ? (
            <div className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400">No appointments match this view.</div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {visibleAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment._id}
                  appointment={appointment}
                  historyDate={historyDate}
                  onReached={() => markReached(appointment)}
                  onMedicine={() => setActiveAppointment(appointment)}
                />
              ))}
            </div>
          )}
        </section>

        {activeAppointment && (
          <MedicineModal
            appointment={activeAppointment}
            onClose={() => setActiveAppointment(null)}
            onSaved={handleSavedMedicine}
          />
        )}
          </>
        )}
      </div>
    </main>
  );
};

const AppointmentRow = ({ appointment, historyDate, onReached, onMedicine }) => {
  const patient = appointment.userId || {};
  const history = appointment.medicalHistory || [];
  const visibleHistory = historyDate
    ? history.filter((item) => getDateInputValue(item.date) === historyDate)
    : history;
  const medicineCount = visibleHistory.filter((item) => item.medicine).length;

  return (
    <article className="p-5">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_auto] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            {appointment.timeSlot}
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{patient.name || "Patient"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {patient.email || "-"} {patient.phone ? `| ${patient.phone}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Info label="Status" value={appointment.status || "pending"} />
          <Info label="Reached" value={appointment.isReached ? "Yes" : "No"} />
          <Info label="Share history" value={appointment.shareMedicalHistory ? "Allowed" : "Off"} />
          <Info label="History" value={`${medicineCount} record(s)`} />
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={onReached}
            disabled={appointment.isReached || appointment.status === "cancelled"}
            className="h-10 rounded-md bg-teal-700 px-4 text-sm font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300"
          >
            {appointment.isReached ? "Reached" : "Mark Reached"}
          </button>
          <button
            type="button"
            onClick={onMedicine}
            disabled={!appointment.isReached || appointment.status === "cancelled"}
            className="h-10 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Medicine
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <details className="mt-4 rounded-md bg-slate-50 p-4 dark:bg-slate-950">
          <summary className="cursor-pointer text-sm font-black text-slate-800 dark:text-slate-100">
            Shared medical history {historyDate ? `for ${formatDate(historyDate)}` : ""}
          </summary>
          <div className="mt-4 space-y-3">
            {visibleHistory.map((item) => (
              <div key={item._id} className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-black text-slate-950 dark:text-white">
                  {formatDate(item.date)} - {item.doctorId?.doctorName || "Doctor"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {item.hospitalId?.hospitalName || "Hospital"} | {item.timeSlot || "-"}
                </p>
                <MedicineSummary medicine={item.medicine} reports={item.reports} />
              </div>
            ))}
            {visibleHistory.length === 0 && (
              <div className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                No shared medical history for this date.
              </div>
            )}
          </div>
        </details>
      )}

      {(appointment.reports || []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {(appointment.reports || []).map((report) => (
            <a key={report._id} href={report.fileUrl} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 underline dark:bg-emerald-950 dark:text-emerald-200">
              {report.reportName || "Report"}
            </a>
          ))}
        </div>
      )}
    </article>
  );
};

const MedicineModal = ({ appointment, onClose, onSaved }) => {
  const existing = appointment.medicine || {};
  const [form, setForm] = useState({
    symptoms: existing.symptoms || "",
    diagnosis: existing.diagnosis || "",
    bloodPressure: existing.bloodPressure || "",
    temperature: existing.temperature || "",
    weight: existing.weight || "",
    nextVisitDate: existing.nextVisitDate ? String(existing.nextVisitDate).slice(0, 10) : "",
    notes: existing.notes || "",
    medicines: existing.medicines?.length ? existing.medicines : [{ ...emptyMedicine }],
    tests: existing.tests?.length
      ? existing.tests.map((test) => ({
          testId: getId(test.testId),
          testName: test.testName || test.testId?.testName || "",
        }))
      : [],
  });
  const [availableTests, setAvailableTests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await axiosInstance.get("/test/getAllTests");
        const hospitalId = getId(appointment.hospitalId);
        const testList = (response.data.data || []).filter((test) => {
          return getId(test.hospitalId) === hospitalId && !test.isDeleted && test.status !== "inactive";
        });
        setAvailableTests(testList);
      } catch (error) {
        setAvailableTests([]);
      }
    };

    loadTests();
  }, [appointment.hospitalId]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateMedicine = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.map((medicine, medicineIndex) =>
        medicineIndex === index ? { ...medicine, [field]: value } : medicine,
      ),
    }));
  };

  const addMedicine = () => {
    setForm((prev) => ({ ...prev, medicines: [...prev.medicines, { ...emptyMedicine }] }));
  };

  const removeMedicine = (index) => {
    setForm((prev) => ({
      ...prev,
      medicines: prev.medicines.length === 1 ? prev.medicines : prev.medicines.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addTest = (testId) => {
    const test = availableTests.find((item) => item._id === testId);

    if (!test) return;

    setForm((prev) => {
      const alreadyAdded = prev.tests.some((item) => item.testId === test._id);

      if (alreadyAdded) return prev;

      return {
        ...prev,
        tests: [
          ...prev.tests,
          {
            testId: test._id,
            testName: test.testName,
          },
        ],
      };
    });
  };

  const removeTest = (testId) => {
    setForm((prev) => ({
      ...prev,
      tests: prev.tests.filter((test) => test.testId !== testId),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      const response = await axiosInstance.post(`/medicine/${appointment._id}`, form);
      onSaved(response.data.message || "Medicine saved successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save medicine.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 px-4 py-6">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Medicine
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
              {appointment.userId?.name || "Patient"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close medicine form"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {message && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {message}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Symptoms" value={form.symptoms} onChange={(value) => updateField("symptoms", value)} />
            <Field label="Diagnosis" value={form.diagnosis} onChange={(value) => updateField("diagnosis", value)} />
            <Field label="Blood pressure" value={form.bloodPressure} onChange={(value) => updateField("bloodPressure", value)} />
            <Field label="Temperature" value={form.temperature} onChange={(value) => updateField("temperature", value)} />
            <Field label="Weight" value={form.weight} onChange={(value) => updateField("weight", value)} />
            <Field label="Next visit" type="date" value={form.nextVisitDate} onChange={(value) => updateField("nextVisitDate", value)} />
          </div>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <label className="block">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Tests</span>
              <select
                value=""
                onChange={(event) => addTest(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-teal-950"
              >
                <option value="">Select test</option>
                {availableTests.map((test) => (
                  <option key={test._id} value={test._id}>
                    {test.testName} - {test.labId?.labName || "Lab"}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              {form.tests.map((test) => (
                <span key={test.testId} className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                  {test.testName || "Test"}
                  <button type="button" onClick={() => removeTest(test.testId)} className="font-black">
                    X
                  </button>
                </span>
              ))}
              {form.tests.length === 0 && (
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">No test selected.</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">
                Medicines
              </h3>
              <button type="button" onClick={addMedicine} className="h-10 rounded-md bg-teal-700 px-4 text-sm font-black text-white dark:bg-teal-400 dark:text-slate-950">
                Add
              </button>
            </div>

            {form.medicines.map((medicine, index) => (
              <div key={index} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="Medicine" value={medicine.medicineName} onChange={(value) => updateMedicine(index, "medicineName", value)} />
                  <Field label="Dosage" value={medicine.dosage} onChange={(value) => updateMedicine(index, "dosage", value)} />
                  <Field label="Timing" value={medicine.timing} onChange={(value) => updateMedicine(index, "timing", value)} />
                  <Field label="Days" type="number" value={medicine.days} onChange={(value) => updateMedicine(index, "days", value)} />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-5">
                  {["morning", "afternoon", "night", "beforeFood", "afterFood"].map((field) => (
                    <label key={field} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(medicine[field])}
                        onChange={(event) => updateMedicine(index, field, event.target.checked)}
                      />
                      {field.replace(/([A-Z])/g, " $1")}
                    </label>
                  ))}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                  <Field label="Instruction" value={medicine.instruction} onChange={(value) => updateMedicine(index, "instruction", value)} />
                  <button type="button" onClick={() => removeMedicine(index)} className="h-11 self-end rounded-md border border-rose-200 px-4 text-sm font-black text-rose-700 dark:border-rose-900 dark:text-rose-300">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-teal-950"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="h-11 rounded-md border border-slate-200 px-4 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="h-11 rounded-md bg-teal-700 px-4 text-sm font-black text-white disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950">
              {saving ? "Saving..." : "Save Medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }) => (
  <label className="block">
    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-teal-950"
    />
  </label>
);

const Info = ({ label, value }) => (
  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
  </div>
);

const MedicineSummary = ({ medicine, reports = [] }) => {
  if (!medicine) {
    return <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No medicine saved.</p>;
  }

  return (
    <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
      <p><span className="font-bold text-slate-900 dark:text-white">Diagnosis:</span> {medicine.diagnosis || "-"}</p>
      <p className="mt-1"><span className="font-bold text-slate-900 dark:text-white">Notes:</span> {medicine.notes || "-"}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(medicine.medicines || []).map((item, index) => (
          <span key={index} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
            {item.medicineName} {item.dosage ? `- ${item.dosage}` : ""}
          </span>
        ))}
      </div>
      {(medicine.tests || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {(medicine.tests || []).map((item, index) => (
            <span key={index} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              {item.testName || item.testId?.testName || "Test"}
            </span>
          ))}
        </div>
      )}
      {reports.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {reports.map((report) => (
            <a key={report._id} href={report.fileUrl} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 underline dark:bg-emerald-950 dark:text-emerald-200">
              {report.reportName || "Report"}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
};

export default DoctorDashboard;
