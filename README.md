# Taskflow — React Effects & Async API Lab

This is a complete solution to **Task 4: Async React — Effects & API**, implemented with React and Vite.

## How to run (Windows / VS Code)

1. Install [Node.js LTS](https://nodejs.org/).
2. Open this project folder in VS Code.
3. In the VS Code terminal run:

```bash
npm install
npm run dev
```

4. Open the local URL printed by Vite (typically http://localhost:5173).

To create a deployable build:

```bash
npm run build
```

## Requirements implemented

- `useEffect` loads list and selected item details through an asynchronous fake API.
- 9 meaningful item fields: `id`, `name`, `description`, `status`, `priority`, `category`, `assignee`, `dueDate`, `estimate`, plus `completed`.
- Create, edit, delete, complete and reopen tasks.
- List reload, search and status filter.
- Loading, error, empty and success states.
- Simulated randomized network delays, errors, and persistent browser `localStorage`.
- Cleanup via `ignore` flag in both effects ensures old requests cannot overwrite new state.
- Mutation functions capture an item's ID before `await`, serialize conflicting actions with a `busy` flag, and only update matching selected details.
- Responsive UI; only `useState` and `useEffect` used. No custom hooks, external fetching libraries, or component-level localStorage calls.

**Note:** The API re-implements the same mechanics as the [provided example](https://github.com/leravanna/fake-api) rather than copying that repository's files. The assignment explicitly allows similar mechanics. Its localStorage dataset is local to each browser, not a shared server.

## Defense: concise explanations

- **useEffect:** React runs effects after rendering; here they request asynchronous data.
- **Dependencies:** `[listVersion]` reloads the list when refresh counter changes; `[selectedId, detailsVersion]` reloads details when selection or revision changes.
- **Cleanup:** `return () => { ignore = true; }` prevents results of superseded/unmounted effects from changing the UI. Requests may still finish; their results are ignored.
- **Race condition:** If task A responds after task B, A's stale effect is ignored, so B's details remain on screen.
- **Stale closure:** ID is captured (`const targetId = details.id`) before `await`; completion uses this ID even if the user switches to another task while the request is pending.
- **Conflicting actions:** `busy` disables edits/completion/deletion and prevents launching another mutation until the pending mutation settles.
- **Testing:** Quickly click different tasks during loading. Complete a task, immediately select another, then verify only the first task changed after the delay. Set `API_CONFIG.errorChance = 0.5` temporarily to demonstrate error handling; set back to `0.08` before submitting.

## Deployment

1. Push this folder to your own GitHub repo.
2. Import it to https://vercel.com/new (Framework Preset: Vite, Build Command: `npm run build`, Output Directory: `dist`).
3. Submit BOTH the GitHub repository URL and your deployed Vercel URL.

Deployment and GitHub publishing must be done from your accounts.
