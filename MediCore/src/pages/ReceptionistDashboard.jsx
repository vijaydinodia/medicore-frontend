import { useEffect, useState } from "react";
import axiosInstance from "../api";
import Pagination from "../components/Pagination";
import { UsePagination } from "../custom_hook/UsePagination";
import { UseAuth } from "../custom_hook/useAuth";

const paths = {
  lab: "M9 3h6M10 3v5l-5 9a3 3 0 002.6 4.5h8.8A3 3 0 0019 17l-5-9V3M8 14h8",
  test: "M9 3h6M10 3v5l-5 9a3 3 0 002.6 4.5h8.8A3 3 0 0019 17l-5-9V3M8 14h8",
  clock: "M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  location: "M12 21s7-4.4 7-11a7 7 0 10-14 0c0 6.6 7 11 7 11zM12 10h.01",
  user: "M12 14a5 5 0 100-10 5 5 0 000 10zM4 21a8 8 0 0116 0",
  edit: "M16.862 4.487l1.651-1.65a2.121 2.121 0 113 3l-9.193 9.193-4 1 1-1 9.193-9.193z",
  archive: "M3 7h18M5 7l1 13h12l1-13M9 11h6",
  restore: "M4 4v6h6M20 20v-6h-6M5 15a7 7 0 0012 3M19 9A7 7 0 007 6",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5",
  done: "M5 13l4 4L19 7",
  close: "M6 18L18 6M6 6l12 12",
  report: "M9 3h6l4 4v14H5V3h4M14 3v5h5M8 13h8M8 17h6",
  menu: "M4 6h16M4 12h16M4 18h16",
  cash: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
  token: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
};

