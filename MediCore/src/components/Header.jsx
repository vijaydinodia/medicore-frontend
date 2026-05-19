import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UseTheme } from "../custom_hook/UseTheme";
import { getDashboardPath, UseAuth } from "../custom_hook/useAuth";
import ChangePassword from "./ChangePassword";
import EditProfile from "./EditProfile";

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = UseTheme();
  const { isAuthenticated, user, logout } = UseAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const hideHeader = location.pathname.startsWith("/super-admin");

  useEffect(() => {
    const closeMenu = (event) => {
      if (event.target.closest("[data-account-dialog='true']")) {
        return;
      }

      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  if (hideHeader) {
    return null;
  }

  const dashboardPath = getDashboardPath(user);
  const isHospitalRole = user?.role === "hospital" || user?.role === "admin";
  const accountName = user?.name || user?.doctorName || user?.email || "Account";
  const initials =
    accountName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  const navLinks = isAuthenticated
    ? isHospitalRole
      ? [
          { name: "Dashboard", path: dashboardPath },
          { name: "Today Patients", path: "/hospital/dashboard?tab=today-patients" },
          { name: "Doctor Attendance", path: "/hospital/dashboard?tab=doctor-attendance" },
          { name: "Department", path: "/hospital/department" },
          { name: "Doctors", path: "/hospital/doctors" },
        ]
      : user?.role === "doctor"
      ? [
          { name: "Dashboard", path: dashboardPath },
          { name: "Patients", path: "/doctor/dashboard#patients" },
        ]
      : user?.role === "user"
      ? [
          { name: "Dashboard", path: dashboardPath },
          { name: "History", path: "/user/dashboard?view=history" },
        ]
      : [{ name: "Dashboard", path: dashboardPath }]
    : [
        { name: "Add Hospital", path: "/add-hospital" },
        { name: "Sign Up", path: "/signup" },
        { name: "Login", path: "/login" },
      ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-3 text-slate-950 dark:text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-lg font-black text-white shadow-sm dark:bg-teal-500 dark:text-slate-950">
            M
          </span>
          <span>
            <span className="block text-xl font-black leading-tight tracking-tight">MediCore</span>
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Care network</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
            {navLinks.map((link) => {
              const currentPath = `${location.pathname}${location.search}${location.hash}`;
              const linkHasState = link.path.includes("?") || link.path.includes("#");
              const active = linkHasState
                ? currentPath === link.path
                : location.pathname === link.path || (location.pathname === "/" && link.path === "/signup");
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-teal-800 shadow-sm dark:bg-slate-950 dark:text-teal-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {isAuthenticated && (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-teal-200 bg-teal-600 text-sm font-black text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 dark:border-teal-400/40 dark:bg-teal-500 dark:text-slate-950 dark:focus:ring-teal-950"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
              >
                {user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : initials}
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-14 z-50 w-64 rounded-lg border border-slate-200 bg-white p-2 text-left shadow-xl dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
                    <p className="truncate text-sm font-black text-slate-950 dark:text-white">{accountName}</p>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || "Signed in"}</p>
                  </div>

                  <div className="py-2">
                    <EditProfile
                      user={user}
                      triggerClassName="flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                    />
                    <ChangePassword triggerClassName="flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900" />
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={toggleTheme} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white" aria-label="Toggle theme">
            {theme === "light" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
