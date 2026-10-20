export default function SearchControls({ search, setSearch, subject, setSubject, level, setLevel, sort, setSort, subjects, onReset }) {
  return <div className="controls">
    <label className="search-field"><span className="sr-only">Search resources</span><span aria-hidden="true">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or description..." /></label>
    <label><span className="sr-only">Filter subject</span><select value={subject} onChange={e => setSubject(e.target.value)}><option value="All">All subjects</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
    <label><span className="sr-only">Filter level</span><select value={level} onChange={e => setLevel(e.target.value)}><option value="All">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
    <label><span className="sr-only">Sort resources</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="title">Title: A–Z</option><option value="latest">Newest first</option><option value="shortest">Shortest first</option><option value="longest">Longest first</option></select></label>
    <button type="button" className="reset-button" onClick={onReset}>Reset</button>
  </div>;
}
