import { useEffect, useState } from "react";
import axiosInstance from "../api";
import AddTest from "../components/AddTest";
import StatReportsSection from "../components/StatReportsSection";
import { UseAuth } from "../custom_hook/UseAuth";

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
  };

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase ${colors[tone]}`}>{children}</span>;
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
    <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/95">
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        <IconButton icon="close" label="Close" onClick={onClose} />
      </header>
      <div className="p-6">{children}</div>
    </section>
  </div>
);

const LabDashboard = () => {
  const { user } = UseAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [lab, setLab] = useState(null);
  const [tests, setTests] = useState([]);
  const [testPatients, setTestPatients] = useState([]);
  const [editingTest, setEditingTest] = useState(null);
  const [reportItem, setReportItem] = useState(null);
  const [actionId, setActionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const loadDashboard = async () => {
    if (!user?.labId) {
      setMessage("Lab id is missing for this account.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const labRes = await axiosInstance.get(`/lab/getOneLab/${user.labId}`);
      const testRes = await axiosInstance.get("/test/getAllTests?includeDeleted=true");
      const patientRes = await axiosInstance.get("/medicine/labTestPatients");

      setLab(labRes.data.data);
      setTests(testRes.data.data || []);
      setTestPatients(patientRes.data.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to load lab dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.labId]);

  const navItems = [
    { id: "overview", label: "Overview", icon: "lab" },
    { id: "tests", label: "Tests", icon: "test" },
    { id: "patients", label: "Patients", icon: "user" },
    { id: "reports", label: "Reports", icon: "report" },
    { id: "addTest", label: "Add Test", icon: "test" },
  ];
  const selectTab = (tabId) => {
    setActiveTab(tabId);
    setMenuOpen(false);
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
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to update test.");
    } finally {
      setActionId("");
    }
  };

  const closeEdit = () => setEditingTest(null);
  const closeReport = () => setReportItem(null);

  const afterUpdate = async () => {
    closeEdit();
    await loadDashboard();
  };

  const afterReport = async (reportMessage) => {
    closeReport();
    setMessage(reportMessage);
    await loadDashboard();
  };

  const activeTests = tests.filter((test) => !test.isDeleted && test.status === "active").length;
  const inactiveTests = tests.filter((test) => !test.isDeleted && test.status !== "active").length;
  const deletedTests = tests.filter((test) => test.isDeleted).length;
  const pendingPatientTests = testPatients.reduce((total, item) => total + (item.tests || []).filter((test) => test.status !== "completed").length, 0);
  const completedPatientTests = testPatients.reduce((total, item) => total + (item.tests || []).filter((test) => test.status === "completed").length, 0);
  const statReports = [
    {
      id: "lab-overview",
      section: "Overview",
      title: "Lab Overview Report",
      description: "Lab profile and operational status report.",
      metrics: [
        { label: "Lab Code", value: lab?.labCode || "-" },
        { label: "Status", value: lab?.status || "-" },
        { label: "In-charge", value: lab?.inChargeName || user?.name || "-" },
        { label: "Timing", value: lab ? `${lab.openingTime || "-"} - ${lab.closingTime || "-"}` : "-" },
        { label: "Emergency", value: lab?.emergencyAvailable ? "Yes" : "No" },
        { label: "Home Collection", value: lab?.homeCollectionAvailable ? "Yes" : "No" },
      ],
    },
    {
      id: "lab-tests",
      section: "Tests",
      title: "Test Catalogue Report",
      description: "Active, inactive, and deleted test counts for this lab.",
      metrics: [
        { label: "Total Tests", value: tests.length },
        { label: "Active Tests", value: activeTests },
        { label: "Inactive Tests", value: inactiveTests },
        { label: "Deleted Tests", value: deletedTests },
      ],
      rows: tests.map((test) => ({
        date: test.createdAt || test.updatedAt,
        text: `${test.testName} | ${test.testCode || "-"} | Rs. ${test.amount || 0} | ${test.isDeleted ? "deleted" : test.status}`,
      })),
    },
    {
      id: "lab-patients",
      section: "Patients",
      title: "Test Patient Report",
      description: "Patients and pending/completed test workload.",
      metrics: [
        { label: "Patients", value: testPatients.length },
        { label: "Pending Tests", value: pendingPatientTests },
        { label: "Completed Tests", value: completedPatientTests },
      ],
      rows: testPatients.map((item) => ({
        date: item.appointment?.date || item.createdAt || item.updatedAt,
        text: `${item.appointment?.userId?.name || "Patient"} | ${item.appointment?.doctorId?.doctorName || "Doctor"} | ${(item.tests || []).length} test(s)`,
      })),
    },
  ];

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 text-left dark:bg-slate-950">
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside className="h-full w-80 max-w-[86vw] border-r border-slate-200 bg-white px-5 py-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950">
                  <Icon name="lab" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-slate-950 dark:text-white">{lab?.labName || user?.name || "Lab"}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Lab Dashboard</p>
                </div>
              </div>
              <IconButton icon="close" label="Close menu" onClick={() => setMenuOpen(false)} />
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`flex h-12 w-full items-center gap-3 rounded-md px-4 text-sm font-bold transition ${
                    activeTab === item.id
                      ? "bg-teal-700 text-white shadow-lg shadow-teal-900/10 dark:bg-teal-500 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <aside className="fixed bottom-0 left-0 top-[73px] z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white dark:bg-teal-500 dark:text-slate-950">
            <Icon name="lab" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-slate-950 dark:text-white">{lab?.labName || user?.name || "Lab"}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Lab Dashboard</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${
                activeTab === item.id
                  ? "bg-teal-700 text-white shadow-lg shadow-teal-900/10 dark:bg-teal-500 dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Tests</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{tests.length}</p>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Test Patients</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{testPatients.length}</p>
        </div>
      </aside>

      <section className="px-4 py-6 sm:px-6 lg:pl-80">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 lg:hidden"
                aria-label="Open lab navigation"
                aria-expanded={menuOpen}
              >
                <Icon name="menu" className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Lab workspace</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{lab?.labName || user?.name || "Lab Dashboard"}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Manage lab details and tests from one workspace.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {lab && <Pill tone={lab.status === "active" ? "success" : "warning"}>{lab.status}</Pill>}
              <button type="button" onClick={loadDashboard} className="h-10 rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-5 hidden gap-2 overflow-x-auto sm:flex lg:hidden">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => selectTab(item.id)} className={`h-10 rounded-md px-4 text-sm font-bold ${activeTab === item.id ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"}`}>
                {item.label}
              </button>
            ))}
          </div>
        </header>

        {message && <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">{message}</div>}

        {activeTab === "overview" && (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard icon="lab" label="Lab code" value={lab?.labCode} />
              <InfoCard icon="user" label="In-charge" value={lab?.inChargeName || user?.name} />
              <InfoCard icon="clock" label="Timing" value={lab ? `${lab.openingTime || "-"} - ${lab.closingTime || "-"}` : "-"} />
              <InfoCard icon="location" label="City" value={lab?.cityId?.cityName} />
              <InfoCard icon="test" label="Test Patients" value={testPatients.length} />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Contact</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoCard icon="user" label="Email" value={lab?.email || user?.email} />
                  <InfoCard icon="user" label="Phone" value={lab?.phone} />
                  <InfoCard icon="user" label="Alternate phone" value={lab?.alternatePhone} />
                  <InfoCard icon="location" label="Pincode" value={lab?.pincode} />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Availability</h2>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Emergency</span>
                    <Pill tone={lab?.emergencyAvailable ? "success" : "warning"}>{lab?.emergencyAvailable ? "Yes" : "No"}</Pill>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Home collection</span>
                    <Pill tone={lab?.homeCollectionAvailable ? "success" : "warning"}>{lab?.homeCollectionAvailable ? "Yes" : "No"}</Pill>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "tests" && (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Tests</h2>
            <div className="mt-5 grid gap-3">
              {tests.map((test) => (
                <div key={test._id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">{test.testName}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{test.testCode} | {test.category || "General"} | {test.sampleType || "Sample"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-950 dark:text-white">Rs. {test.amount || 0}</span>
                    <Pill tone={!test.isDeleted && test.status === "active" ? "success" : "warning"}>
                      {test.isDeleted ? "deleted" : test.status}
                    </Pill>
                    {!test.isDeleted && (
                      <>
                        <IconButton icon="edit" label="Edit test" onClick={() => setEditingTest(test)} />
                        <IconButton icon="archive" label="Soft delete test" tone="warning" disabled={actionId === test._id} onClick={() => runTestAction(test, "softDelete")} />
                      </>
                    )}
                    {test.isDeleted && (
                      <IconButton icon="restore" label="Restore test" tone="success" disabled={actionId === test._id} onClick={() => runTestAction(test, "restore")} />
                    )}
                    <IconButton icon="trash" label="Delete test permanently" tone="danger" disabled={actionId === test._id} onClick={() => runTestAction(test, "hardDelete")} />
                  </div>
                </div>
              ))}
              {!loading && tests.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No tests added yet.</div>}
            </div>
          </section>
        )}

        {activeTab === "patients" && (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Test patients</h2>
            <div className="mt-5 grid gap-3">
              {testPatients.map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                        {formatDate(item.appointment?.date)}
                      </p>
                      <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">
                        {item.appointment?.userId?.name || "Patient"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.appointment?.userId?.email || "-"} {item.appointment?.userId?.phone ? `| ${item.appointment.userId.phone}` : ""}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 md:text-right">
                      <p>{item.appointment?.doctorId?.doctorName || "Doctor"}</p>
                      <p>{item.appointment?.hospitalId?.hospitalName || "Hospital"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(item.tests || []).map((test, index) => (
                      <span key={index} className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                        {test.testName || test.testId?.testName || "Test"} - {test.status || "pending"}
                        {test.report?.fileUrl && (
                          <a href={test.report.fileUrl} target="_blank" rel="noreferrer" className="text-teal-900 underline dark:text-teal-100">
                            Image
                          </a>
                        )}
                        {test.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => setReportItem({ item, test })}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white"
                            title="Create report"
                          >
                            <Icon name="done" className="h-4 w-4" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {(item.diagnosis || item.symptoms || item.notes) && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <InfoCard icon="test" label="Symptoms" value={item.symptoms} />
                      <InfoCard icon="test" label="Diagnosis" value={item.diagnosis} />
                      <InfoCard icon="test" label="Notes" value={item.notes} />
                    </div>
                  )}
                </div>
              ))}
              {!loading && testPatients.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">No test patients yet.</div>}
            </div>
          </section>
        )}

        {activeTab === "addTest" && (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">Add test</h2>
            <div className="mt-5">
              <AddTest onCreated={loadDashboard} />
            </div>
          </section>
        )}

        {activeTab === "reports" && (
          <StatReportsSection
            title="Lab Reports"
            subtitle="Section-wise lab, test, and test-patient statistics."
            reports={statReports}
            loading={loading}
          />
        )}

        {editingTest && (
          <Modal title="Update test" onClose={closeEdit}>
            <AddTest editTest={editingTest} onUpdated={afterUpdate} />
          </Modal>
        )}

        {reportItem && (
          <Modal title="Create report" onClose={closeReport}>
            <ReportForm reportItem={reportItem} onCreated={afterReport} />
          </Modal>
        )}
      </section>
    </main>
  );
};

const ReportForm = ({ reportItem, onCreated }) => {
  const { item, test } = reportItem;
  const [form, setForm] = useState({
    reportName: test.testName || test.testId?.testName || "",
    reportType: "Lab Report",
    sampleType: test.testId?.sampleType || "",
    resultValue: "",
    normalRange: test.testId?.normalRange || "",
    unit: test.testId?.unit || "",
    result: "",
    impression: "",
    advice: "",
    technicianName: "",
    verifiedBy: "",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!(form.reportName.trim() && form.reportType.trim() && form.result.trim())) {
      setMessage("Report name, type and result are required");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const data = new FormData();
      data.append("hospitalId", item.appointment?.hospitalId?._id || item.appointment?.hospitalId || "");
      data.append("patientId", item.appointment?.userId?._id || item.appointment?.userId || "");
      data.append("doctorId", item.appointment?.doctorId?._id || item.appointment?.doctorId || "");
      data.append("appointmentId", item.appointment?._id || "");
      data.append("medicineId", item._id);
      data.append("testId", test.testId?._id || test.testId || "");
      data.append("reportName", form.reportName);
      data.append("reportType", form.reportType);
      data.append("patientName", item.appointment?.userId?.name || "");
      data.append("doctorName", item.appointment?.doctorId?.doctorName || "");
      data.append("testName", test.testName || test.testId?.testName || "");
      data.append("sampleType", form.sampleType);
      data.append("resultValue", form.resultValue);
      data.append("normalRange", form.normalRange);
      data.append("unit", form.unit);
      data.append("result", form.result);
      data.append("impression", form.impression);
      data.append("advice", form.advice);
      data.append("technicianName", form.technicianName);
      data.append("verifiedBy", form.verifiedBy);
      data.append("remarks", form.remarks);

      const response = await axiosInstance.post("/report/createReport", data);
      onCreated(response.data.message || "Report created successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to create report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">{message}</div>}

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Report name</span>
        <input value={form.reportName} onChange={(event) => updateField("reportName", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Report type</span>
        <input value={form.reportType} onChange={(event) => updateField("reportType", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Sample type</span>
          <input value={form.sampleType} onChange={(event) => updateField("sampleType", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Result value</span>
          <input value={form.resultValue} onChange={(event) => updateField("resultValue", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Normal range</span>
          <input value={form.normalRange} onChange={(event) => updateField("normalRange", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Unit</span>
          <input value={form.unit} onChange={(event) => updateField("unit", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Result</span>
        <textarea value={form.result} onChange={(event) => updateField("result", event.target.value)} rows={5} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Impression</span>
        <textarea value={form.impression} onChange={(event) => updateField("impression", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Advice</span>
        <textarea value={form.advice} onChange={(event) => updateField("advice", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Technician name</span>
          <input value={form.technicianName} onChange={(event) => updateField("technicianName", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Verified by</span>
          <input value={form.verifiedBy} onChange={(event) => updateField("verifiedBy", event.target.value)} className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Remarks</span>
        <textarea value={form.remarks} onChange={(event) => updateField("remarks", event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="h-11 rounded-md bg-teal-700 px-4 text-sm font-black text-white disabled:opacity-60 dark:bg-teal-400 dark:text-slate-950">
          {saving ? "Saving..." : "Save Report"}
        </button>
      </div>
    </form>
  );
};

export default LabDashboard;
