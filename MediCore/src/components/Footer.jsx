import { Link, useLocation } from "react-router-dom";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";

const footerLinks = [
  { name: "Contact Us", path: "/contact-us" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms & Conditions", path: "/terms-and-conditions" },
  { name: "Refund Policy", path: "/refund-policy" },
];

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/super-admin")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200/70 bg-white/80 px-4 py-6 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex w-fit items-center gap-2 text-slate-950 dark:text-white">
          <span className="medicore-button-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <LocalHospitalRoundedIcon className="!h-5 !w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-black leading-tight">MediCore</span>
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">Care network</span>
          </span>
        </Link>

        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
          {footerLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-slate-600 transition hover:text-teal-800 dark:text-slate-300 dark:hover:text-teal-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
