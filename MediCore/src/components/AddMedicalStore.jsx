import { useEffect, useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const emptyForm = {
  cityId: "",
  medicalName: "",
  medicalCode: "",
  email: "",
  phone: "",
  alternatePhone: "",
  address: "",
  pincode: "",
  inChargeName: "",
  licenseNumber: "",
  openingTime: "",
  closingTime: "",
  deliveryAvailable: false,
  emergencyAvailable: false,
  description: "",
};

const AddMedicalStore = ({ onCreated }) => {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeCities = cities.filter((city) => {
    return city.status === "active" && city.districtId?.status === "active" && city.districtId?.stateId?.status === "active";
  });

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await axiosInstance.get("/location/city/getAllCity");
        setCities(res.data.data || []);
      } catch {
        setError("Unable to load cities.");
      }
    };

    loadCities();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!(form.cityId && form.medicalName.trim() && form.medicalCode.trim() && form.email.trim() && form.phone.trim())) {
      return setError("City, medical name, medical code, email and phone are required.");
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        medicalName: form.medicalName.trim(),
        medicalCode: form.medicalCode.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        inChargeName: form.inChargeName.trim(),
        licenseNumber: form.licenseNumber.trim(),
        description: form.description.trim(),
        status: "active",
      };

      const res = await axiosInstance.post("/medical/createMedicalStore", payload);
      setMessage(res.data.message || "Medical store created successfully.");
      setForm(emptyForm);
      onCreated?.(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create medical store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</div>}
      {message && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City">
          <select name="cityId" value={form.cityId} onChange={handleChange} className={inputClass}>
            <option value="">{activeCities.length ? "Select active city" : "No active cities available"}</option>
            {activeCities.map((city) => (
              <option key={city._id} value={city._id}>{city.cityName}</option>
            ))}
          </select>
        </Field>
        <Input label="Medical name" name="medicalName" value={form.medicalName} onChange={handleChange} placeholder="MediCore Pharmacy" />
        <Input label="Medical code" name="medicalCode" value={form.medicalCode} onChange={handleChange} placeholder="MED-001" />
        <Input label="In-charge name" name="inChargeName" value={form.inChargeName} onChange={handleChange} placeholder="Rahul Shah" />
        <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="medical@hospital.com" />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" />
        <Input label="Alternate phone" name="alternatePhone" value={form.alternatePhone} onChange={handleChange} placeholder="Optional" />
        <Input label="License number" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="DL-2026-001" />
        <Input label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="380001" />
        <Input label="Opening time" type="time" name="openingTime" value={form.openingTime} onChange={handleChange} />
        <Input label="Closing time" type="time" name="closingTime" value={form.closingTime} onChange={handleChange} />
      </div>

      <Input label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Floor, building, area" />

      <Field label="Description">
        <textarea name="description" value={form.description} onChange={handleChange} className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950" placeholder="Short medical profile" />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <input type="checkbox" name="deliveryAvailable" checked={form.deliveryAvailable} onChange={handleChange} className="rounded border-slate-300 text-teal-700" />
          Delivery available
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <input type="checkbox" name="emergencyAvailable" checked={form.emergencyAvailable} onChange={handleChange} className="rounded border-slate-300 text-teal-700" />
          Emergency counter
        </label>
      </div>

      <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
        {loading ? "Saving..." : "Save medical and send credentials"}
      </button>
    </form>
  );
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
    {children}
  </label>
);

const Input = ({ label, ...props }) => (
  <Field label={label}>
    <input {...props} className={inputClass} />
  </Field>
);

export default AddMedicalStore;
