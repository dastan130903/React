// Simulated asynchronous API. Only this module accesses localStorage.
const STORAGE_KEY = 'studyshelf-midterm-v1';
const subjects = [
  'JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Node.js',
  'Python', 'Databases', 'Git', 'UI Design', 'Testing', 'Algorithms'
];
const topics = [
  'Fundamentals', 'Practice Exercises', 'Common Patterns', 'Beginner Guide',
  'Project Workshop', 'Interview Questions', 'Advanced Techniques',
  'Quick Reference', 'Hands-on Examples', 'Tips and Tricks'
];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const seedItems = () => subjects.flatMap((subject, subjectIndex) =>
  topics.map((topic, topicIndex) => ({
    id: subjectIndex * topics.length + topicIndex + 1,
    title: `${subject}: ${topic}`,
    subject,
    level: levels[(subjectIndex + topicIndex) % levels.length],
    minutes: 15 + ((subjectIndex * 7 + topicIndex * 9) % 12) * 5,
    description: `Learn ${topic.toLowerCase()} in ${subject} through clear explanations, short examples and practical exercises.`,
    author: ['StudyShelf Team', 'Alex Morgan', 'Sam Lee', 'Dana Smith'][((subjectIndex + topicIndex) % 4)],
    year: 2024 + (topicIndex % 3),
    featured: topicIndex % 4 === 0
  }))
);

function readItems() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* malformed data falls back to initial records */ }
  }
  const initial = seedItems(); // 12 subjects × 10 topics = 120 records
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function writeItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function simulate(result) {
  return new Promise((resolve, reject) => {
    const delay = 350 + Math.floor(Math.random() * 850);
    setTimeout(() => {
      // Fail occasionally so loading/error/retry paths are testable.
      if (Math.random() < 0.06) {
        reject(new Error('Temporary API error. Please try again.'));
        return;
      }
      try { resolve(result()); } catch (error) { reject(error); }
    }, delay);
  });
}

export function getResources() {
  return simulate(() => readItems());
}

export function getResource(id) {
  return simulate(() => {
    const item = readItems().find((entry) => entry.id === Number(id));
    if (!item) throw new Error('Resource not found.');
    return { ...item };
  });
}

export function createResource(data) {
  return simulate(() => {
    const items = readItems();
    const newItem = {
      ...data,
      id: Math.max(0, ...items.map((item) => item.id)) + 1,
      minutes: Number(data.minutes),
      author: 'You',
      year: new Date().getFullYear(),
      featured: false
    };
    writeItems([newItem, ...items]);
    return { ...newItem };
  });
}
