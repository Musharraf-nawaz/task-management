<script setup lang="ts">
import { ref } from 'vue'
import type {
  ListViewEmits,
  ListViewProps,
  SortField,
  StatusClassMap,
  StatusCollapsedMap,
  Task,
  TaskStatus,
} from '../../BLL/taskManager/types'

const props = defineProps<ListViewProps>()
const emit = defineEmits<ListViewEmits>()

const collapsed = ref<StatusCollapsedMap>({
  todo: false,
  'in-progress': false,
  done: false,
})

const openMenuId = ref<string | null>(null)

const groups: TaskStatus[] = ['todo', 'in-progress', 'done']

const groupTone: StatusClassMap = {
  todo: 'group--todo',
  'in-progress': 'group--progress',
  done: 'group--done',
}

function toggleSort(field: SortField): void {
  props.manager.toggleSort(field)
}

function sortIndicator(field: SortField): string {
  if (props.manager.sortConfig.field !== field) {
    return ''
  }
  return props.manager.sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
}

function tasksFor(status: TaskStatus): Task[] {
  return props.manager.getSortedTasksByStatus(status)
}

function toggleGroup(status: TaskStatus): void {
  collapsed.value[status] = !collapsed.value[status]
}

function onEdit(task: Task): void {
  openMenuId.value = null
  emit('edit', task)
}

function onDelete(task: Task): void {
  openMenuId.value = null
  const confirmed = window.confirm(`Delete "${task.title}"?`)
  if (confirmed) {
    props.manager.deleteTask(task.id)
  }
}

function toggleMenu(taskId: string): void {
  openMenuId.value = openMenuId.value === taskId ? null : taskId
}
</script>

<template>
  <div class="list-view">
    <div class="list-view__sort">
      <button type="button" class="sort-btn" @click="toggleSort('dueDate')">
        Due date{{ sortIndicator('dueDate') }}
      </button>
      <button type="button" class="sort-btn" @click="toggleSort('priority')">
        Priority{{ sortIndicator('priority') }}
      </button>
    </div>

    <section
      v-for="status in groups"
      :key="status"
      class="group"
      :class="groupTone[status]"
    >
      <button type="button" class="group__header" @click="toggleGroup(status)">
        <span class="group__label">{{ manager.getStatusBadgeLabel(status) }}</span>
        <span class="group__count">{{ tasksFor(status).length }}</span>
        <span class="group__chevron">{{ collapsed[status] ? '▾' : '▴' }}</span>
      </button>

      <div v-if="!collapsed[status]" class="group__body">
        <div class="list-view__header">
          <span>Task Name</span>
          <span>Descriptions</span>
          <span>People</span>
          <span>Tags</span>
          <span>Timeline Date</span>
          <span>Priority</span>
          <span />
        </div>

        <div
          v-for="task in tasksFor(status)"
          :key="task.id"
          class="list-view__row"
        >
          <div class="cell cell--title">
            <input type="checkbox" :checked="task.status === 'done'" disabled />
            <button type="button" class="linkish" @click="onEdit(task)">
              {{ task.title }}
            </button>
          </div>
          <p class="cell cell--desc">{{ task.description }}</p>
          <div class="cell cell--people">
            <span
              class="avatar"
              :style="{ backgroundColor: manager.getAssigneeColor(task.assignee) }"
              :title="task.assignee"
            >
              {{ manager.getInitials(task.assignee) }}
            </span>
          </div>
          <div class="cell cell--tags">
            <span v-for="tag in task.tags.slice(0, 2)" :key="tag" class="type-pill">
              {{ tag }}
            </span>
            <span v-if="task.tags.length === 0" class="muted">—</span>
          </div>
          <span
            class="cell"
            :class="{ overdue: manager.isOverdue(task) }"
          >
            {{ manager.formatDueDate(task.dueDate) }}
          </span>
          <span class="priority-badge" :class="`priority-badge--${task.priority}`">
            {{ task.priority }}
          </span>
          <div class="cell cell--actions">
            <button
              type="button"
              class="icon-btn"
              aria-label="Row menu"
              @click.stop="toggleMenu(task.id)"
            >
              ⋯
            </button>
            <div v-if="openMenuId === task.id" class="menu">
              <button type="button" class="menu__item" @click="onEdit(task)">Edit</button>
              <button type="button" class="menu__item menu__item--danger" @click="onDelete(task)">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div v-if="tasksFor(status).length === 0" class="group__empty">
          No tasks in this group.
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-view__sort {
  display: flex;
  gap: 8px;
}

.sort-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
}

.group {
  background: #fff;
  border: 1px solid #e8eaef;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.group__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  text-align: left;
}

.group--todo .group__header {
  background: #fff7ed;
}

.group--progress .group__header {
  background: #fffbeb;
}

.group--done .group__header {
  background: #ecfdf5;
}

.group__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
}

.group__count {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.group__chevron {
  margin-left: auto;
  color: #9ca3af;
}

.list-view__header,
.list-view__row {
  display: grid;
  grid-template-columns: 1.4fr 1.6fr 90px 140px 140px 100px 40px;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
}

.list-view__header {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  border-bottom: 1px solid #f3f4f6;
}

.list-view__row {
  border-bottom: 1px solid #f3f4f6;
}

.list-view__row:last-child {
  border-bottom: none;
}

.cell--title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.linkish {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell--desc {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.625rem;
  font-weight: 600;
}

.type-pill {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.6875rem;
  font-weight: 500;
  margin-right: 4px;
}

.muted {
  color: #9ca3af;
  font-size: 0.75rem;
}

.overdue {
  color: var(--color-overdue);
  font-weight: 600;
  font-size: 0.75rem;
}

.cell {
  font-size: 0.75rem;
  color: #4b5563;
}

.priority-badge {
  display: inline-flex;
  width: fit-content;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.priority-badge--high {
  background: var(--color-high-bg);
  color: var(--color-high-text);
}

.priority-badge--medium {
  background: var(--color-medium-bg);
  color: var(--color-medium-text);
}

.priority-badge--low {
  background: var(--color-low-bg);
  color: var(--color-low-text);
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.cell--actions {
  position: relative;
  display: flex;
  justify-content: flex-end;
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 5;
  min-width: 120px;
  padding: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: var(--shadow-panel);
}

.menu__item {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
}

.menu__item:hover {
  background: #f3f4f6;
}

.menu__item--danger {
  color: #d92d20;
}

.group__empty {
  padding: 24px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.8125rem;
}
</style>
