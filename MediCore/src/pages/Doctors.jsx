import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import SearchInput from "../components/SearchInput";
import { getAuthInfo } from "../custom_hook/useAuth";

const getRecordId = (value) => value?._id || value || "";

const Doctors = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, dashboardPath } = getAuthInfo();
  const isHospitalWorkspace = user?.role === "hospital" || (user?.role === "admin" && user?.hospitalId);
  const hospitalId = getRecordId(user?.hospitalId);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isHospitalWorkspace) {
      navigate(dashboardPath, { replace: true });
    }
  }, [dashboardPath, isAuthenticated, isHospitalWorkspace, navigate]);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isHospitalWorkspace || !hospitalId) return;

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

    fetchDoctors();
  }, [hospitalId, isHospitalWorkspace]);

  const visibleDoctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const hospitalDoctors = doctors.filter((item) => getRecordId(item.hospitalId) === hospitalId);

    if (!query) return hospitalDoctors;

    return hospitalDoctors.filter((item) =>
      [
        item.doctorName,
        item.doctorCode,
        item.email,
        item.phone,
        item.specialization,
        item.qualification,
        item.licenseNumber,
        item.departmentId?.departmentName,
        item.subDepartmentId?.subDepartmentName,
        item.status,
      ].some((value) => String(value || "").toLowerCase().includes(query)),
    );
  }, [doctors, hospitalId, searchTerm]);

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Clinical team</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Doctors</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">Review active doctors, departments, schedules, and contact details for this hospital.</p>
        </header>

        <section className="mt-6">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search doctors" className="max-w-xl" />
        </section>

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />)}
          </div>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleDoctors.map((doctor) => (
              <article key={doctor._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-700 text-lg font-black text-white dark:bg-teal-500 dark:text-slate-950">
                    {doctor.profileImage ? (
                      <img src={doctor.profileImage} alt="" className="h-full w-full object-cover" />
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

                <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p><span className="font-bold text-slate-900 dark:text-white">Department:</span> {doctor.departmentId?.departmentName || "Not assigned"}</p>
                  <p><span className="font-bold text-slate-900 dark:text-white">Subdepartment:</span> {doctor.subDepartmentId?.subDepartmentName || "Not assigned"}</p>
                  <p><span className="font-bold text-slate-900 dark:text-white">Qualification:</span> {doctor.qualification || "Not provided"}</p>
                  <p><span className="font-bold text-slate-900 dark:text-white">Contact:</span> {doctor.email} / {doctor.phone}</p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Experience</p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{doctor.experience || 0} yrs</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Fee</p>
                    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{doctor.consultationFee || 0}</p>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Availability</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {(doctor.availableDays || []).join(", ") || "No days set"} {doctor.availableTime?.startTime || doctor.availableTime?.endTime ? ` · ${doctor.availableTime?.startTime || ""} - ${doctor.availableTime?.endTime || ""}` : ""}
                  </p>
                </div>
              </article>
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

export default Doctors;
