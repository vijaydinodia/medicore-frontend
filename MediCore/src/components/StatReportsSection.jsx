import { useMemo, useState } from "react";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import axiosInstance from "../api";

const getRowText = (row) => (typeof row === "string" ? row : row?.text || "-");

const getRowDateValue = (row) => {
  const value = typeof row === "string" ? "" : row?.date || row?.createdAt || "";
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const isWithinRange = (row, fromDate, toDate) => {
  const rowDate = getRowDateValue(row);
  if (!rowDate) return true;
  if (fromDate && rowDate < fromDate) return false;
  if (toDate && rowDate > toDate) return false;
  return true;
};

const withFilteredRows = (report, fromDate, toDate) => {
  const hasRange = Boolean(fromDate || toDate);
  const rows = (report.rows || []).filter((row) => isWithinRange(row, fromDate, toDate));

  return {
    ...report,
    dateRange: { from: fromDate, to: toDate },
    metrics: hasRange
      ? [
          ...(report.metrics || []),
          { label: "Filtered From", value: fromDate || "Start" },
          { label: "Filtered To", value: toDate || "Today" },
          { label: "Matching Rows", value: rows.length },
        ]
      : report.metrics,
    rows,
  };
};

const StatReportsSection = ({ title = "Reports", subtitle = "Section-wise dashboard stat reports.", reports = [], loading = false }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [downloadId, setDownloadId] = useState("");
  const [message, setMessage] = useState("");
  const invalidRange = Boolean(fromDate && toDate && fromDate > toDate);
  const filteredReports = useMemo(
    () => reports.map((report) => withFilteredRows(report, fromDate, toDate)),
    [reports, fromDate, toDate],
  );

  const downloadReport = async (report) => {
    if (invalidRange) return;

    try {
      setDownloadId(report.id);
      setMessage("");
      const response = await axiosInstance.post(
        "/stat-report/download",
        {
          report,
          fromDate,
          toDate,
        },
        {
          responseType: "blob",
        },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = String(report.title || "stat-report").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "stat-report";

      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to download report.");
    } finally {
      setDownloadId("");
    }
  };

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] lg:min-w-[28rem]">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">From</span>
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-teal-950" />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">To</span>
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-teal-950" />
          </label>
          <button type="button" onClick={() => { setFromDate(""); setToDate(""); }} className="h-10 self-end rounded-md border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
            Clear
          </button>
        </div>
      </div>

      {invalidRange && (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          From date must be before To date.
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {message}
        </div>
      )}

    <div className="mt-5 grid gap-4 xl:grid-cols-2">
      {loading ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <AssessmentRoundedIcon className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">No stat reports available.</p>
        </div>
      ) : (
        filteredReports.map((report) => (
          <article key={report.id} className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">{report.section || "Stats"}</p>
                <h3 className="mt-1 break-words text-lg font-black text-slate-950 dark:text-white">{report.title}</h3>
                {report.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{report.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => downloadReport(report)}
                disabled={invalidRange || downloadId === report.id}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-teal-200 bg-white text-teal-800 transition hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-950 dark:text-teal-200 dark:hover:bg-teal-950/40"
                aria-label={downloadId === report.id ? "Downloading PDF" : "Download PDF"}
                title={downloadId === report.id ? "Downloading PDF" : "Download PDF"}
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
                  <p key={`${report.id}-${index}`} className="break-words rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">{getRowText(row)}</p>
                ))}
              </div>
            )}
          </article>
        ))
      )}
    </div>
    </section>
  );
};

export default StatReportsSection;
