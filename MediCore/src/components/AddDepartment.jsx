import { useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const AddDepartment = ({ hospitalId, onCreated }) => {
  const [form, setForm] = useState({
    departmentName: "",
    departmentCode: "",
    description: "",
    totalDoctors: "",
    totalStaff: "",
    consultationFee: "",
    roomNumber: "",
    openingTime: "",
    closingTime: "",
    facilities: "",
    isEmergencyAvailable: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hospitalId) {
      return setError("Hospital id is missing. Please login with a hospital account.");
    }

    if (!(form.departmentName.trim() && form.departmentCode.trim())) {
      return setError("Department name and code are required.");
    }

    try {
      setLoading(true);
      const payload = {
        hospitalId,
        departmentName: form.departmentName.trim(),
        departmentCode: form.departmentCode.trim(),
        description: form.description.trim(),
        totalDoctors: Number(form.totalDoctors) || 0,
        totalStaff: Number(form.totalStaff) || 0,
        consultationFee: Number(form.consultationFee) || 0,
        roomNumber: form.roomNumber.trim(),
        timings: {
          openingTime: form.openingTime,
          closingTime: form.closingTime,
        },
        facilities: form.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isEmergencyAvailable: form.isEmergencyAvailable,
        status: "active",
      };

      const response = await axiosInstance.post("/department/createDepartment", payload);
      setMessage(response.data.message || "Department created successfully.");
      setForm({
        departmentName: "",
        departmentCode: "",
        description: "",
        totalDoctors: "",
        totalStaff: "",
        consultationFee: "",
        roomNumber: "",
        openingTime: "",
        closingTime: "",
        facilities: "",
        isEmergencyAvailable: false,
      });
      onCreated?.(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create department.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
      {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Department name</label>
          <input name="departmentName" value={form.departmentName} onChange={handleChange} className={inputClass} placeholder="Cardiology" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Department code</label>
          <input name="departmentCode" value={form.departmentCode} onChange={handleChange} className={inputClass} placeholder="CARD-001" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Room number</label>
          <input name="roomNumber" value={form.roomNumber} onChange={handleChange} className={inputClass} placeholder="A-204" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Consultation fee</label>
          <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange} className={inputClass} placeholder="500" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Total doctors</label>
          <input type="number" name="totalDoctors" value={form.totalDoctors} onChange={handleChange} className={inputClass} placeholder="8" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Total staff</label>
          <input type="number" name="totalStaff" value={form.totalStaff} onChange={handleChange} className={inputClass} placeholder="16" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Opening time</label>
          <input type="time" name="openingTime" value={form.openingTime} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Closing time</label>
          <input type="time" name="closingTime" value={form.closingTime} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Facilities</label>
        <input name="facilities" value={form.facilities} onChange={handleChange} className={inputClass} placeholder="ECG, ICU support, Cath lab" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950" placeholder="Short department profile" />
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input type="checkbox" name="isEmergencyAvailable" checked={form.isEmergencyAvailable} onChange={handleChange} className="rounded border-slate-300 text-teal-700" />
        Emergency services available
      </label>

      <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
        {loading ? "Saving..." : "Save department"}
      </button>
    </form>
  );
};

export default AddDepartment;
