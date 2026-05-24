import { useState } from "react";
import { createPortal } from "react-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import axiosInstance from "../api";

const ChangePassword = ({ triggerClassName = "", onOpened }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openForm = () => {
    setForm({ currentPassword: "", newPassword: "" });
    setMessage("");
    setError("");
    setOpen(true);
    onOpened?.();
  };

  const closeForm = () => {
    if (!loading) setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!(form.currentPassword && form.newPassword)) {
      setError("Please enter both passwords.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.patch("/user/changePassword", form);
      setMessage(response.data.message || "Password updated successfully.");
      setTimeout(() => setOpen(false), 600);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

  return (
    <>
      <button type="button" onClick={openForm} className={triggerClassName}>
        <LockResetRoundedIcon className="!h-4 !w-4" aria-hidden="true" />
        Reset password
      </button>

      {open &&
        createPortal(
        <div data-account-dialog="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={closeForm}>
          <section
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Reset password</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your signed-in account password.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-xl leading-none text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Close password form"
              >
                <CloseRoundedIcon className="!h-5 !w-5" aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</div>}
              {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}

              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Current password</span>
                <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} className={`mt-2 ${inputClass}`} autoComplete="current-password" />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">New password</span>
                <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} className={`mt-2 ${inputClass}`} autoComplete="new-password" />
              </label>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <button type="button" onClick={closeForm} disabled={loading} className="h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="h-11 rounded-md border border-teal-700 bg-teal-700 px-5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60 dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
                  {loading ? "Saving..." : "Save password"}
                </button>
              </div>
            </form>
          </section>
        </div>,
          document.body,
        )}
    </>
  );
};

export default ChangePassword;
