import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api";
import Pagination from "../components/Pagination";
import SearchInput from "../components/SearchInput";
import { UsePagination } from "../custom_hook/UsePagination";
import { getAuthInfo } from "../custom_hook/useAuth";

const getRecordId = (value) => value?._id || value || "";

const Department = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, dashboardPath } = getAuthInfo();
  const isHospitalWorkspace = user?.role === "hospital" || (user?.role === "admin" && user?.hospitalId);
  const hospitalId = getRecordId(user?.hospitalId);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("departmentName");
  const [sortDirection, setSortDirection] = useState("asc");
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
    const fetchRecords = async () => {
      if (!isHospitalWorkspace || !hospitalId) return;

      try {
        setLoading(true);
        setMessage("");
        const departmentRes = await axiosInstance.get("/department/getAllDepartments");
        const subDepartmentRes = await axiosInstance.get("/sub-department/getAllSubDepartments");
        const doctorRes = await axiosInstance.get("/doctor/getAllDoctors");

        setDepartments(departmentRes.data.data || []);
        setSubDepartments(subDepartmentRes.data.data || []);
        setDoctors(doctorRes.data.data || []);
      } catch (error) {
        setMessage(error.response?.data?.message || "Unable to load department data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [hospitalId, isHospitalWorkspace]);

  const hospitalDepartments = departments.filter((item) => getRecordId(item.hospitalId) === hospitalId);
  const query = searchTerm.trim().toLowerCase();
  const visibleDepartments = hospitalDepartments
    .filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!query) return true;

      const values = [item.departmentName, item.departmentCode, item.description, item.status];
      return values.some((value) => String(value || "").toLowerCase().includes(query));
    })
    .sort((a, b) => {
      const aValue = a[sortKey] || "";
      const bValue = b[sortKey] || "";
      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * (sortDirection === "asc" ? 1 : -1);
    });

  const {
    currentPage,
    endItem,
    paginatedItems: paginatedDepartments,
    setCurrentPage,
    startItem,
    totalItems,
    totalPages,
  } = UsePagination(visibleDepartments, {
    pageSize: 9,
    resetKeys: [searchTerm, statusFilter, sortKey, sortDirection],
  });

  const changeSort = (key) => {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const getSubDepartments = (departmentId) =>
    subDepartments.filter((item) => getRecordId(item.hospitalId) === hospitalId && getRecordId(item.departmentId) === departmentId);

  const getDoctorCount = (departmentId) =>
    doctors.filter((item) => getRecordId(item.hospitalId) === hospitalId && getRecordId(item.departmentId) === departmentId).length;

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-8 text-left dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Hospital setup</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Departments</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">View departments, subdepartments, and doctor coverage for this hospital.</p>
        </header>

        <section className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search departments" className="max-w-xl" />
          <label className="block">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-2 h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => changeSort("departmentName")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Name</button>
            <button type="button" onClick={() => changeSort("departmentCode")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Code</button>
            <button type="button" onClick={() => changeSort("status")} className="h-11 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:text-slate-200">Status</button>
          </div>
        </section>

        {message && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />)}
          </div>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedDepartments.map((department) => {
              const childDepartments = getSubDepartments(department._id);
              return (
                <article key={department._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">{department.departmentName}</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{department.departmentCode}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      {department.status || "active"}
                    </span>
                  </div>

                  {department.description && <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{department.description}</p>}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Doctors</p>
                      <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{getDoctorCount(department._id)}</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                      <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Subdepartments</p>
                      <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{childDepartments.length}</p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Units</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {childDepartments.length > 0 ? (
                        childDepartments.map((item) => (
                          <span key={item._id} className="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                            {item.subDepartmentName}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">No subdepartments added.</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {visibleDepartments.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400 md:col-span-2 xl:col-span-3">
                {searchTerm ? "No departments match your search." : "No departments added for this hospital yet."}
              </div>
            )}
            <Pagination
              className="md:col-span-2 xl:col-span-3"
              currentPage={currentPage}
              endItem={endItem}
              onPageChange={setCurrentPage}
              startItem={startItem}
              totalItems={totalItems}
              totalPages={totalPages}
            />
          </section>
        )}
      </div>
    </main>
  );
};

export default Department;
