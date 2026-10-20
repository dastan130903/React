export default function DetailPanel({ item, loading, error, onClose, onRetry, hasSelection }) {
  return <section className="panel detail-panel"><div className="panel-heading"><div><h2>Resource details</h2><p>Learn more about a resource</p></div>{hasSelection && <button className="text-button" onClick={onClose} type="button">Close</button>}</div>
    {loading ? <div className="panel-body state-box" role="status">Loading details...</div>
    : error ? <div className="panel-body state-box"><p className="error-text">{error}</p><button className="button button-outline" type="button" onClick={onRetry}>Try again</button></div>
    : !item ? <div className="panel-body state-box"><span className="empty-illustration">📚</span><strong>No resource selected</strong><p>Choose a resource from the list to view its details.</p></div>
    : <div className="panel-body details-content"><span className="eyebrow">{item.subject} / {item.level}</span><h3>{item.title}</h3><p className="detail-description">{item.description}</p>
      <div className="detail-grid"><div><small>Subject</small><b>{item.subject}</b></div><div><small>Difficulty</small><b>{item.level}</b></div><div><small>Reading time</small><b>{item.minutes} minutes</b></div><div><small>Author</small><b>{item.author}</b></div><div><small>Year</small><b>{item.year}</b></div><div><small>Featured</small><b>{item.featured ? 'Yes' : 'No'}</b></div><div className="full"><small>Resource ID</small><b>#{item.id}</b></div></div>
      <div className="detail-footnote">Information is loaded asynchronously from the simulated API.</div></div>}
  </section>;
}
