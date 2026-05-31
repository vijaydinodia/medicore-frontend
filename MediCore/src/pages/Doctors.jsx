import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import SearchInput from "../components/SearchInput";
import { getAuthInfo } from "../custom_hook/UseAuth";

const getId = (value) => {
  if (!value) return "";
  return value._id || value;
};

const getDoctorImage = (doctor) => {
  return doctor.profileImage || doctor.doctorImage?.profileImage || "";
};

const getDoctorPhotos = (doctor) => {
  return (doctor.files || []).filter((file) => file?.category === "image" && file?.url);
};

const Doctors = () => {
  const navigate = useNavigate();
  const auth = getAuthInfo();
  const user = auth.user;
  const hospitalId = getId(user?.hospitalId);
  const isHospitalUser = user?.role === "hospital" || (user?.role === "admin" && user?.hospitalId);

  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("doctorName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isHospitalUser) {
      navigate(auth.dashboardPath, { replace: true });
    }
  }, [auth.isAuthenticated, auth.dashboardPath, isHospitalUser, navigate]);

  const fetchDoctors = async () => {
    if (!isHospitalUser || !hospitalId) return;

    try {
      setLoading(true);
      setMessage("");
      const response = await axiosInstance.get("/doctor/getAllDoctors");
      setDoctors(response.data.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [hospitalId, isHospitalUser]);

  const search = searchTerm.trim().toLowerCase();
  const visibleDoctors = doctors
    .filter((doctor) => {
      if (getId(doctor.hospitalId) !== hospitalId) return false;
      if (statusFilter !== "all" && doctor.status !== statusFilter) return false;
      if (!search) return true;

      const values = [
        doctor.doctorName,
        doctor.doctorCode,
        doctor.email,
        doctor.phone,
        doctor.specialization,
        doctor.qualification,
        doctor.licenseNumber,
        doctor.departmentId?.departmentName,
        doctor.subDepartmentId?.subDepartmentName,
        doctor.status,
      ];

      return values.some((value) => String(value || "").toLowerCase().includes(search));
    })
    .sort((a, b) => {
      const getValue = (doctor) => {
        if (sortKey === "department") return doctor.departmentId?.departmentName || "";
        return doctor[sortKey] || "";
      };

      return String(getValue(a)).localeCompare(String(getValue(b)), undefined, { numeric: true }) * (sortDirection === "asc" ? 1 : -1);
    });

  const changeSort = (key) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Clinical team
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Doctors</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Review active doctors, departments, schedules, and contact details for this hospital.
          </p>
        </header>

        <section className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search doctors" className="max-w-xl" />
          <label className="block">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-2 h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => changeSort("doctorName")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Name</button>
            <button type="button" onClick={() => changeSort("specialization")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Specialization</button>
            <button type="button" onClick={() => changeSort("department")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Department</button>
          </div>
        </section>

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}

            {visibleDoctors.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-3">
                {searchTerm ? "No doctors match your search." : "No doctors added for this hospital yet."}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

const DoctorCard = ({ doctor }) => {
  const image = getDoctorImage(doctor);
  const photos = getDoctorPhotos(doctor);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-700 text-lg font-black text-white dark:bg-teal-500 dark:text-slate-950">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            (doctor.doctorName || "D").slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-slate-950 dark:text-white">{doctor.doctorName}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{doctor.specialization}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              {doctor.status || "active"}
            </span>
          </div>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.slice(0, 3).map((photo, index) => (
            <a key={photo._id || photo.url} href={photo.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <img src={photo.url} alt={`${doctor.doctorName || "Doctor"} photo ${index + 1}`} className="h-20 w-full object-cover" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <p><span className="font-bold text-slate-900 dark:text-white">Department:</span> {doctor.departmentId?.departmentName || "Not assigned"}</p>
        <p><span className="font-bold text-slate-900 dark:text-white">Subdepartment:</span> {doctor.subDepartmentId?.subDepartmentName || "Not assigned"}</p>
        <p><span className="font-bold text-slate-900 dark:text-white">Qualification:</span> {doctor.qualification || "Not provided"}</p>
        <p><span className="font-bold text-slate-900 dark:text-white">Contact:</span> {doctor.email} / {doctor.phone}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SmallBox label="Experience" value={`${doctor.experience || 0} yrs`} />
        <SmallBox label="Fee" value={doctor.consultationFee || 0} />
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Availability</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {(doctor.availableDays || []).join(", ") || "No days set"}
          {doctor.availableTime?.startTime || doctor.availableTime?.endTime ? ` | ${doctor.availableTime?.startTime || ""} - ${doctor.availableTime?.endTime || ""}` : ""}
        </p>
      </div>
    </article>
  );
};

const SmallBox = ({ label, value }) => {
  return (
    <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
};

export default Doctors;
