const symbols = {'JavaScript':'JS', 'React':'⚛', 'HTML':'H', 'CSS':'#', 'TypeScript':'TS', 'Node.js':'N', 'Python':'Py', 'Databases':'DB', 'Git':'G', 'UI Design':'UI', 'Testing':'✓', 'Algorithms':'ƒ'};
export default function ResourceCard({ item, selected, onSelect }) {
  return <button type="button" onClick={() => onSelect(item.id)} className={`resource-card ${selected ? 'selected' : ''}`} aria-pressed={selected}>
    <span className="resource-avatar">{symbols[item.subject] || '📖'}</span>
    <span className="resource-info"><span className="resource-title">{item.title}</span><span className="resource-subtitle">{item.subject} <span>·</span> {item.minutes} min read</span></span>
    <span className={`level level-${item.level.toLowerCase()}`}>{item.level}</span><span className="chevron">›</span>
  </button>;
}
