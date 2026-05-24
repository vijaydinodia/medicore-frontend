import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RestoreRoundedIcon from "@mui/icons-material/RestoreRounded";

const icons = {
  edit: EditRoundedIcon,
  softDelete: DeleteSweepRoundedIcon,
  restore: RestoreRoundedIcon,
  delete: DeleteForeverRoundedIcon,
};

const tones = {
  edit: "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
  softDelete: "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40",
  restore: "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
  delete: "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40",
};

const LocationIconButton = ({ action, label, ...props }) => {
  const Icon = icons[action];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${tones[action] || tones.edit}`}
      {...props}
    >
      {Icon && <Icon className="!h-4 !w-4" aria-hidden="true" />}
      <span className="sr-only">{label}</span>
    </button>
  );
};

export default LocationIconButton;
