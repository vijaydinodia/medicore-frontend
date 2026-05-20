import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyOtp from "./components/VerifyOtp";
import AddHospital from "./components/AddHospital";
import SuperAdminDashBorad from "./pages/SuperAdminDashBorad";
import UserDashboard from "./pages/UserDashboard";
import HospitalDashborad from "./pages/HospitalDashborad";
import DoctorDashboard from "./pages/DoctorDashboard";
import LabDashboard from "./pages/LabDashboard";
import Department from "./pages/Department";
import Doctors from "./pages/Doctors";

const PageLoader = () => (
  <div className="flex min-h-[calc(100svh-73px)] items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
    <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="h-3 w-28 animate-pulse rounded bg-teal-100 dark:bg-teal-950" />
      <div className="mt-4 h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
      <div className="mt-3 h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
    </div>
  </div>
);

const withPublic = (children) => <PublicRoute>{children}</PublicRoute>;
const withProtected = (children, roles) => <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/signup" element={withPublic(<SignUp />)} />
          <Route path="/login" element={withPublic(<Login />)} />
          <Route path="/forget" element={withPublic(<ForgetPassword />)} />
          <Route path="/resetpassword" element={withPublic(<ResetPassword />)} />
          <Route path="/verifyotp" element={withPublic(<VerifyOtp />)} />

          <Route path="/add-hospital" element={<AddHospital />} />

          <Route path="/super-admin/dashboard" element={withProtected(<SuperAdminDashBorad />, ["superAdmin"])} />
          <Route path="/hospital/dashboard" element={withProtected(<HospitalDashborad />, ["hospital", "admin"])} />
          <Route path="/doctor/dashboard" element={withProtected(<DoctorDashboard />, ["doctor"])} />
          <Route path="/lab/dashboard" element={withProtected(<LabDashboard />, ["lab"])} />
          <Route path="/user/dashboard" element={<UserDashboard />} />

          <Route path="/hospital/department" element={withProtected(<Department />, ["hospital", "admin"])} />
          <Route path="/hospital/doctors" element={withProtected(<Doctors />, ["hospital", "admin"])} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
