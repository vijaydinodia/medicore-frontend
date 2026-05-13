import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import axiosInstance from "../api";

import { getAuthInfo } from "../custom_hook/useAuth";

import HospitalTableView from "../components/HospitalTableView";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { isAuthenticated, user } = getAuthInfo();

  const [hospitals, setHospitals] = useState([]);

  const [loading, setLoading] = useState(false);

  // ================= AUTH CHECK =================

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login", {
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate]);

  // ================= GET HOSPITALS =================

  const getHospitals = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/hospital/getAllHospital");

      setHospitals(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= APPROVE =================

  const onApprove = async (id) => {
    try {
      const res = await axiosInstance.patch(`/hospital/approveHospital/${id}`);

      alert(res.data.message);

      getHospitals();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= REJECT =================

  const onReject = async (id) => {
    try {
      const res = await axiosInstance.patch(`/hospital/rejectHospital/${id}`);

      alert(res.data.message);

      getHospitals();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= ACTIVE / INACTIVE =================

  const onToggleActive = async (id) => {
    try {
      const res = await axiosInstance.patch(`/hospital/toggleStatus/${id}`);

      alert(res.data.message);

      getHospitals();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE =================

  const onDelete = async (id) => {
    try {
      const res = await axiosInstance.delete(`/hospital/deleteHospital/${id}`);

      alert(res.data.message);

      getHospitals();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= RESTORE =================

  const onRestore = async (id) => {
    try {
      const res = await axiosInstance.patch(`/hospital/restoreHospital/${id}`);

      alert(res.data.message);

      getHospitals();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= VIEW DETAILS =================

  const onViewDetails = (id) => {
    navigate(`/hospital/details/${id}`);
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    getHospitals();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-left dark:bg-slate-900 dark:text-white px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Manage all hospitals from here.
        </p>

        <div className="mt-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <HospitalTableView
              hospitals={hospitals}
              onApprove={onApprove}
              onReject={onReject}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
              onRestore={onRestore}
              onViewDetails={onViewDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
