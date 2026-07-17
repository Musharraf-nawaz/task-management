<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { TaskManager } from '../../BLL/taskManager/TaskManager'
import {
  isTaskPriority,
  isViewMode,
  type Task,
  type TaskPriority,
  type ViewMode,
} from '../../BLL/taskManager/types'
import KanbanBoard from '../../components/taskManager/KanbanBoard.vue'
import ListView from '../../components/taskManager/ListView.vue'
import TaskModal from '../../components/taskManager/TaskModal.vue'
import ViewToggle from '../../components/taskManager/ViewToggle.vue'

const VIEW_STORAGE_KEY = 'task-manager-view'

const manager = reactive(new TaskManager())
const activeView = ref<ViewMode>('kanban')
const modalVisible = ref(false)
const editingTask = ref<Task | null>(null)
const showFilters = ref(false)

const priorities: TaskPriority[] = ['low', 'medium', 'high']

const teamPreview = [
  'Sarah Chen',
  'Marcus Thompson',
  'Priya Patel',
  'James Okonkwo',
]

function readStoredView(): ViewMode {
  const stored = localStorage.getItem(VIEW_STORAGE_KEY)
  if (stored && isViewMode(stored)) {
    return stored
  }
  return 'kanban'
}

onMounted(() => {
  activeView.value = readStoredView()
})

watch(activeView, (value) => {
  localStorage.setItem(VIEW_STORAGE_KEY, value)
})

function openCreateModal(): void {
  editingTask.value = null
  modalVisible.value = true
}

function openEditModal(task: Task): void {
  editingTask.value = task
  modalVisible.value = true
}

function closeModal(): void {
  modalVisible.value = false
  editingTask.value = null
}

function onPriorityChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) {
    return
  }
  const value = target.value
  manager.setPriorityFilter(isTaskPriority(value) ? value : null)
}

function onAssigneeChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) {
    return
  }
  const value = target.value
  manager.setAssigneeFilter(value === '' ? null : value)
}

function clearFilters(): void {
  manager.setPriorityFilter(null)
  manager.setAssigneeFilter(null)
}
</script>

<template>
  <div class="app-shell">
    <aside class="rail" aria-hidden="true">
      <div class="rail__logo">T</div>
      <div class="rail__icons">
        <span class="rail__dot" />
        <span class="rail__dot" />
        <span class="rail__dot" />
        <span class="rail__dot" />
      </div>
      <button type="button" class="rail__add" aria-label="Add">+</button>
    </aside>

    <aside class="sidebar">
      <div class="sidebar__profile">
        <span
          class="avatar avatar--lg"
          :style="{ backgroundColor: manager.getAssigneeColor('Davis Donin') }"
        >
          DD
        </span>
        <div class="sidebar__profile-copy">
          <p class="sidebar__name">Davis Donin</p>
          <p class="sidebar__email">daviddonin@gmail.com</p>
        </div>
        <button type="button" class="icon-btn" aria-label="Profile menu">⋯</button>
      </div>

      <p class="sidebar__section-label">Menu</p>
      <nav class="sidebar__nav">
        <a class="sidebar__link" href="#" @click.prevent>
          <span class="sidebar__icon">⌂</span> Dashboard
        </a>
        <a class="sidebar__link" href="#" @click.prevent>
          <span class="sidebar__icon">✉</span> Inbox
        </a>
        <a class="sidebar__link" href="#" @click.prevent>
          <span class="sidebar__icon">▦</span> Calendar
        </a>
      </nav>

      <div class="sidebar__section-row">
        <p class="sidebar__section-label">Team spaces</p>
        <button type="button" class="icon-btn icon-btn--sm" aria-label="Add space">+</button>
      </div>
      <nav class="sidebar__nav">
        <a class="sidebar__link sidebar__link--active" href="#" @click.prevent>
          <span class="sidebar__icon">☑</span> Tasks
        </a>
        <a class="sidebar__link" href="#" @click.prevent>
          <span class="sidebar__icon">☰</span> Docs
        </a>
        <a class="sidebar__link" href="#" @click.prevent>
          <span class="sidebar__icon">◎</span> Meeting
        </a>
      </nav>

      <div class="sidebar__bottom">
        <p class="sidebar__section-label">Other</p>
        <nav class="sidebar__nav">
          <a class="sidebar__link" href="#" @click.prevent>
            <span class="sidebar__icon">⚙</span> Settings
          </a>
          <a class="sidebar__link" href="#" @click.prevent>
            <span class="sidebar__icon">?</span> Support
          </a>
        </nav>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <p class="breadcrumb">
          Team spaces <span class="breadcrumb__sep">›</span> <strong>Tasks</strong>
        </p>
        <div class="topbar__right">
          <label class="search">
            <span class="search__icon" aria-hidden="true">⌕</span>
            <input class="search__input" type="search" placeholder="Search..." />
            <kbd class="search__kbd">⌘F</kbd>
          </label>
          <button type="button" class="icon-btn" aria-label="Help">?</button>
          <button type="button" class="icon-btn" aria-label="Notifications">🔔</button>
        </div>
      </header>

      <section class="page-hero">
        <div class="page-hero__copy">
          <h1 class="page-title">Tasks</h1>
          <p class="page-subtitle">Short description will be placed here.</p>
        </div>
        <div class="page-hero__actions">
          <div class="avatar-stack">
            <span
              v-for="name in teamPreview"
              :key="name"
              class="avatar avatar--sm"
              :style="{ backgroundColor: manager.getAssigneeColor(name) }"
              :title="name"
            >
              {{ manager.getInitials(name) }}
            </span>
            <span class="avatar avatar--sm avatar--more">+2</span>
          </div>
          <button type="button" class="btn btn--primary">Invite Member</button>
          <button type="button" class="btn btn--outline">Share</button>
          <button type="button" class="btn btn--primary" @click="openCreateModal">
            + Add Task
          </button>
        </div>
      </section>

      <section class="toolbar">
        <ViewToggle v-model="activeView" />
        <div class="toolbar__right">
          <button type="button" class="toolbar__chip" @click="showFilters = !showFilters">
            Filter
          </button>
          <button type="button" class="toolbar__chip" @click="manager.toggleSort('dueDate')">
            Sort
          </button>
          <button type="button" class="icon-btn" aria-label="More">⋯</button>
        </div>
      </section>

      <section v-if="showFilters" class="filters" aria-label="Task filters">
        <label class="filters__field">
          <span class="filters__label">Priority</span>
          <select
            class="filters__select"
            :value="manager.filters.priority ?? ''"
            @change="onPriorityChange"
          >
            <option value="">All priorities</option>
            <option v-for="priority in priorities" :key="priority" :value="priority">
              {{ priority }}
            </option>
          </select>
        </label>

        <label class="filters__field">
          <span class="filters__label">Assignee</span>
          <select
            class="filters__select"
            :value="manager.filters.assignee ?? ''"
            @change="onAssigneeChange"
          >
            <option value="">All assignees</option>
            <option
              v-for="assignee in manager.getUniqueAssignees()"
              :key="assignee"
              :value="assignee"
            >
              {{ assignee }}
            </option>
          </select>
        </label>

        <button
          v-if="manager.filters.priority || manager.filters.assignee"
          type="button"
          class="btn btn--ghost"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </section>

      <KanbanBoard
        v-if="activeView === 'kanban'"
        :manager="manager"
        @edit="openEditModal"
        @add="openCreateModal"
      />
      <ListView
        v-else
        :manager="manager"
        @edit="openEditModal"
      />
    </main>

    <TaskModal
      :manager="manager"
      :task="editingTask"
      :visible="modalVisible"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 64px 240px minmax(0, 1fr);
  min-height: 100vh;
  background: var(--color-bg);
}