const Icon = ({ name, className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
  </svg>
);

const Pill = ({ children, tone = "success" }) => {
  const colors = {
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    danger: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
    neutral: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${colors[tone] || colors.neutral}`}>{children}</span>;
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const InfoCard = ({ icon, label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div className="flex items-start gap-4">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 break-words text-lg font-black text-slate-950 dark:text-white">{value || "-"}</p>
      </div>
    </div>
  </div>
);

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
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition disabled:opacity-50 ${colors[tone]}`}
      {...props}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={onClose}>
    <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/95">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        <IconButton icon="close" label="Close" onClick={onClose} />
      </header>
      <div className="p-6">{children}</div>
    </section>
  </div>
);

const ReceptionistDashboard = () => {
  const { user } = UseAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Selected item for displaying token/receipt modal
  const [selectedTokenItem, setSelectedTokenItem] = useState(null);
  const [tokenType, setTokenType] = useState(""); // "appointment" or "test"
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const appointmentRes = await axiosInstance.get("/appointment/hospitalAppointments");
      const prescriptionRes = await axiosInstance.get("/appointment/hospitalTestsToCollectFees");

      setAppointments(appointmentRes.data.data || []);
      setPrescriptions(prescriptionRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load receptionist data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleVerifyAppointment = async (appointmentId, paymentStatus) => {
    try {
      setLoading(true);
      const res = await axiosInstance.patch(`/appointment/verifyAppointment/${appointmentId}`, { paymentStatus });
      setMessage(res.data.message || "Appointment status updated.");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectTestFee = async (medicineId, testId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/appointment/collectTestFee", { medicineId, testId });
      setMessage(res.data.message || "Test fee marked as collected.");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to collect test fee.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenToken = (item, type, test = null) => {
    setSelectedTokenItem(item);
    setTokenType(type);
    setSelectedTestDetails(test);
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: "lab" },
    { id: "appointments", label: "Appointments", icon: "clock" },
    { id: "test-fees", label: "Lab Test Fees", icon: "test" },
  ];

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
  };

  // Stats computation
  const pendingAppointments = appointments.filter(app => app.status === "pending").length;
  const confirmedAppointments = appointments.filter(app => app.status === "confirmed").length;
  const completedAppointments = appointments.filter(app => app.status === "completed").length;
  const paidAppointments = appointments.filter(app => app.paymentStatus === "done");
  const unpaidAppointments = appointments.filter(app => app.paymentStatus === "pending");

  // Sum up collected fees from paid appointments (consultation fee)
  const totalConsultationFees = paidAppointments.reduce((acc, app) => acc + (app.doctorId?.consultationFee || 0), 0);

  // Sum up lab test fees
  let totalLabFees = 0;
  prescriptions.forEach(med => {
    med.tests?.forEach(t => {
      if (t.paymentStatus === "done") {
        totalLabFees += (t.testId?.amount || 0);
      }
    });
  });

  // Pagination for Appointments
  const appointmentsPagination = UsePagination(appointments, { pageSize: 6 });
  
  // Pagination for prescribed lab tests
  // Transform prescriptions into list of tests for display
  const testList = [];
  prescriptions.forEach(med => {
    med.tests?.forEach(test => {
      testList.push({
        medicineId: med._id,
        testId: test.testId?._id || test._id,
        testName: test.testName || test.testId?.testName,
        labName: test.labId?.labName,
        amount: test.testId?.amount || 0,
        status: test.status,
        paymentStatus: test.paymentStatus || "pending",
        patientName: med.appointmentId?.userId?.name || "Patient",
        doctorName: med.appointmentId?.doctorId?.doctorName || "Doctor",
        date: med.createdAt,
      });
    });
  });
  const testsPagination = UsePagination(testList, { pageSize: 6 });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Tab Menu Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Reception Desk</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome, receptionist. Verify patient payments, manage appointments, collect lab fees and issue tokens.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 md:hidden"
          >
            <Icon name="menu" className="h-4 w-4" />
            Menu
          </button>

          <nav className={`${menuOpen ? "absolute right-0 top-full z-20 mt-2 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950" : "hidden"} flex-col gap-1 md:flex md:static md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition ${active ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"}`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}
      {message && (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      )}

      {/* Tabs Content */}
      <section className="mt-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCard icon="clock" label="Pending Appointments" value={pendingAppointments} />
              <InfoCard icon="done" label="Confirmed Appointments" value={confirmedAppointments} />
              <InfoCard icon="cash" label="Collected Consult Fee" value={`₹ ${totalConsultationFees}`} />
              <InfoCard icon="cash" label="Collected Lab Fee" value={`₹ ${totalLabFees}`} />
            </div>

            {/* Dashboard instructions panel */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">Required Receptionist Actions</h2>
              <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  Go to the <strong>Appointments</strong> tab to see all bookings. If a patient pays cash at the counter or shows proof of payment, verify their payment by clicking the <strong>Verify & Confirm</strong> button.
                </li>
                <li>
                  Once confirmed, generate and issue the printed/digital queue ticket using the <strong>Issue Token</strong> button.
                </li>
                <li>
                  Go to the <strong>Lab Test Fees</strong> tab to see the diagnostic tests prescribed to patients by doctors. Collect the test charges and mark them as paid using the <strong>Collect Fee</strong> button.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === "appointments" && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Patient Appointments</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Verify client consultation payments and print tokens.</p>

            <div className="mt-5 space-y-4">
              {appointmentsPagination.paginatedItems.map((appointment) => {
                const tokenNo = `TKN-${appointment._id.substring(appointment._id.length - 4).toUpperCase()}`;
                return (
                  <div key={appointment._id} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{appointment.userId?.name || "Patient"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Code: {tokenNo}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Mob: {appointment.userId?.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dr. {appointment.doctorId?.doctorName || "Doctor"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.doctorId?.specialization || "General"}</p>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">Fee: ₹{appointment.doctorId?.consultationFee || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(appointment.date)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{appointment.timeSlot}</p>
                      <div className="mt-1 flex gap-2">
                        <Pill tone={appointment.paymentStatus === "done" ? "success" : "warning"}>
                          Payment: {appointment.paymentStatus === "done" ? "Paid" : "Pending"}
                        </Pill>
                        <Pill tone={appointment.status === "confirmed" ? "success" : appointment.status === "completed" ? "neutral" : "warning"}>
                          {appointment.status}
                        </Pill>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {appointment.paymentStatus !== "done" && (
                        <button
                          type="button"
                          onClick={() => handleVerifyAppointment(appointment._id, "done")}
                          disabled={loading}
                          className="rounded bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                        >
                          Verify & Confirm
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenToken(appointment, "appointment")}
                        className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      >
                        <Icon name="token" className="h-3.5 w-3.5" />
                        Print Token
                      </button>
                    </div>
                  </div>
                );
              })}

              {!loading && appointments.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No appointments found for your hospital.</p>
                </div>
              )}

              <Pagination
                currentPage={appointmentsPagination.currentPage}
                endItem={appointmentsPagination.endItem}
                onPageChange={appointmentsPagination.setCurrentPage}
                startItem={appointmentsPagination.startItem}
                totalItems={appointmentsPagination.totalItems}
                totalPages={appointmentsPagination.totalPages}
              />
            </div>
          </div>
        )}

        {/* LAB TEST FEES TAB */}
        {activeTab === "test-fees" && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Prescribed Test Fees Collection</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Collect charges for lab tests ordered by medical staff.</p>

            <div className="mt-5 space-y-4">
              {testsPagination.paginatedItems.map((test, index) => (
                <div key={index} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
                  <div>
                    <p className="font-bold text-slate-950 dark:text-white">{test.patientName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Doctor: Dr. {test.doctorName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ordered: {formatDate(test.date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{test.testName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Lab: {test.labName || "Hospital Lab"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400">Amount: ₹{test.amount}</p>
                    <div className="mt-1 flex gap-2">
                      <Pill tone={test.paymentStatus === "done" ? "success" : "warning"}>
                        {test.paymentStatus === "done" ? "Paid" : "Unpaid"}
                      </Pill>
                      <Pill tone={test.status === "completed" ? "success" : "neutral"}>
                        Test: {test.status}
                      </Pill>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {test.paymentStatus !== "done" && (
                      <button
                        type="button"
                        onClick={() => handleCollectTestFee(test.medicineId, test.testId)}
                        disabled={loading}
                        className="rounded bg-teal-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
                      >
                        Collect Fee
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenToken(test, "test")}
                      className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <Icon name="token" className="h-3.5 w-3.5" />
                      Print Receipt
                    </button>
                  </div>
                </div>
              ))}

              {!loading && testList.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No test fee collections pending.</p>
                </div>
              )}

              <Pagination
                currentPage={testsPagination.currentPage}
                endItem={testsPagination.endItem}
                onPageChange={testsPagination.setCurrentPage}
                startItem={testsPagination.startItem}
                totalItems={testsPagination.totalItems}
                totalPages={testsPagination.totalPages}
              />
            </div>
          </div>
        )}
      </section>

      {/* TOKEN AND RECEIPT MODAL */}
      {selectedTokenItem && (
        <Modal title={tokenType === "appointment" ? "Appointment Queue Token" : "Lab Test Charge Receipt"} onClose={() => setSelectedTokenItem(null)}>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-950">
            
            {/* Header info */}
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">MEDICORE CLINIC</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedTokenItem.hospitalId?.hospitalName || user?.name || "Hospital Receipt"}</p>
            </div>

            {/* Token Badge */}
            <div className="my-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Queue Token Number</p>
              <div className="mt-1 text-4xl font-black tracking-widest text-teal-700 dark:text-teal-400">
                {tokenType === "appointment" 
                  ? `TKN-${selectedTokenItem._id.substring(selectedTokenItem._id.length - 4).toUpperCase()}`
                  : `TST-${selectedTokenItem.testId?.substring(selectedTokenItem.testId?.length - 4).toUpperCase() || "LAB"}`
                }
              </div>
            </div>

            {/* Details Table */}
            <div className="space-y-2 border-t border-slate-200 pt-4 text-left text-sm dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {tokenType === "appointment" ? selectedTokenItem.userId?.name : selectedTokenItem.patientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {tokenType === "appointment" 
                    ? `Dr. ${selectedTokenItem.doctorId?.doctorName}` 
                    : `Dr. ${selectedTokenItem.doctorName}`
                  }
                </span>
              </div>
              
              {tokenType === "appointment" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date/Time:</span>
                    <span className="text-slate-900 dark:text-white">{formatDate(selectedTokenItem.date)} ({selectedTokenItem.timeSlot})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consultation Charges:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">₹{selectedTokenItem.doctorId?.consultationFee || 0}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lab Test:</span>
                    <span className="text-slate-900 dark:text-white">{selectedTokenItem.testName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Charges:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">₹{selectedTokenItem.amount}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <Pill tone={selectedTokenItem.paymentStatus === "done" ? "success" : "warning"}>
                  {selectedTokenItem.paymentStatus === "done" ? "PAID / COLLECTED" : "UNPAID"}
                </Pill>
              </div>
            </div>

            {/* Print trigger simulator */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 rounded bg-teal-700 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
              >
                Print Ticket
              </button>
              <button
                type="button"
                onClick={() => setSelectedTokenItem(null)}
                className="flex-1 rounded border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                Close
              </button>
            </div>

          </div>
        </Modal>
      )}

    </main>
  );
};

export default ReceptionistDashboard;
