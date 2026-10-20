import ResourceCard from './ResourceCard';
export default function ResourceList({ items, selectedId, onSelect }) {
  return <div className="resource-list">{items.map(item => <ResourceCard key={item.id} item={item} selected={selectedId === item.id} onSelect={onSelect} />)}</div>;
}
