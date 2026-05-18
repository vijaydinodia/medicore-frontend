import { useState } from "react";
import axiosInstance from "../api";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getApiErrorMessage = (error) => {
  const data = error.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || error.message || "Unable to create doctor.";
};

const AddDoctor = ({ hospitalId, departments = [], subDepartments = [], onCreated }) => {
  const [form, setForm] = useState({
    departmentId: "",
    subDepartmentId: "",
    doctorName: "",
    doctorCode: "",
    email: "",
    phone: "",
    gender: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    licenseNumber: "",
    startTime: "",
    endTime: "",
    availableDays: [],
    emergencyAvailable: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [doctorImages, setDoctorImages] = useState([]);
  const [doctorFiles, setDoctorFiles] = useState([]);

  const filteredSubDepartments = subDepartments.filter((item) => {
    const departmentId = item.departmentId?._id || item.departmentId;
    return !form.departmentId || departmentId === form.departmentId;
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "departmentId" ? { subDepartmentId: "" } : {}),
    }));
    setError("");
    setMessage("");
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((item) => item !== day)
        : [...prev.availableDays, day],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hospitalId) return setError("Hospital id is missing.");
    if (!(form.departmentId && form.doctorName.trim() && form.doctorCode.trim() && form.email.trim() && form.phone.trim() && form.specialization.trim() && form.qualification.trim() && form.licenseNumber.trim())) {
      return setError("Please complete all required doctor fields.");
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("hospitalId", hospitalId);
      payload.append("departmentId", form.departmentId);
      payload.append("subDepartmentId", form.subDepartmentId || "");
      payload.append("doctorName", form.doctorName.trim());
      payload.append("doctorCode", form.doctorCode.trim());
      payload.append("email", form.email.trim().toLowerCase());
      payload.append("phone", form.phone.trim());
      payload.append("gender", form.gender || "");
      payload.append("specialization", form.specialization.trim());
      payload.append("qualification", form.qualification.trim());
      payload.append("experience", Number(form.experience) || 0);
      payload.append("consultationFee", Number(form.consultationFee) || 0);
      payload.append("licenseNumber", form.licenseNumber.trim());
      payload.append("availableDays", JSON.stringify(form.availableDays));
      payload.append("availableTime", JSON.stringify({ startTime: form.startTime, endTime: form.endTime }));
      payload.append("emergencyAvailable", form.emergencyAvailable);
      payload.append("status", "active");
      if (profileImageFile) payload.append("profileImage", profileImageFile);
      doctorImages.forEach((file) => payload.append("doctorImages", file));
      doctorFiles.forEach((file) => payload.append("doctorFiles", file));

      const response = await axiosInstance.post("/doctor/createDoctor", payload);
      setMessage(response.data.message || "Doctor created successfully.");
      setForm({
        departmentId: "",
        subDepartmentId: "",
        doctorName: "",
        doctorCode: "",
        email: "",
        phone: "",
        gender: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        licenseNumber: "",
        startTime: "",
        endTime: "",
        availableDays: [],
        emergencyAvailable: false,
      });
      setProfileImageFile(null);
      setDoctorImages([]);
      setDoctorFiles([]);
      onCreated?.(response.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
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
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Department</label>
          <select name="departmentId" value={form.departmentId} onChange={handleChange} className={inputClass}>
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>{department.departmentName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Subdepartment</label>
          <select name="subDepartmentId" value={form.subDepartmentId} onChange={handleChange} className={inputClass}>
            <option value="">Optional</option>
            {filteredSubDepartments.map((subDepartment) => (
              <option key={subDepartment._id} value={subDepartment._id}>{subDepartment.subDepartmentName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Doctor name</label>
          <input name="doctorName" value={form.doctorName} onChange={handleChange} className={inputClass} placeholder="Dr. Riya Mehta" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Doctor code</label>
          <input name="doctorCode" value={form.doctorCode} onChange={handleChange} className={inputClass} placeholder="DOC-001" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="doctor@hospital.com" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="9876543210" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Specialization</label>
          <input name="specialization" value={form.specialization} onChange={handleChange} className={inputClass} placeholder="Cardiologist" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Qualification</label>
          <input name="qualification" value={form.qualification} onChange={handleChange} className={inputClass} placeholder="MBBS, MD" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">License number</label>
          <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className={inputClass} placeholder="MCI-12345" />
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
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Experience</label>
          <input type="number" name="experience" value={form.experience} onChange={handleChange} className={inputClass} placeholder="6" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Consultation fee</label>
          <input type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange} className={inputClass} placeholder="800" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Start time</label>
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">End time</label>
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Profile photo</label>
          <input type="file" accept="image/*" onChange={(event) => setProfileImageFile(event.target.files?.[0] || null)} className={inputClass} />
          {profileImageFile && <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-400">{profileImageFile.name}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Doctor photos</label>
          <input type="file" accept="image/*" multiple onChange={(event) => setDoctorImages(Array.from(event.target.files || []))} className={inputClass} />
          {doctorImages.length > 0 && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{doctorImages.length} photo(s) selected</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Other files</label>
          <input type="file" multiple onChange={(event) => setDoctorFiles(Array.from(event.target.files || []))} className={inputClass} />
          {doctorFiles.length > 0 && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{doctorFiles.length} file(s) selected</p>}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Available days</p>
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-md border px-3 py-2 text-sm font-bold transition ${form.availableDays.includes(day) ? "border-teal-700 bg-teal-700 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-slate-950" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"}`}>
              {day}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <input type="checkbox" name="emergencyAvailable" checked={form.emergencyAvailable} onChange={handleChange} className="rounded border-slate-300 text-teal-700" />
        Emergency availability
      </label>

      <button type="submit" disabled={loading} className="h-11 w-full rounded-md bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-teal-400 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400">
        {loading ? "Saving..." : "Save doctor"}
      </button>
    </form>
  );
};

export default AddDoctor;