.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
  background: var(--color-sidebar-rail);
}

.rail__logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.rail__icons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  flex: 1;
}

.rail__dot {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
}

.rail__add {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  cursor: pointer;
  font-size: 1.125rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 20px 16px;
}

.sidebar__profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.sidebar__profile-copy {
  flex: 1;
  min-width: 0;
}

.sidebar__name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.sidebar__email {
  margin: 0;
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__section-label {
  margin: 0 0 8px;
  padding: 0 8px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-soft);
}

.sidebar__section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
}

.sidebar__link:hover {
  background: #f8f9fb;
  color: var(--color-text);
}

.sidebar__link--active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.sidebar__link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 999px;
  background: var(--color-primary);
}

.sidebar__icon {
  width: 16px;
  text-align: center;
  opacity: 0.8;
}

.sidebar__bottom {
  margin-top: auto;
  padding-top: 24px;
}

.main {
  min-width: 0;
  padding: 20px 28px 32px;
  overflow: auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.breadcrumb {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.breadcrumb__sep {
  margin: 0 6px;
  color: var(--color-text-soft);
}

.breadcrumb strong {
  color: var(--color-text);
  font-weight: 600;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 240px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
}

.search__icon {
  color: var(--color-text-soft);
}

.search__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.8125rem;
  min-width: 0;
}

.search__kbd {
  font-size: 0.6875rem;
  color: var(--color-text-soft);
  background: #f3f4f6;
  border-radius: 4px;
  padding: 2px 6px;
}

.page-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.page-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.page-hero__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.avatar-stack {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.avatar-stack .avatar {
  margin-left: -8px;
  border: 2px solid #fff;
}

.avatar-stack .avatar:first-child {
  margin-left: 0;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar--lg {
  width: 40px;
  height: 40px;
  font-size: 0.75rem;
}

.avatar--sm {
  width: 28px;
  height: 28px;
  font-size: 0.625rem;
}

.avatar--more {
  background: #e5e7eb;
  color: var(--color-text-muted);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0;
}

.toolbar__right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.toolbar__chip {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.toolbar__chip:hover {
  background: #f3f4f6;
  color: var(--color-text);
}

.filters {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.filters__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filters__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.filters__select {
  min-width: 180px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 0.875rem;
  background: #fff;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.icon-btn:hover {
  background: #f3f4f6;
  color: var(--color-text);
}

.icon-btn--sm {
  width: 24px;
  height: 24px;
}

.btn {
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--outline {
  background: #fff;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn--ghost {
  background: #f3f4f6;
  color: var(--color-text);
}
</style>
