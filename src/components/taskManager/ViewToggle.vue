<script setup lang="ts">
import type { ViewMode, ViewToggleEmits, ViewToggleProps } from '../../BLL/taskManager/types'

defineProps<ViewToggleProps>()
const emit = defineEmits<ViewToggleEmits>()

function select(mode: ViewMode): void {
  emit('update:modelValue', mode)
}
</script>

<template>
  <div class="view-tabs" role="tablist" aria-label="View mode">
    <button type="button" class="view-tabs__item view-tabs__item--muted" disabled>
      Overview
    </button>
    <button
      type="button"
      class="view-tabs__item"
      :class="{ 'view-tabs__item--active': modelValue === 'kanban' }"
      role="tab"
      :aria-selected="modelValue === 'kanban'"
      @click="select('kanban')"
    >
      Board
    </button>
    <button
      type="button"
      class="view-tabs__item"
      :class="{ 'view-tabs__item--active': modelValue === 'list' }"
      role="tab"
      :aria-selected="modelValue === 'list'"
      @click="select('list')"
    >
      List
    </button>
    <button type="button" class="view-tabs__item view-tabs__item--muted" disabled>
      Table
    </button>
    <button type="button" class="view-tabs__item view-tabs__item--muted" disabled>
      Timeline
    </button>
  </div>
</template>

<style scoped>
.view-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-tabs__item {
  position: relative;
  border: none;
  background: transparent;
  padding: 12px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
}

.view-tabs__item--muted {
  opacity: 0.55;
  cursor: default;
}

.view-tabs__item--active {
  color: var(--color-primary);
  font-weight: 600;
}

.view-tabs__item--active::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--color-primary);
}

.view-tabs__item:hover:not(:disabled):not(.view-tabs__item--active) {
  color: #374151;
}
</style>
