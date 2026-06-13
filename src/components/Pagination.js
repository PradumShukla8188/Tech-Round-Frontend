const Pagination = ({ page, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  if (totalItems <= itemsPerPage) return null;

  const start = (page - 1) * itemsPerPage + 1;
  const end = Math.min(page * itemsPerPage, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-sm btn-outline-dark"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </button>
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline-dark'}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="btn btn-sm btn-outline-dark"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
