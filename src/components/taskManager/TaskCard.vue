<script setup lang="ts">
import { ref } from 'vue'
import type { TaskCardEmits, TaskCardProps } from '../../BLL/taskManager/types'

const props = defineProps<TaskCardProps>()
const emit = defineEmits<TaskCardEmits>()

const showConfirm = ref(false)
const showMenu = ref(false)

function onDragStart(event: DragEvent): void {
  if (!event.dataTransfer) {
    return
  }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.task.id)
  showMenu.value = false
}

function requestDelete(): void {
  showMenu.value = false
  showConfirm.value = true
}

function cancelDelete(): void {
  showConfirm.value = false
}

function confirmDeleteAction(): void {
  props.manager.deleteTask(props.task.id)
  showConfirm.value = false
}

function openEdit(): void {
  showMenu.value = false
  emit('edit', props.task)
}

function tagCount(): number {
  return props.task.tags.length
}
</script>

<template>
  <article
    class="task-card"
    draggable="true"
    @dragstart="onDragStart"
  >
    <div class="task-card__top">
      <span class="status-pill" :class="`status-pill--${task.status}`">
        <span class="status-pill__dot" />
        {{ manager.getStatusBadgeLabel(task.status) }}
      </span>
      <div class="task-card__menu-wrap">
        <button
          type="button"
          class="icon-btn"
          aria-label="Card menu"
          @click.stop="showMenu = !showMenu"
        >
          ⋯
        </button>
        <div v-if="showMenu" class="menu">
          <button type="button" class="menu__item" @click="openEdit">Edit</button>
          <button type="button" class="menu__item menu__item--danger" @click="requestDelete">
            Delete
          </button>
        </div>
      </div>
    </div>

    <h3 class="task-card__title">{{ task.title }}</h3>
    <p class="task-card__description">{{ task.description }}</p>

    <div class="task-card__assignees">
      <span class="task-card__assignees-label">Assignees:</span>
      <span
        class="avatar"
        :style="{ backgroundColor: manager.getAssigneeColor(task.assignee) }"
        :title="task.assignee"
      >
        {{ manager.getInitials(task.assignee) }}
      </span>
    </div>

    <div class="task-card__meta">
      <span
        class="task-card__due"
        :class="{ 'task-card__due--overdue': manager.isOverdue(task) }"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 15l8-12 8 12H4z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </svg>
        {{ manager.formatDueDate(task.dueDate) }}
      </span>
      <span class="priority-badge" :class="`priority-badge--${task.priority}`">
        {{ task.priority }}
      </span>
    </div>

    <div v-if="task.tags.length > 0" class="task-card__tags">
      <span v-for="tag in task.tags.slice(0, 3)" :key="tag" class="tag-chip">
        {{ tag }}
      </span>
    </div>

    <footer class="task-card__footer">
      <span class="task-card__stat">💬 {{ 4 + (task.title.length % 9) }} Comments</span>
      <span class="task-card__stat">🔗 {{ Math.max(tagCount(), 1) }} Links</span>
      <span class="task-card__stat">☑ {{ task.status === 'done' ? '3/3' : '0/3' }}</span>
    </footer>

    <div v-if="showConfirm" class="task-card__confirm">
      <p class="task-card__confirm-text">Delete this task?</p>
      <div class="task-card__confirm-actions">
        <button type="button" class="btn btn--ghost" @click="cancelDelete">Cancel</button>
        <button type="button" class="btn btn--danger" @click="confirmDeleteAction">Delete</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.task-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e8eaef;
  border-radius: 14px;
  padding: 16px;
  box-shadow: var(--shadow-card);
  cursor: grab;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.task-card:active {
  cursor: grabbing;
}

.task-card:hover {
  box-shadow: 0 6px 16px rgba(16, 24, 40, 0.08);
}

.task-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.status-pill__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-pill--todo {
  background: #ede9fe;
  color: #7c5cfc;
}

.status-pill--in-progress {
  background: #ffedd5;
  color: #ea580c;
}

.status-pill--done {
  background: #dcfce7;
  color: #16a34a;
}

.task-card__menu-wrap {
  position: relative;
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
  color: #374151;
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

.task-card__title {
  margin: 0 0 8px;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-card__description {
  margin: 0 0 12px;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.45;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-card__assignees {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.task-card__assignees-label {
  font-size: 0.6875rem;
  color: #9ca3af;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.625rem;
  font-weight: 600;
  color: #fff;
}

.task-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.task-card__due {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  font-weight: 400;
  color: #6b7280;
}

.task-card__due--overdue {
  color: var(--color-overdue);
  font-weight: 600;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
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

.task-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.tag-chip {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.6875rem;
  font-weight: 500;
}

.task-card__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
}

.task-card__stat {
  font-size: 0.6875rem;
  color: #9ca3af;
  font-weight: 500;
}

.task-card__confirm {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 14px;
  z-index: 2;
}

.task-card__confirm-text {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.task-card__confirm-actions {
  display: flex;
  gap: 8px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn--ghost {
  background: #f3f4f6;
  color: #374151;
}

.btn--danger {
  background: #d92d20;
  color: #fff;
}
</style>
