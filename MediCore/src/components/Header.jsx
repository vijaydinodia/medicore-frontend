import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../custom_hook/useTheme";
import { useAuth } from "../custom_hook/useAuth";

const Header = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const hideHeader = location.pathname.startsWith("/super-admin");

  if (hideHeader) {
    return null;
  }

  const dashboardPath =
    user?.role === "superAdmin"
      ? "/super-admin/dashboard"
      : user?.role === "admin"
        ? user?.hospitalId
          ? "/hospital/dashboard"
          : "/admin/dashboard"
        : user?.role === "hospital"
          ? "/hospital/dashboard"
          : "/user/dashboard";

  const navLinks = isAuthenticated
    ? [
        {
          name: "Dashboard",
          path: dashboardPath,
        },
      ]
    : [
        {
          name: "Add Hospital",
          path: "/add-hospital",
        },
        {
          name: "Sign Up",
          path: "/signup",
        },
        {
          name: "Login",
          path: "/login",
        },
      ];

  return (
    <header className="w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-400"
        >
          MediCore
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex flex-wrap items-center gap-2">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition
                ${
                  location.pathname === link.path ||
                  (location.pathname === "/" && link.path === "/signup")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {isAuthenticated && (
            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {user?.name || user?.email || "Account"}
              </span>
              <button
                onClick={logout}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
