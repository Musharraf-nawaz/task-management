# Task Manager

Vue 3 + TypeScript take-home assessment: a Kanban / List task board with all business logic encapsulated in a single `TaskManager` class.

## Setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`). Mock backlog data loads when `TaskManager` is constructed.

```bash
npm run build
```

Type-checks with `vue-tsc` and produces a production build in `dist/`.

## Architecture overview

```
src/
├── BLL/taskManager/
│   ├── types.ts        # All shared interfaces & type aliases
│   ├── mockData.ts     # Seed Task[] loaded by TaskManager
│   └── TaskManager.ts  # CRUD, filters, sort, overdue checks
├── components/taskManager/
│   ├── KanbanBoard.vue
│   ├── KanbanColumn.vue
│   ├── TaskCard.vue
│   ├── ListView.vue
│   ├── TaskModal.vue
│   └── ViewToggle.vue
└── pages/taskManager/
    └── index.vue       # Single TaskManager instance; prop-threads to children
```

**Why a class instead of Pinia/Vuex?** The brief requires one `TaskManager` instance created in `pages/taskManager/index.vue` and passed as a typed prop. That keeps domain rules (create/update/delete/move/filter/sort/overdue) outside Vue components and makes the UI a thin renderer.

**Reactivity:** The page wraps the instance with Vue’s `reactive()`, so mutations inside class methods (`push`, `splice`, property writes) update the board without leaking filter/sort logic into computed properties.

**Component hierarchy:** `index.vue` owns view mode, filters UI, and modal open state. `KanbanBoard` → `KanbanColumn` → `TaskCard` for the board; `ListView` for the flat table. Every child receives `manager: ITaskManager` (or `task` / `status` where needed). No `provide`/`inject`, no global store.

**Trade-off:** Prop drilling is intentional and explicit. For a larger app I would still keep `TaskManager` as the domain layer and only introduce a store if multiple disconnected trees needed the same instance.

## Design decisions

1. **UI matches the provided Dribbble-style references** (sidebar + board + right detail drawer). Purple accent (`#7C5CFC`), Inter typography, card structure (status pill, assignees, flag date, priority badge, footer stats), and task detail properties/activity layout follow those screens. Decorative chrome (Overview/Table/Timeline tabs, Invite/Share, activity file card) is presentational where the assessment data model does not include those entities.

2. **Delete confirmation lives on the card (Kanban) and uses `window.confirm` in List view.** Spec required confirmation before `deleteTask()` but did not list a separate dialog component; keeping it inside existing files avoids inventing structure outside the required tree.

3. **Filters call `TaskManager` methods only.** Dropdowns in `index.vue` call `setPriorityFilter` / `setAssigneeFilter`; columns and list call `getTasksByStatus` / `getSortedTasks`. Templates never filter or sort arrays themselves.

## Known limitations

- Layout chrome (dark rail, sidebar nav, Invite/Share, Overview/Table/Timeline) is visual to match the design reference; only Board and List views are functional.
- Pixel-perfect match depends on the provided screenshots; spacing/tokens follow those boards (purple accent, Inter, card anatomy, right detail drawer).
- Mobile layout is out of scope; page enforces a 1280px minimum width as specified.
- Create validation rejects past due dates. Editing an existing overdue task may keep its current due date; changing it to another past date is still blocked.
- Mock data is in-memory only; refresh restores the seed set (view mode alone is persisted via `localStorage`).
- Activity feed in the detail drawer is illustrative UI derived from the open task (not a persisted activity log).
- Tags are entered as a comma-separated string in the edit form rather than a chip editor.

## Time log (approximate)

| Block | Focus |
| --- | --- |
| 0–1h | Scaffold Vite + Vue 3 + TS, route to page, file structure |
| 1–3h | `types.ts`, `mockData.ts`, `TaskManager` CRUD / filter / sort |
| 3–7h | Kanban DnD, cards, empty states, list sort, filters, modal |
| 7–9h | Polish UI (type scale, badges, overdue, transitions), README |
| Remaining | Walkthrough prep, edge-case checks, build verification |

## Mock data constraints (verified)

- 12 tasks across `todo`, `in-progress`, and `done`
- ≥3 tasks per priority (`low` / `medium` / `high`)
- ≥3 overdue tasks (past `dueDate`, status ≠ `done`) relative to 2026-07-17
- 4 assignees: Sarah Chen, Marcus Thompson, Priya Patel, James Okonkwo (+ Elena Volkov)
- Domain-style titles/descriptions and tags on ≥6 tasks
