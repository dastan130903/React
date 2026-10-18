import { useEffect, useState } from 'react';
import { getItemsList, getItem, createItem, updateItem, deleteItem } from './api/fakeApi.js';

const EMPTY_FORM = { name: '', description: '', status: 'Todo', priority: 'Medium', category: 'Development', assignee: '', dueDate: '', estimate: 1 };
const formFields = [
  { name: 'name', label: 'Task name', type: 'text', required: true },
  { name: 'assignee', label: 'Assignee', type: 'text', required: true },
  { name: 'dueDate', label: 'Due date', type: 'date', required: true },
  { name: 'estimate', label: 'Estimate (hours)', type: 'number', required: true },
];

function TaskForm({ initial, onSave, onCancel, submitting }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  function update(event) { const { name, value } = event.target; setForm(previous => ({ ...previous, [name]: value })); }
  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.assignee.trim() || !form.description.trim() || !form.dueDate) return;
    onSave({ ...form, name: form.name.trim(), assignee: form.assignee.trim(), description: form.description.trim(), estimate: Math.max(1, Number(form.estimate)) });
  }
  return <form onSubmit={submit} className="task-form">
    <div className="form-grid">{formFields.map(field => <label key={field.name}>{field.label}<input name={field.name} value={form[field.name]} type={field.type} onChange={update} required={field.required} min={field.type === 'number' ? '1' : undefined} /></label>)}</div>
    <div className="form-grid"><label>Status<select name="status" value={form.status} onChange={update}><option>Todo</option><option>In progress</option><option>Done</option></select></label><label>Priority<select name="priority" value={form.priority} onChange={update}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Category<select name="category" value={form.category} onChange={update}><option>Development</option><option>Design</option><option>Testing</option><option>Content</option><option>Other</option></select></label></div>
    <label>Description<textarea name="description" rows="3" value={form.description} onChange={update} required /></label>
    <div className="form-actions"><button type="button" className="button ghost" onClick={onCancel} disabled={submitting}>Cancel</button><button type="submit" className="button primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save task'}</button></div>
  </form>;
}

