import { useEffect, useMemo, useState } from "react";

export const UsePagination = (items = [], options = {}) => {
  const { initialPage = 1, pageSize = 9, resetKeys = [] } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, resetKeys);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    endItem,
    pageSize,
    paginatedItems,
    setCurrentPage,
    startItem,
    totalItems,
    totalPages,
  };
};
