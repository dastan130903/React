// Simulated API based on the mechanics of github.com/leravanna/fake-api.
// All localStorage access is isolated here, never inside React components.
const STORAGE_KEY = 'react-effects-taskflow-v1';
export const API_CONFIG = { minDelay: 500, maxDelay: 2400, errorChance: 0.08 };

const initialItems = [
  { id: 1, name: 'Design landing page', description: 'Create the first version of a responsive landing page with clear navigation.', status: 'In progress', priority: 'High', category: 'Design', assignee: 'Aruzhan', dueDate: '2026-11-08', estimate: 8, completed: false },
  { id: 2, name: 'Connect analytics', description: 'Add basic event tracking and validate dashboard metrics.', status: 'Todo', priority: 'Medium', category: 'Development', assignee: 'Dastan', dueDate: '2026-11-12', estimate: 5, completed: false },
  { id: 3, name: 'Review accessibility', description: 'Test keyboard navigation, contrast and semantic labels.', status: 'Done', priority: 'High', category: 'Testing', assignee: 'Dana', dueDate: '2026-10-29', estimate: 4, completed: true },
  { id: 4, name: 'Prepare release notes', description: 'Summarize changes and known issues for the next release.', status: 'Todo', priority: 'Low', category: 'Content', assignee: 'Timur', dueDate: '2026-11-16', estimate: 3, completed: false },
  { id: 5, name: 'Improve loading states', description: 'Add visual feedback and an accessible error recovery flow.', status: 'In progress', priority: 'Medium', category: 'Development', assignee: 'Ali', dueDate: '2026-11-04', estimate: 6, completed: false },
];

function loadDb() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (json !== null) return JSON.parse(json);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
  return initialItems;
}
function saveDb(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function fakeRequest(callback) {
  return new Promise((resolve, reject) => {
    const delay = Math.floor(Math.random() * (API_CONFIG.maxDelay - API_CONFIG.minDelay + 1)) + API_CONFIG.minDelay;
    setTimeout(() => {
      if (Math.random() < API_CONFIG.errorChance) return reject(new Error('Simulated server error. Please try again.'));
      try { resolve(callback()); } catch (error) { reject(error); }
    }, delay);
  });
}
export function getItemsList() {
  return fakeRequest(() => ({ data: loadDb().map(({ id, name, status, priority, category, completed }) => ({ id, name, status, priority, category, completed })) }));
}
export function getItem(id) {
  return fakeRequest(() => {
    const item = loadDb().find(item => item.id === Number(id));
    if (!item) throw new Error('Item not found');
    return { ...item };
  });
}
export function createItem(input) {
  return fakeRequest(() => {
    const items = loadDb();
    const nextId = items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
    const created = { ...input, id: nextId, completed: input.status === 'Done' };
    saveDb([...items, created]);
    return { ...created };
  });
}
export function updateItem(id, changes) {
  return fakeRequest(() => {
    const items = loadDb();
    const current = items.find(item => item.id === Number(id));
    if (!current) throw new Error('Item not found');
    const updated = { ...current, ...changes, id: current.id };
    saveDb(items.map(item => item.id === updated.id ? updated : item));
    return { ...updated };
  });
}
export function deleteItem(id) {
  return fakeRequest(() => {
    const items = loadDb();
    if (!items.some(item => item.id === Number(id))) throw new Error('Item not found');
    saveDb(items.filter(item => item.id !== Number(id)));
    return { success: true, id: Number(id) };
  });
}
