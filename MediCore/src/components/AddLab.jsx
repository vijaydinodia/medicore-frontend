import { useEffect, useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const AddLab = ({ onCreated }) => {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    cityId: "",
    labName: "",
    labCode: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    pincode: "",
    inChargeName: "",
    totalStaff: "",
    openingTime: "",
    closingTime: "",
    emergencyAvailable: false,
    homeCollectionAvailable: false,
    description: "",
  });
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
      } catch (err) {
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

    if (!(form.cityId && form.labName.trim() && form.labCode.trim() && form.email.trim() && form.phone.trim())) {
      return setError("City, lab name, lab code, email and phone are required.");
    }

    try {
      setLoading(true);
      const payload = {
        cityId: form.cityId,
        labName: form.labName.trim(),
        labCode: form.labCode.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        inChargeName: form.inChargeName.trim(),
        totalStaff: Number(form.totalStaff) || 0,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        emergencyAvailable: form.emergencyAvailable,
        homeCollectionAvailable: form.homeCollectionAvailable,
        description: form.description.trim(),
        status: "active",
      };

      const res = await axiosInstance.post("/lab/createLab", payload);
      setMessage(res.data.message || "Lab created successfully.");
      setForm({
        cityId: "",
        labName: "",
        labCode: "",
        email: "",
        phone: "",
        alternatePhone: "",
        address: "",
        pincode: "",
        inChargeName: "",
        totalStaff: "",
        openingTime: "",
        closingTime: "",
        emergencyAvailable: false,
        homeCollectionAvailable: false,
        description: "",
      });
      onCreated?.(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create lab.");
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
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
          <select name="cityId" value={form.cityId} onChange={handleChange} className={inputClass}>
            <option value="">{activeCities.length ? "Select active city" : "No active cities available"}</option>
            {activeCities.map((city) => (
              <option key={city._id} value={city._id}>{city.cityName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Lab name</label>
          <input name="labName" value={form.labName} onChange={handleChange} className={inputClass} placeholder="MediCore Diagnostics" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Lab code</label>
          <input name="labCode" value={form.labCode} onChange={handleChange} className={inputClass} placeholder="LAB-001" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">In-charge name</label>
          <input name="inChargeName" value={form.inChargeName} onChange={handleChange} className={inputClass} placeholder="Anita Sharma" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="lab@hospital.com" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="9876543210" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Alternate phone</label>
          <input name="alternatePhone" value={form.alternatePhone} onChange={handleChange} className={inputClass} placeholder="Optional" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Pincode</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} className={inputClass} placeholder="380001" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Total staff</label>
          <input type="number" name="totalStaff" value={form.totalStaff} onChange={handleChange} className={inputClass} placeholder="12" />
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
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
        <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Floor, building, area" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950" placeholder="Short lab profile" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <input type="checkbox" name="emergencyAvailable" checked={form.emergencyAvailable} onChange={handleChange} className="rounded border-slate-300 text-teal-700" />
          Emergency available
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <input type="checkbox" name="homeCollectionAvailable" checked={form.homeCollectionAvailable} onChange={handleChange} className="rounded border-slate-300 text-teal-700" />
          Home collection
        </label>
      </div>

      <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
        {loading ? "Saving..." : "Save lab"}
      </button>
    </form>
  );
};

export default AddLab;
