# Task Manager

Vue 3 + TypeScript take-home. Kanban + list board. All task logic sits in one `TaskManager` class.

## Setup

```bash
npm install
npm run dev
```

Then open the Vite URL (usually `http://localhost:5173`). Seed data loads on start.

```bash
npm run build
```

## Architecture

```
src/
├── BLL/taskManager/
│   ├── types.ts
│   ├── mockData.ts
│   └── TaskManager.ts   # CRUD, filters, sort
├── components/taskManager/
│   ├── KanbanBoard.vue
│   ├── KanbanColumn.vue
│   ├── TaskCard.vue
│   ├── ListView.vue
│   ├── TaskModal.vue
│   └── ViewToggle.vue
└── pages/taskManager/
    └── index.vue        # creates the one TaskManager instance
```

`index.vue` builds `reactive(new TaskManager())` once and passes it down as a prop. No Pinia, Vuex, or provide/inject — the brief wanted it that way.

Components mostly just render. Filtering/sorting/moves go through the class. Prop drilling is a bit noisy, but it’s clear and easy to walk through in review.

## Design decisions

1. **Matched the board screenshots as closely as I could** — sidebar shell, card layout, purple accents, right-side task drawer. Extra bits like Overview/Table tabs and Invite are just UI chrome; only Board and List actually work.

2. **Delete confirm stays in the existing components** — overlay on Kanban cards, `window.confirm` in list. Spec asked for a confirm step but didn’t ask for a separate dialog file, so I didn’t add one.

3. **Filters stay on the class** — the page only calls `setPriorityFilter` / `setAssigneeFilter`. Columns and list pull data via `getTasksByStatus` / `getSortedTasks`, not local filter logic.

## Known limitations

- Sidebar links (Dashboard, Inbox, etc.) don’t navigate — not in the required scope.
- Mobile wasn’t required; layout targets 1280px+.
- New due dates can’t be in the past. Editing an already-overdue task can keep the old date.
- Refresh resets tasks to mock data. Only the Board/List preference is saved.
- Activity tab in the drawer is fake UI for the design, not a real log.
- Tags in the form are comma-separated text.

## Time log

| Block | What I did |
| --- | --- |
| ~1h | Vite + Vue/TS setup, folder layout |
| ~2h | types, mock data, TaskManager |
| ~4h | Board DnD, cards, list, filters, modal |
| ~2h | UI polish + README |
| leftover | edge cases, build check |

## Mock data

- 12 tasks, all three statuses
- at least 3 per priority
- 4 overdue (not done, past due vs 2026-07-17)
- 5 named assignees
- tags on most tasks
