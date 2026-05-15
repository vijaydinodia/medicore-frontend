import { useMemo } from "react";
import { getAuthInfo } from "../custom_hook/useAuth";

const Stat = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
  </div>
);

const DoctorDashboard = () => {
  const { user } = getAuthInfo();
  const displayName = user?.name || user?.doctorName || "Doctor";

  const schedule = useMemo(
    () => [
      { time: "09:00 AM", patient: "Morning consultations", status: "Ready" },
      { time: "12:30 PM", patient: "Follow-up queue", status: "Pending" },
      { time: "04:00 PM", patient: "Evening OPD", status: "Scheduled" },
    ],
    [],
  );

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-800 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Doctor workspace</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Welcome, {displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Review your current availability, patient queue, and clinical work for the day.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              {user?.status || "active"}
            </span>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat label="Today appointments" value="24" />
          <Stat label="Pending reports" value="7" />
          <Stat label="Emergency availability" value="On" />
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Today schedule</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <div className="mt-5 divide-y divide-slate-200 dark:divide-slate-800">
            {schedule.map((item) => (
              <div key={item.time} className="grid gap-2 py-4 sm:grid-cols-[120px_1fr_120px] sm:items-center">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{item.time}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.patient}</p>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{item.status}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default DoctorDashboard;
