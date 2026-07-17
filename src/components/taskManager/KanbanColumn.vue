<script setup lang="ts">
import { ref } from 'vue'
import type {
  EmptyColumnMessages,
  KanbanColumnEmits,
  KanbanColumnProps,
  StatusClassMap,
  Task,
} from '../../BLL/taskManager/types'
import TaskCard from './TaskCard.vue'

const props = defineProps<KanbanColumnProps>()
const emit = defineEmits<KanbanColumnEmits>()

const isDragOver = ref(false)

const emptyCopy: EmptyColumnMessages = {
  todo: 'No tasks waiting. Add one to get started.',
  'in-progress': 'Nothing in progress. Drag a task here.',
  done: 'No completed tasks yet.',
}

const dotClass: StatusClassMap = {
  todo: 'dot--todo',
  'in-progress': 'dot--progress',
  done: 'dot--done',
}

function onDragOver(event: DragEvent): void {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  isDragOver.value = true
}

function onDragLeave(event: DragEvent): void {
  const currentTarget = event.currentTarget
  const relatedTarget = event.relatedTarget
  if (
    currentTarget instanceof HTMLElement &&
    relatedTarget instanceof Node &&
    currentTarget.contains(relatedTarget)
  ) {
    return
  }
  isDragOver.value = false
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  isDragOver.value = false
  const taskId = event.dataTransfer?.getData('text/plain')
  if (!taskId) {
    return
  }
  props.manager.moveTo(taskId, props.status)
}

function onEdit(task: Task): void {
  emit('edit', task)
}
</script>

<template>
  <section
    class="kanban-column"
    :class="{ 'kanban-column--drag-over': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="kanban-column__header">
      <div class="kanban-column__title-wrap">
        <span class="dot" :class="dotClass[status]" />
        <h2 class="kanban-column__title">{{ manager.getColumnLabel(status) }}</h2>
        <span class="kanban-column__count">{{ manager.getTasksByStatus(status).length }}</span>
      </div>
      <div class="kanban-column__actions">
        <button type="button" class="icon-btn" aria-label="Add task" @click="emit('add')">+</button>
        <button type="button" class="icon-btn" aria-label="Column menu">⋯</button>
      </div>
    </header>

    <TransitionGroup name="card-move" tag="div" class="kanban-column__list">
      <TaskCard
        v-for="task in manager.getTasksByStatus(status)"
        :key="task.id"
        :task="task"
        :manager="manager"
        @edit="onEdit"
      />
    </TransitionGroup>

    <div v-if="manager.getTasksByStatus(status).length === 0" class="kanban-column__empty">
      <div class="kanban-column__empty-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="6" y="10" width="28" height="20" rx="4" stroke="#98A2B3" stroke-width="2" />
          <path d="M14 20h12M14 24h8" stroke="#98A2B3" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <p class="kanban-column__empty-text">{{ emptyCopy[status] }}</p>
    </div>
  </section>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 480px;
  padding: 4px;
  border-radius: 16px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.kanban-column--drag-over {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}

.kanban-column__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--todo {
  background: var(--color-todo);
}

.dot--progress {
  background: var(--color-progress);
}

.dot--done {
  background: var(--color-done);
}

.kanban-column__title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.kanban-column__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #eef0f4;
  color: var(--color-text-muted);
  font-size: 0.6875rem;
  font-weight: 600;
}

.kanban-column__actions {
  display: flex;
  gap: 2px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.icon-btn:hover {
  background: #eef0f4;
  color: var(--color-text);
}

.kanban-column__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.kanban-column__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  min-height: 160px;
  padding: 32px 16px;
  border: 1px dashed #d0d5dd;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.kanban-column__empty-text {
  margin: 0;
  max-width: 180px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.card-move-enter-active,
.card-move-leave-active {
  transition: all 0.25s ease;
}

.card-move-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.card-move-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.card-move-move {
  transition: transform 0.25s ease;
}
</style>
