export default function Pagination({ page, totalPages, setPage }) {
  return <div className="pagination"><button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button><span>Page <b>{page}</b> of {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button></div>;
}
