const getPageNumbers = (currentPage, totalPages) => {
  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
};

const Pagination = ({ currentPage, totalPages, totalItems, startItem, endItem, onPageChange, className = "" }) => {
  if (totalItems <= 0 || totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className={`medicore-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between ${className}`} aria-label="Pagination">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Showing <span className="text-slate-950 dark:text-white">{startItem}</span>-
        <span className="text-slate-950 dark:text-white">{endItem}</span> of{" "}
        <span className="text-slate-950 dark:text-white">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:text-teal-200"
        >
          Prev
        </button>

        {pages.map((page, index) => {
          const previous = pages[index - 1];
          const showGap = previous && page - previous > 1;

          return (
            <span key={page} className="inline-flex items-center gap-2">
              {showGap && <span className="px-1 text-sm font-black text-slate-400">...</span>}
              <button
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`h-9 min-w-9 rounded-md px-3 text-sm font-black transition ${
                  page === currentPage
                    ? "medicore-button-primary"
                    : "border border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:text-teal-200"
                }`}
              >
                {page}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 rounded-md border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-700 dark:hover:text-teal-200"
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;