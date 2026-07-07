import { useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const AddReceptionist = ({ hospitalId, onCreated }) => {
  const [form, setForm] = useState({
    receptionistName: "",
    receptionistCode: "",
    email: "",
    phone: "",
    alternatePhone: "",
    gender: "",
    dateOfBirth: "",
    qualification: "",
    experience: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hospitalId) return setError("Hospital id is missing.");
    if (!(form.receptionistName.trim() && form.receptionistCode.trim() && form.email.trim() && form.phone.trim())) {
      return setError("Name, Code, Email and Phone are required.");
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("hospitalId", hospitalId);
      payload.append("receptionistName", form.receptionistName.trim());
      payload.append("receptionistCode", form.receptionistCode.trim());
      payload.append("email", form.email.trim().toLowerCase());
      payload.append("phone", form.phone.trim());
      payload.append("alternatePhone", form.alternatePhone.trim());
      payload.append("gender", form.gender);
      payload.append("dateOfBirth", form.dateOfBirth);
      payload.append("qualification", form.qualification.trim());
      payload.append("experience", Number(form.experience) || 0);
      payload.append("address", form.address.trim());
      payload.append("status", "active");

      if (profileImageFile) {
        payload.append("profileImage", profileImageFile);
      }

      const res = await axiosInstance.post("/receptionist/createReceptionist", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message || "Receptionist account created successfully.");
      setForm({
        receptionistName: "",
        receptionistCode: "",
        email: "",
        phone: "",
        alternatePhone: "",
        gender: "",
        dateOfBirth: "",
        qualification: "",
        experience: "",
        address: "",
      });
      setProfileImageFile(null);
      onCreated?.(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create receptionist.");
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
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Receptionist name</label>
          <input name="receptionistName" value={form.receptionistName} onChange={handleChange} className={inputClass} placeholder="Aisha Patel" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Receptionist code</label>
          <input name="receptionistCode" value={form.receptionistCode} onChange={handleChange} className={inputClass} placeholder="REC-001" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="receptionist@hospital.com" />
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
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Date of birth</label>
          <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Qualification</label>
          <input name="qualification" value={form.qualification} onChange={handleChange} className={inputClass} placeholder="B.Com, BBA" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Experience (years)</label>
          <input type="number" name="experience" value={form.experience} onChange={handleChange} className={inputClass} placeholder="2" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Profile photo</label>
          <input type="file" accept="image/*" onChange={(event) => setProfileImageFile(event.target.files?.[0] || null)} className={inputClass} />
          {profileImageFile && <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">{profileImageFile.name}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Address</label>
        <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Street, city, etc." />
      </div>

      <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
        {loading ? "Saving..." : "Save receptionist"}
      </button>
    </form>
  );
};

export default AddReceptionist;
