import { useState } from 'react';
const emptyForm = {title:'', subject:'React', level:'Beginner', minutes:'30', description:''};
export default function AddResourceForm({ onCreate, busy }) {
  const [form, setForm] = useState(emptyForm);
  const [validation, setValidation] = useState('');
  function change(e) { setForm(prev => ({...prev, [e.target.name]:e.target.value})); setValidation(''); }
  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setValidation('Enter a title and description.'); return; }
    if (!(Number(form.minutes) > 0)) { setValidation('Reading time must be positive.'); return; }
    const ok = await onCreate({...form, title: form.title.trim(), description: form.description.trim()});
    if (ok) { setForm(emptyForm); setValidation(''); }
  }
  return <section className="panel add-panel"><div className="panel-heading"><div><h2>Add new resource</h2><p>Share something worth learning</p></div></div><form className="add-form" onSubmit={submit}>
    <label>Title<input name="title" value={form.title} onChange={change} placeholder="e.g. React: Hooks Basics" maxLength={100} disabled={busy} required /></label>
    <div className="form-row"><label>Subject<select name="subject" value={form.subject} onChange={change} disabled={busy}><option>React</option><option>JavaScript</option><option>HTML</option><option>CSS</option><option>TypeScript</option><option>Node.js</option><option>Python</option><option>Databases</option><option>Git</option><option>UI Design</option><option>Testing</option><option>Algorithms</option></select></label><label>Level<select name="level" value={form.level} onChange={change} disabled={busy}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label></div>
    <label>Reading time (minutes)<input type="number" name="minutes" min="1" max="1000" value={form.minutes} onChange={change} disabled={busy} required /></label>
    <label>Description<textarea name="description" rows="3" value={form.description} onChange={change} placeholder="What will students learn?" maxLength={500} disabled={busy} required /></label>
    {validation && <p role="alert" className="error-text">{validation}</p>}
    <button type="submit" disabled={busy} className="button button-primary">{busy ? 'Saving...' : '+ Add resource'}</button>
  </form></section>;
}