export default function App() {
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [listVersion, setListVersion] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsVersion, setDetailsVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('view');
  const [formKey, setFormKey] = useState(0);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  // Each effect owns its result. Cleanup prevents an old request from overwriting new state.
  useEffect(() => {
    let ignore = false;
    setListLoading(true);
    setListError('');
    getItemsList().then(response => {
      if (!ignore) setItems(response.data);
    }).catch(error => {
      if (!ignore) setListError(error.message);
    }).finally(() => {
      if (!ignore) setListLoading(false);
    });
    return () => { ignore = true; };
  }, [listVersion]);

  // Quickly switching selected IDs never shows details from a slower, outdated request.
  useEffect(() => {
    let ignore = false;
    setDetails(null);
    setDetailsError('');
    if (selectedId === null) { setDetailsLoading(false); return () => { ignore = true; }; }
    setDetailsLoading(true);
    getItem(selectedId).then(item => {
      if (!ignore) setDetails(item);
    }).catch(error => {
      if (!ignore) setDetailsError(error.message);
    }).finally(() => {
      if (!ignore) setDetailsLoading(false);
    });
    return () => { ignore = true; };
  }, [selectedId, detailsVersion]);

  function refresh() { setListVersion(v => v + 1); }
  function selectItem(id) {
    setSelectedId(id);
    setMode('view');
    setDetails(null);
    setDetailsError('');
    setMessage('');
    setActionError('');
  }
  function startCreate() { setMode('create'); setFormKey(k => k + 1); setActionError(''); setMessage(''); }
  function startEdit() { if (details && !busy) { setMode('edit'); setFormKey(k => k + 1); setActionError(''); } }

  async function save(form) {
    if (busy) return;
    // Capture ID BEFORE await: never rely on selectedId after a delayed response.
    const targetId = mode === 'edit' ? details?.id : null;
    if (mode === 'edit' && targetId == null) return;
    setBusy(true); setActionError(''); setMessage('');
    try {
      if (targetId === null) {
        const created = await createItem(form);
        selectItem(created.id);
        setMessage('Task created successfully.');
      } else {
        await updateItem(targetId, { ...form, completed: form.status === 'Done' });
        setDetailsVersion(v => v + 1); // only current selection is fetched by the effect
        setMessage('Task updated successfully.');
      }
      setMode('view');
      refresh();
    } catch (error) { setActionError(error.message); }
    finally { setBusy(false); }
  }

  async function toggleComplete() {
    if (!details || busy) return;
    const targetId = details.id;  // stale-closure protection
    const nextCompleted = !details.completed;
    setBusy(true); setActionError(''); setMessage('');
    try {
      const updated = await updateItem(targetId, { completed: nextCompleted, status: nextCompleted ? 'Done' : 'Todo' });
      // setDetails conditional on matching ID via functional update, not an old selection.
      setDetails(previous => previous?.id === targetId ? updated : previous);
      setDetailsVersion(v => v + 1);
      refresh();
      setMessage(`Task #${targetId} ${nextCompleted ? 'completed' : 'reopened'} successfully.`);
    } catch (error) { setActionError(error.message); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!details || busy || !window.confirm(`Delete “${details.name}”?`)) return;
    const targetId = details.id;
    setBusy(true); setActionError(''); setMessage('');
    try {
      await deleteItem(targetId);
      setSelectedId(current => current === targetId ? null : current);
      setDetails(current => current?.id === targetId ? null : current);
      refresh();
      setMode('view');
      setMessage(`Task #${targetId} deleted.`);
    } catch (error) { setActionError(error.message); }
    finally { setBusy(false); }
  }

  const filtered = items.filter(item =>
    (filter === 'All' || item.status === filter) && item.name.toLowerCase().includes(search.toLowerCase())
  );
  const complete = items.filter(item => item.completed).length;
  const progress = items.filter(item => item.status === 'In progress').length;

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-icon">◈</span><span>taskflow<span className="brand-dot">.</span></span></div><div className="header-right"><span className="header-caption">ASYNC REACT LAB / WEEK 04</span><span className="avatar">D</span></div></header>
    <main className="page"><div className="page-heading"><div><div className="eyebrow">WORKSPACE / MY PROJECT</div><h1>Task dashboard<span className="heading-dot">.</span></h1><p>Manage your work with a simulated asynchronous API.</p></div><button className="button primary new-button" onClick={startCreate} disabled={busy}><span>＋</span> New task</button></div>
      <section className="stats"><div className="stat"><span>Total tasks</span><strong>{items.length}</strong><small>All tracked work</small></div><div className="stat"><span>In progress</span><strong>{progress}</strong><small>Active assignments</small></div><div className="stat"><span>Completed</span><strong>{complete}</strong><small>Successfully finished</small></div><div className="stat visual"><span>API simulation</span><strong><span className="live-dot"/> Online</strong><small>Random delay · occasional errors</small></div></section>
      {message && <div className="notice success" role="status">✓ {message}<button aria-label="Dismiss message" onClick={() => setMessage('')}>×</button></div>}
      {actionError && <div className="notice error" role="alert">⚠ {actionError}<button aria-label="Dismiss error" onClick={() => setActionError('')}>×</button></div>}
      <div className="workspace"><section className="panel list-panel"><div className="panel-head"><div><h2>All tasks</h2><span>{items.length} tasks in workspace</span></div><button className="button outline reload" onClick={refresh} disabled={listLoading}>↻ {listLoading ? 'Loading…' : 'Reload'}</button></div><div className="toolbar"><input aria-label="Search tasks" placeholder="⌕  Search tasks…" value={search} onChange={event => setSearch(event.target.value)}/><select aria-label="Filter by status" value={filter} onChange={event => setFilter(event.target.value)}><option>All</option><option>Todo</option><option>In progress</option><option>Done</option></select></div>
        {listLoading ? <div className="center-state"><div className="spinner"/><p>Loading tasks…</p></div> : listError ? <div className="center-state error-text"><strong>Could not load tasks</strong><p>{listError}</p><button className="button outline" onClick={refresh}>Try again</button></div> : !items.length ? <div className="center-state"><div className="empty-icon">▤</div><strong>No tasks yet</strong><p>Create your first task to get started.</p></div> : !filtered.length ? <div className="center-state"><strong>No matching tasks</strong><p>Try another search or filter.</p></div> : <div className="task-list">{filtered.map(item => <button type="button" key={item.id} onClick={() => selectItem(item.id)} className={`task-row ${selectedId === item.id ? 'active' : ''}`}><span className={`task-checkbox ${item.completed ? 'checked' : ''}`}>{item.completed ? '✓' : ''}</span><span className="task-main"><strong>{item.name}</strong><span><i className={`priority ${item.priority.toLowerCase()}`}/> {item.priority} priority · {item.category}</span></span><span className={`status ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span><span className="chevron">›</span></button>)}</div>}
        <div className="panel-foot">Showing {filtered.length} of {items.length} tasks</div></section>
      <section className="panel detail-panel"><div className="panel-head"><div><h2>{mode === 'create' ? 'Create task' : mode === 'edit' ? 'Edit task' : 'Task details'}</h2><span>{mode !== 'view' ? 'Fill out the information below' : 'Select a task to view its information'}</span></div>{mode === 'view' && selectedId !== null && <span className="item-id">#{selectedId}</span>}</div>
        {mode === 'create' ? <TaskForm key={`create-${formKey}`} onSave={save} onCancel={() => setMode('view')} submitting={busy}/> : mode === 'edit' && details ? <TaskForm key={`edit-${formKey}`} initial={details} onSave={save} onCancel={() => setMode('view')} submitting={busy}/> : selectedId === null ? <div className="detail-empty"><div className="detail-illustration">▧</div><h3>Nothing selected</h3><p>Choose a task from the list or create a new one to get started.</p></div> : detailsLoading ? <div className="center-state"><div className="spinner"/><p>Fetching task #{selectedId} details…</p><small>The API intentionally responds with a delay.</small></div> : detailsError ? <div className="center-state error-text"><strong>Unable to load details</strong><p>{detailsError}</p><button className="button outline" onClick={() => setDetailsVersion(v => v + 1)}>Retry</button></div> : details ? <div className="details"><div className="details-title"><div className="detail-overline">TASK OVERVIEW</div><h3>{details.name}</h3><p>{details.description}</p></div><div className="field-grid"><div><span>Status</span><strong className={`status ${details.status.toLowerCase().replace(' ', '-')}`}>{details.status}</strong></div><div><span>Priority</span><strong>{details.priority}</strong></div><div><span>Category</span><strong>{details.category}</strong></div><div><span>Assignee</span><strong>{details.assignee}</strong></div><div><span>Due date</span><strong>{details.dueDate || 'Not set'}</strong></div><div><span>Estimated hours</span><strong>{details.estimate}h</strong></div><div><span>Completed</span><strong>{details.completed ? 'Yes' : 'No'}</strong></div><div><span>Task ID</span><strong>#{details.id}</strong></div></div><div className="detail-actions"><button className="button primary" disabled={busy} onClick={toggleComplete}>{busy ? 'Please wait…' : details.completed ? '↶ Reopen task' : '✓ Mark complete'}</button><button className="button outline" disabled={busy} onClick={startEdit}>Edit</button><button className="button danger" disabled={busy} onClick={remove}>Delete</button></div><p className="hint">Tip: switch tasks quickly to test race-condition protection.</p></div> : <div className="center-state">Select a task to load details.</div>}
      </section></div><footer>Built with React · useState + useEffect · Promises · localStorage</footer></main></div>;
}
