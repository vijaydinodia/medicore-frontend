import { useEffect, useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const emptyForm = {
  labId: "",
  testName: "",
  testCode: "",
  category: "",
  sampleType: "",
  normalRange: "",
  unit: "",
  amount: "",
  reportTime: "",
  instructions: "",
};

const getId = (value) => value?._id || value || "";

const AddTest = ({ labs = [], editTest = null, onCreated, onUpdated }) => {
  const [form, setForm] = useState({
    ...emptyForm,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isEdit = Boolean(editTest?._id);

  useEffect(() => {
    if (!editTest) {
      setForm({ ...emptyForm });
      return;
    }

    setForm({
      labId: getId(editTest.labId),
      testName: editTest.testName || "",
      testCode: editTest.testCode || "",
      category: editTest.category || "",
      sampleType: editTest.sampleType || "",
      normalRange: editTest.normalRange || "",
      unit: editTest.unit || "",
      amount: editTest.amount || "",
      reportTime: editTest.reportTime || "",
      instructions: editTest.instructions || "",
    });
  }, [editTest]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!(form.testName.trim() && form.testCode.trim())) {
      return setError("Test name and test code are required.");
    }

    if (labs.length && !form.labId) {
      return setError("Please select lab.");
    }

    try {
      setLoading(true);

      const payload = {
        labId: form.labId,
        testName: form.testName.trim(),
        testCode: form.testCode.trim(),
        category: form.category.trim(),
        sampleType: form.sampleType.trim(),
        normalRange: form.normalRange.trim(),
        unit: form.unit.trim(),
        amount: Number(form.amount) || 0,
        reportTime: form.reportTime.trim(),
        instructions: form.instructions.trim(),
        status: "active",
      };

      const res = isEdit
        ? await axiosInstance.patch(`/test/updateTest/${editTest._id}`, payload)
        : await axiosInstance.post("/test/createTest", payload);

      setMessage(res.data.message || (isEdit ? "Test updated successfully." : "Test created successfully."));
      if (!isEdit) {
        setForm({ ...emptyForm });
        onCreated?.(res.data.data);
      } else {
        onUpdated?.(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
      {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        {labs.length > 0 && (
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Lab</label>
            <select name="labId" value={form.labId} onChange={handleChange} className={inputClass}>
              <option value="">Select lab</option>
              {labs.map((lab) => (
                <option key={lab._id} value={lab._id}>{lab.labName}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Test name</label>
          <input name="testName" value={form.testName} onChange={handleChange} className={inputClass} placeholder="Complete Blood Count" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Test code</label>
          <input name="testCode" value={form.testCode} onChange={handleChange} className={inputClass} placeholder="CBC-001" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
          <input name="category" value={form.category} onChange={handleChange} className={inputClass} placeholder="Hematology" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Sample type</label>
          <input name="sampleType" value={form.sampleType} onChange={handleChange} className={inputClass} placeholder="Blood" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Normal range</label>
          <input name="normalRange" value={form.normalRange} onChange={handleChange} className={inputClass} placeholder="4.5 - 11.0" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Unit</label>
          <input name="unit" value={form.unit} onChange={handleChange} className={inputClass} placeholder="cells/mcL" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} className={inputClass} placeholder="500" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Report time</label>
          <input name="reportTime" value={form.reportTime} onChange={handleChange} className={inputClass} placeholder="24 hours" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Instructions</label>
        <textarea name="instructions" value={form.instructions} onChange={handleChange} className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950" placeholder="Fasting required, sample handling notes" />
      </div>

      <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
        {loading ? "Saving..." : isEdit ? "Update test" : "Save test"}
      </button>
    </form>
  );
};

export default AddTest;
