import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const SearchInput = ({ value, onChange, placeholder = "Search", className = "" }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{placeholder}</span>

      <SearchRoundedIcon className="pointer-events-none absolute left-3 top-1/2 !h-4 !w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />

      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-teal-400 dark:focus:ring-teal-950"
      />
    </label>
  );
};

export default SearchInput;
