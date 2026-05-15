import { useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const AddSubDepartment = ({ hospitalId, departments = [], onCreated }) => {
  const [form, setForm] = useState({
    departmentId: "",
    subDepartmentName: "",
    subDepartmentCode: "",
    description: "",
    consultationFee: "",
    roomNumber: "",
    openingTime: "",
    closingTime: "",
    services: "",
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

    if (!hospitalId) return setError("Hospital id is missing.");
    if (!(form.departmentId && form.subDepartmentName.trim() && form.subDepartmentCode.trim())) {
      return setError("Department, subdepartment name, and code are required.");
    }

    try {
      setLoading(true);
      const payload = {
        hospitalId,
        departmentId: form.departmentId,
        subDepartmentName: form.subDepartmentName.trim(),
        subDepartmentCode: form.subDepartmentCode.trim(),
        description: form.description.trim(),
        consultationFee: Number(form.consultationFee) || 0,
        roomNumber: form.roomNumber.trim(),
        timings: {
          openingTime: form.openingTime,
          closingTime: form.closingTime,
        },
        services: form.services
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        isEmergencyAvailable: form.isEmergencyAvailable,
        status: "active",
      };

      const response = await axiosInstance.post("/sub-department/createSubDepartment", payload);
      setMessage(response.data.message || "Subdepartment created successfully.");
      setForm({
        departmentId: "",
        subDepartmentName: "",
        subDepartmentCode: "",
        description: "",
        consultationFee: "",
        roomNumber: "",
        openingTime: "",
        closingTime: "",
        services: "",
        isEmergencyAvailable: false,
      });
      onCreated?.(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create subdepartment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
      {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</div>}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Parent department</label>
        <select name="departmentId" value={form.departmentId} onChange={handleChange} className={inputClass}>
          <option value="">Select department</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.departmentName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Subdepartment name</label>
          <input name="subDepartmentName" value={form.subDepartmentName} onChange={handleChange} className={inputClass} placeholder="Interventional Cardiology" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Subdepartment code</label>
          <input name="subDepartmentCode" value={form.subDepartmentCode} onChange={handleChange} className={inputClass} placeholder="ICARD-001" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Room number</label>
          <input name="roomNumber" value={form.roomNumber} onChange={handleChange} className={inputClass} placeholder="B-102" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Consultation fee</label>
          <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange} className={inputClass} placeholder="700" />
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
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Services</label>
        <input name="services" value={form.services} onChange={handleChange} className={inputClass} placeholder="Angioplasty, Pacemaker clinic" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950" placeholder="Short subdepartment profile" />
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input type="checkbox" name="isEmergencyAvailable" checked={form.isEmergencyAvailable} onChange={handleChange} className="rounded border-slate-300 text-teal-700" />
        Emergency services available
      </label>

      <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
        {loading ? "Saving..." : "Save subdepartment"}
      </button>
    </form>
  );
};

export default AddSubDepartment;
