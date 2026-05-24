import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api";
import HospitalDetails from "../components/HospitalDetails";

const getId = (value) => value?._id || value || "";

const StatusPill = ({ value }) => {
  const active = value === "active" || value === "approved";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"}`}>
      {value || "active"}
    </span>
  );
};

const RelatedSection = ({ title, count, headers, rows, empty }) => (
  <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <h2 className="text-lg font-black text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{count} record(s)</p>
    </div>
    {rows.length ? (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-3 font-bold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                {row.cells.map((cell, index) => (
                  <td key={index} className="px-5 py-4 text-slate-600 dark:text-slate-300">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="p-5 text-sm font-semibold text-slate-500 dark:text-slate-400">{empty}</p>
    )}
  </section>
);

const HospitalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [related, setRelated] = useState({
    departments: [],
    subDepartments: [],
    doctors: [],
    labs: [],
    tests: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadHospital = async () => {
      try {
        setLoading(true);
        setMessage("");
        const response = await axiosInstance.get(`/hospital/getSingleHospital/${id}`);
        setHospital(response.data.data || null);
        const results = await Promise.allSettled([
          axiosInstance.get("/department/getAllDepartments"),
          axiosInstance.get("/sub-department/getAllSubDepartments"),
          axiosInstance.get("/doctor/getAllDoctors"),
          axiosInstance.get("/lab/getAllLabs"),
          axiosInstance.get("/test/getAllTests?includeDeleted=true"),
        ]);
        const [departmentRes, subDepartmentRes, doctorRes, labRes, testRes] = results.map((result) =>
          result.status === "fulfilled" ? result.value.data.data || [] : [],
        );

        setRelated({
          departments: departmentRes.filter((item) => getId(item.hospitalId) === id),
          subDepartments: subDepartmentRes.filter((item) => getId(item.hospitalId) === id),
          doctors: doctorRes.filter((item) => getId(item.hospitalId) === id),
          labs: labRes.filter((item) => getId(item.hospitalId) === id),
          tests: testRes.filter((item) => getId(item.hospitalId) === id),
        });
      } catch (error) {
        setMessage(error.response?.data?.message || "Unable to load hospital details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadHospital();
    }
  }, [id]);

  return (
    <main className="min-h-[calc(100svh-73px)] bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="h-3 w-32 animate-pulse rounded bg-teal-100 dark:bg-teal-950" />
            <div className="mt-4 h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 h-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        )}

        {!loading && message && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
            {message}
          </div>
        )}

        {!loading && hospital && (
          <>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <HospitalDetails hospital={hospital} onClose={() => navigate(-1)} />
            </div>

            <RelatedSection
              title="Departments"
              count={related.departments.length}
              headers={["Department", "Code", "Doctors", "Status"]}
              empty="No departments added for this hospital."
              rows={related.departments.map((department) => ({
                id: department._id,
                cells: [
                  <span className="font-bold text-slate-950 dark:text-white">{department.departmentName || "-"}</span>,
                  department.departmentCode || "-",
                  department.totalDoctors || 0,
                  <StatusPill value={department.status} />,
                ],
              }))}
            />

            <RelatedSection
              title="Subdepartments"
              count={related.subDepartments.length}
              headers={["Subdepartment", "Department", "Code", "Status"]}
              empty="No subdepartments added for this hospital."
              rows={related.subDepartments.map((subDepartment) => ({
                id: subDepartment._id,
                cells: [
                  <span className="font-bold text-slate-950 dark:text-white">{subDepartment.subDepartmentName || "-"}</span>,
                  subDepartment.departmentId?.departmentName || "-",
                  subDepartment.subDepartmentCode || "-",
                  <StatusPill value={subDepartment.status} />,
                ],
              }))}
            />

            <RelatedSection
              title="Doctors"
              count={related.doctors.length}
              headers={["Doctor", "Department", "Specialization", "Status"]}
              empty="No doctors added for this hospital."
              rows={related.doctors.map((doctor) => ({
                id: doctor._id,
                cells: [
                  <span className="font-bold text-slate-950 dark:text-white">{doctor.doctorName || "-"}</span>,
                  doctor.departmentId?.departmentName || "-",
                  doctor.specialization || "-",
                  <StatusPill value={doctor.status} />,
                ],
              }))}
            />

            <RelatedSection
              title="Labs"
              count={related.labs.length}
              headers={["Lab", "Code", "City", "Status"]}
              empty="No labs added for this hospital."
              rows={related.labs.map((lab) => ({
                id: lab._id,
                cells: [
                  <span className="font-bold text-slate-950 dark:text-white">{lab.labName || "-"}</span>,
                  lab.labCode || "-",
                  lab.cityId?.cityName || "-",
                  <StatusPill value={lab.status} />,
                ],
              }))}
            />

            <RelatedSection
              title="Tests"
              count={related.tests.length}
              headers={["Test", "Lab", "Amount", "Status"]}
              empty="No tests added for this hospital."
              rows={related.tests.map((test) => ({
                id: test._id,
                cells: [
                  <span className="font-bold text-slate-950 dark:text-white">{test.testName || "-"}</span>,
                  test.labId?.labName || "-",
                  test.amount || 0,
                  <StatusPill value={test.isDeleted ? "deleted" : test.status} />,
                ],
              }))}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default HospitalDetailsPage;
