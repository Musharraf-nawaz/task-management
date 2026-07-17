<script setup lang="ts">
import type { KanbanBoardEmits, KanbanBoardProps, Task, TaskStatus } from '../../BLL/taskManager/types'
import KanbanColumn from './KanbanColumn.vue'

defineProps<KanbanBoardProps>()
const emit = defineEmits<KanbanBoardEmits>()

const columns: TaskStatus[] = ['todo', 'in-progress', 'done']

function onEdit(task: Task): void {
  emit('edit', task)
}

function onAdd(): void {
  emit('add')
}
</script>

<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="status in columns"
      :key="status"
      :manager="manager"
      :status="status"
      @edit="onEdit"
      @add="onAdd"
    />
    <button type="button" class="kanban-board__add-column" aria-label="Add column">+</button>
  </div>
</template>

<style scoped>
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr)) 48px;
  gap: 16px;
  align-items: start;
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 8px;
}

.kanban-board__add-column {
  width: 40px;
  height: 40px;
  margin-top: 4px;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: transparent;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
}

.kanban-board__add-column:hover {
  background: #fff;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
