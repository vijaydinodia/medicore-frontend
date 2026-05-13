import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import ForgetPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyOtp from "./components/VerifyOtp";
import AddHospital from "./components/AddHospital";
import SuperAdminDashBorad from "./pages/SuperAdminDashBorad";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* public auth routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/forget"
          element={
            <PublicRoute>
              <ForgetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/resetpassword"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verifyotp"
          element={
            <PublicRoute>
              <VerifyOtp />
            </PublicRoute>
          }
        />

        {/* public form route */}
        <Route path="/add-hospital" element={<AddHospital />} />

        {/* protected routes */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute roles={["superAdmin"]}>
              <SuperAdminDashBorad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute roles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
