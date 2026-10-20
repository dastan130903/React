import { useEffect, useState } from 'react';
import { createResource, getResource, getResources } from './api/libraryApi';
import Header from './components/Header';
import StatCard from './components/StatCard';
import SearchControls from './components/SearchControls';
import ResourceList from './components/ResourceList';
import Pagination from './components/Pagination';
import DetailPanel from './components/DetailPanel';
import AddResourceForm from './components/AddResourceForm';

const PAGE_SIZE = 8;
const SUBJECTS = ['JavaScript','React','HTML','CSS','TypeScript','Node.js','Python','Databases','Git','UI Design','Testing','Algorithms'];

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [level, setLevel] = useState('All');
  const [sort, setSort] = useState('title');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailReload, setDetailReload] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    getResources().then(data => {
      if (!ignore) { setItems(data); setError(''); setLoading(false); }
    }).catch(err => {
      if (!ignore) { setError(err.message); setLoading(false); }
    });
    return () => { ignore = true; };
  }, [reload]);

  useEffect(() => {
    if (selectedId === null) { setDetails(null); setDetailsLoading(false); setDetailsError(''); return; }
    let ignore = false;
    getResource(selectedId).then(data => {
      if (!ignore) { setDetails(data); setDetailsError(''); setDetailsLoading(false); }
    }).catch(err => {
      if (!ignore) { setDetailsError(err.message); setDetailsLoading(false); }
    });
    return () => { ignore = true; };
  }, [selectedId, detailReload]);

  const filtered = items.filter(item =>
    (subject === 'All' || item.subject === subject) &&
    (level === 'All' || item.level === level) &&
    `${item.title} ${item.description} ${item.author}`.toLowerCase().includes(search.trim().toLowerCase())
  ).sort((a,b) => {
    if (sort === 'latest') return b.id - a.id;
    if (sort === 'shortest') return a.minutes - b.minutes || a.id - b.id;
    if (sort === 'longest') return b.minutes - a.minutes || a.id - b.id;
    return a.title.localeCompare(b.title);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateSearch(value) { setSearch(value); setPage(1); }
  function updateSubject(value) { setSubject(value); setPage(1); }
  function updateLevel(value) { setLevel(value); setPage(1); }
  function updateSort(value) { setSort(value); setPage(1); }
  function resetFilters() { setSearch(''); setSubject('All'); setLevel('All'); setSort('title'); setPage(1); }
  function chooseResource(id) {
    if (id === selectedId) return;
    setDetails(null);
    setDetailsError('');
    setDetailsLoading(true);
    setSelectedId(id);
  }
  function retryDetails() { setDetails(null); setDetailsLoading(true); setDetailsError(''); setDetailReload(n => n + 1); }
  function closeDetails() { setSelectedId(null); setDetails(null); }
  function reloadList() { setLoading(true); setError(''); setNotice(''); setReload(n => n + 1); }
  async function addResource(data) {
    if (saving) return false;
    setSaving(true); setError(''); setNotice('');
    try {
      const created = await createResource(data);
      setItems(previous => [created, ...previous]);
      setNotice(`“${created.title}” was added successfully.`);
      setSearch(''); setSubject('All'); setLevel('All'); setSort('latest'); setPage(1);
      chooseResource(created.id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally { setSaving(false); }
  }

  return <><Header count={items.length}/><main className="layout main-content">
    <div className="hero"><div><div className="eyebrow">YOUR PERSONAL LEARNING LIBRARY</div><h1>Discover what to learn<span className="accent">.</span></h1><p>Explore useful learning resources, find topics quickly, and add your own.</p></div><div className="hero-tag">MIDTERM / REACT SPA</div></div>
    <div className="stats"><StatCard number={items.length} label="Total resources" symbol="▤"/><StatCard number={SUBJECTS.length} label="Topics covered" symbol="◈"/><StatCard number={items.filter(i => i.level === 'Beginner').length} label="Beginner friendly" symbol="✦"/></div>
    {error && <div className="alert alert-error" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error" type="button">×</button></div>}
    {notice && <div className="alert alert-success" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss success" type="button">×</button></div>}
    <div className="workspace"><section className="panel library-panel"><div className="panel-heading"><div><h2>Learning resources</h2><p>{filtered.length} matching resources</p></div><button className="button button-outline" onClick={reloadList} disabled={loading} type="button">↻ {loading ? 'Loading...' : 'Reload'}</button></div>
      <SearchControls search={search} setSearch={updateSearch} subject={subject} setSubject={updateSubject} level={level} setLevel={updateLevel} sort={sort} setSort={updateSort} subjects={SUBJECTS} onReset={resetFilters}/>
      {loading ? <div className="state-box" role="status">Loading resources...</div> : error && items.length === 0 ? <div className="state-box">Could not load resources. <button type="button" className="button button-outline" onClick={reloadList}>Try again</button></div> : visible.length === 0 ? <div className="state-box">No resources found. <button type="button" className="button button-outline" onClick={resetFilters}>Clear filters</button></div> : <ResourceList items={visible} selectedId={selectedId} onSelect={chooseResource} />}
      {!loading && filtered.length > 0 && <Pagination page={currentPage} totalPages={totalPages} setPage={setPage}/>}
    </section><div className="sidebar"><DetailPanel item={details} loading={detailsLoading} error={detailsError} hasSelection={selectedId !== null} onClose={closeDetails} onRetry={retryDetails}/><AddResourceForm busy={saving} onCreate={addResource}/></div></div>
    <footer>StudyShelf · Built with React, useState, useEffect and a simulated asynchronous API.</footer>
  </main></>;
}
