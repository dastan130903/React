export default function StatCard({ number, label, symbol }) {
  return <div className="stat-card"><div className="stat-icon">{symbol}</div><div><div className="stat-number">{number}</div><div className="muted small">{label}</div></div></div>;
}
