import { useState, useEffect, useMemo } from 'react';

export const usePagination = (items, itemsPerPage = 5) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, page, itemsPerPage]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [items.length, itemsPerPage]);

  return {
    page,
    setPage,
    totalPages,
    paginatedItems,
    totalItems: items.length,
    itemsPerPage,
  };
};
