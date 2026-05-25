import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import { downloadStatReportPdf } from "../utils/statReportPdf";

const StatReportsSection = ({ title = "Reports", subtitle = "Section-wise dashboard stat reports.", reports = [], loading = false }) => (
  <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
    <div className="min-w-0">
      <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>

    <div className="mt-5 grid gap-4 xl:grid-cols-2">
      {loading ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <AssessmentRoundedIcon className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No stat reports available.</p>
        </div>
      ) : (
        reports.map((report) => (
          <article key={report.id} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{report.section || "Stats"}</p>
                <h3 className="mt-1 break-words text-lg font-black text-slate-950 dark:text-white">{report.title}</h3>
                {report.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{report.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => downloadStatReportPdf(report)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-teal-200 bg-white text-teal-800 transition hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-950 dark:text-teal-200 dark:hover:bg-teal-950/40"
                aria-label="Download PDF"
                title="Download PDF"
              >
                <DownloadRoundedIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(report.metrics || []).map((metric) => (
                <div key={metric.label} className="min-w-0 rounded-md bg-white p-3 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-1 break-words text-xl font-black text-slate-950 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>

            {(report.rows || []).length > 0 && (
              <div className="mt-4 space-y-2">
                {report.rows.slice(0, 5).map((row, index) => (
                  <p key={`${report.id}-${index}`} className="break-words rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">{row}</p>
                ))}
              </div>
            )}
          </article>
        ))
      )}
    </div>
  </section>
);

export default StatReportsSection;
