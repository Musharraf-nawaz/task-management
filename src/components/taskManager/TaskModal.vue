<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type {
  ActivityItem,
  ActivityTab,
  TaskFormData,
  TaskFormErrors,
  TaskModalEmits,
  TaskModalProps,
  TaskPriority,
  TaskStatus,
  TagsInputState,
} from '../../BLL/taskManager/types'

const props = defineProps<TaskModalProps>()
const emit = defineEmits<TaskModalEmits>()

const form = reactive<TaskFormData>({
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  assignee: '',
  status: 'todo',
  tags: [],
})

const errors = reactive<TaskFormErrors>({
  title: '',
  dueDate: '',
})

const tagsInput = reactive<TagsInputState>({ value: '' })
const activeTab = ref<ActivityTab>('activity')
const isEditing = ref(false)

const priorities: TaskPriority[] = ['low', 'medium', 'high']
const statuses: TaskStatus[] = ['todo', 'in-progress', 'done']

const activityItems = computed(() => {
  if (!props.task) {
    return [] as ActivityItem[]
  }
  return [
    {
      id: 'a1',
      actor: props.task.assignee,
      action: `changed the status of ${props.task.title} from To do to ${props.manager.getColumnLabel(props.task.status)}`,
      timeLabel: '10:45 AM',
      dayGroup: 'Today',
      fileName: null,
      fileMeta: null,
    },
    {
      id: 'a2',
      actor: 'Elena Volkov',
      action: `added reaction 🚀 to ${props.task.title}`,
      timeLabel: '9:12 AM',
      dayGroup: 'Today',
      fileName: null,
      fileMeta: null,
    },
    {
      id: 'a3',
      actor: props.task.assignee,
      action: `uploaded a file to ${props.task.title}`,
      timeLabel: '4:20 PM',
      dayGroup: 'Yesterday',
      fileName: 'User Flow',
      fileMeta: 'PDF • 2.36 mb',
    },
    {
      id: 'a4',
      actor: 'Sarah Chen',
      action: `created ${props.task.title}`,
      timeLabel: '11:02 AM',
      dayGroup: 'Yesterday',
      fileName: null,
      fileMeta: null,
    },
  ]
})

const activityGroups = computed(() => {
  return [...new Set(activityItems.value.map((item) => item.dayGroup))]
})

function resetForm(): void {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.dueDate = props.manager.getTodayIso()
  form.assignee = ''
  form.status = 'todo'
  form.tags = []
  tagsInput.value = ''
  errors.title = ''
  errors.dueDate = ''
  isEditing.value = true
}

function populateFromTask(): void {
  if (!props.task) {
    resetForm()
    return
  }
  form.title = props.task.title
  form.description = props.task.description
  form.priority = props.task.priority
  form.dueDate = props.task.dueDate
  form.assignee = props.task.assignee
  form.status = props.task.status
  form.tags = [...props.task.tags]
  tagsInput.value = props.task.tags.join(', ')
  errors.title = ''
  errors.dueDate = ''
  isEditing.value = false
}

watch(
  () => [props.visible, props.task] as const,
  ([visible]) => {
    if (visible) {
      populateFromTask()
      activeTab.value = 'activity'
    }
  },
)

function cancelEdit(): void {
  populateFromTask()
}

function onSubmit(): void {
  const payload: TaskFormData = {
    title: form.title,
    description: form.description,
    priority: form.priority,
    dueDate: form.dueDate,
    assignee: form.assignee,
    status: form.status,
    tags: props.manager.parseTags(tagsInput.value),
  }

  const nextErrors = props.manager.validateTaskForm(
    payload,
    props.task ? props.task.dueDate : null,
  )
  errors.title = nextErrors.title
  errors.dueDate = nextErrors.dueDate

  if (errors.title || errors.dueDate) {
    return
  }

  if (props.task) {
    props.manager.updateTask(props.task.id, payload)
    isEditing.value = false
  } else {
    props.manager.createTask(payload)
    emit('close')
  }
}

function onClose(): void {
  emit('close')
}

function itemsForGroup(group: string): ActivityItem[] {
  return activityItems.value.filter((item) => item.dayGroup === group)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="drawer-root">
      <div class="drawer-backdrop" @click="onClose" />
      <aside class="drawer" role="dialog" aria-modal="true" :aria-label="task ? 'Task details' : 'Create task'">
        <header class="drawer__toolbar">
          <button type="button" class="icon-btn" aria-label="Close" @click="onClose">✕</button>
          <div class="drawer__toolbar-right">
            <button type="button" class="icon-btn" aria-label="History">⏱</button>
            <button type="button" class="icon-btn" aria-label="Favorite">☆</button>
            <button type="button" class="icon-btn" aria-label="More">⋮</button>
          </div>
        </header>

        <div class="drawer__body">
          <template v-if="!task || isEditing">
            <h2 class="drawer__title">{{ task ? 'Edit task' : 'Create task' }}</h2>
            <form class="form" @submit.prevent="onSubmit">
              <label class="field">
                <span class="field__label">Title</span>
                <input v-model="form.title" class="field__input" type="text" maxlength="120" />
                <span v-if="errors.title" class="field__error">{{ errors.title }}</span>
              </label>

              <label class="field">
                <span class="field__label">Description</span>
                <textarea v-model="form.description" class="field__textarea" rows="4" />
              </label>

              <div class="field-row">
                <label class="field">
                  <span class="field__label">Status</span>
                  <select v-model="form.status" class="field__input">
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ manager.getColumnLabel(status) }}
                    </option>
                  </select>
                </label>
                <label class="field">
                  <span class="field__label">Priority</span>
                  <select v-model="form.priority" class="field__input">
                    <option v-for="priority in priorities" :key="priority" :value="priority">
                      {{ priority }}
                    </option>
                  </select>
                </label>
              </div>

              <div class="field-row">
                <label class="field">
                  <span class="field__label">Due date</span>
                  <input v-model="form.dueDate" class="field__input" type="date" :min="task ? undefined : manager.getTodayIso()" />
                  <span v-if="errors.dueDate" class="field__error">{{ errors.dueDate }}</span>
                </label>
                <label class="field">
                  <span class="field__label">Assignee</span>
                  <input v-model="form.assignee" class="field__input" type="text" list="assignee-options" />
                  <datalist id="assignee-options">
                    <option v-for="name in manager.getUniqueAssignees()" :key="name" :value="name" />
                  </datalist>
                </label>
              </div>

              <label class="field">
                <span class="field__label">Tags</span>
                <input
                  v-model="tagsInput.value"
                  class="field__input"
                  type="text"
                  placeholder="backend, auth, ux"
                />
              </label>

              <div class="form__actions">
                <button v-if="task" type="button" class="btn btn--ghost" @click="cancelEdit">
                  Cancel
                </button>
                <button type="submit" class="btn btn--primary">
                  {{ task ? 'Save changes' : 'Create task' }}
                </button>
              </div>
            </form>
          </template>

          <template v-else>
            <div class="detail-head">
              <h2 class="drawer__title">{{ task.title }}</h2>
              <button type="button" class="btn btn--outline" @click="isEditing = true">Edit</button>
            </div>

            <dl class="props">
              <div class="props__row">
                <dt>Created time</dt>
                <dd>{{ manager.formatCreatedAt(task.createdAt) }}</dd>
              </div>
              <div class="props__row">
                <dt>Status</dt>
                <dd>
                  <span class="status-pill" :class="`status-pill--${task.status}`">
                    • {{ manager.getStatusBadgeLabel(task.status) }}
                  </span>
                </dd>
              </div>
              <div class="props__row">
                <dt>Priority</dt>
                <dd>
                  <span class="priority-badge" :class="`priority-badge--${task.priority}`">
                    {{ task.priority }}
                  </span>
                </dd>
              </div>
              <div class="props__row">
                <dt>Due Date</dt>
                <dd :class="{ overdue: manager.isOverdue(task) }">
                  {{ manager.formatDueDate(task.dueDate) }}
                </dd>
              </div>
              <div class="props__row">
                <dt>Tags</dt>
                <dd class="props__tags">
                  <span v-for="tag in task.tags" :key="tag" class="tag-chip">{{ tag }}</span>
                  <span v-if="task.tags.length === 0" class="muted">No tags</span>
                </dd>
              </div>
              <div class="props__row">
                <dt>Assignees</dt>
                <dd>
                  <span
                    class="avatar"
                    :style="{ backgroundColor: manager.getAssigneeColor(task.assignee) }"
                    :title="task.assignee"
                  >
                    {{ manager.getInitials(task.assignee) }}
                  </span>
                </dd>
              </div>
            </dl>

            <section class="description-box">
              <h3 class="description-box__title">Project Description</h3>
              <p class="description-box__text">{{ task.description }}</p>
            </section>

            <div class="tabs" role="tablist">
              <button
                type="button"
                class="tabs__item"
                :class="{ 'tabs__item--active': activeTab === 'activity' }"
                @click="activeTab = 'activity'"
              >
                Activity
              </button>
              <button
                type="button"
                class="tabs__item"
                :class="{ 'tabs__item--active': activeTab === 'my-work' }"
                @click="activeTab = 'my-work'"
              >
                My Work
              </button>
              <button
                type="button"
                class="tabs__item"
                :class="{ 'tabs__item--active': activeTab === 'assigned' }"
                @click="activeTab = 'assigned'"
              >
                Assigned
              </button>
              <button
                type="button"
                class="tabs__item"
                :class="{ 'tabs__item--active': activeTab === 'comments' }"
                @click="activeTab = 'comments'"
              >
                Comments
              </button>
            </div>

            <div v-if="activeTab === 'activity'" class="activity">
              <template v-for="group in activityGroups" :key="group">
                <h4 class="activity__day">{{ group }}</h4>
                <article
                  v-for="item in itemsForGroup(group)"
                  :key="item.id"
                  class="activity__item"
                >
                  <span
                    class="avatar"
                    :style="{ backgroundColor: manager.getAssigneeColor(item.actor) }"
                  >
                    {{ manager.getInitials(item.actor) }}
                  </span>
                  <div class="activity__copy">
                    <p class="activity__text">
                      <strong>{{ item.actor }}</strong> {{ item.action }}
                    </p>
                    <p class="activity__time">{{ item.timeLabel }}</p>
                    <div v-if="item.fileName" class="file-card">
                      <div class="file-card__icon">PDF</div>
                      <div class="file-card__meta">
                        <p class="file-card__name">{{ item.fileName }}</p>
                        <p class="file-card__size">{{ item.fileMeta }}</p>
                      </div>
                      <span class="file-card__dl" aria-hidden="true">⬇</span>
                    </div>
                  </div>
                </article>
              </template>
            </div>
            <div v-else class="activity activity--empty">
              No {{ activeTab.replace('-', ' ') }} items yet.
            </div>
          </template>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.28);
}

.drawer {
  position: relative;
  width: min(480px, 100%);
  height: 100%;
  background: #fff;
  box-shadow: var(--shadow-panel);
  border-radius: 16px 0 0 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.drawer__toolbar-right {
  display: flex;
  gap: 4px;
}

.drawer__body {
  padding: 20px 24px 32px;
  overflow: auto;
  flex: 1;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.drawer__title {
  margin: 0 0 20px;
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.detail-head .drawer__title {
  margin-bottom: 0;
}

.props {
  margin: 0 0 20px;
}

.props__row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
}

.props__row dt {
  margin: 0;
  font-size: 0.8125rem;
  color: #6b7280;
}

.props__row dd {
  margin: 0;
  font-size: 0.875rem;
  color: #111827;
}

.props__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.overdue {
  color: var(--color-overdue);
  font-weight: 600;
}

.muted {
  color: #9ca3af;
  font-size: 0.8125rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
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

.priority-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
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

.tag-chip {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 500;
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

.description-box {
  background: #f8f9fb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.description-box__title {
  margin: 0 0 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #111827;
}

.description-box__text {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #6b7280;
}

.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.tabs__item {
  border: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  position: relative;
}

.tabs__item--active {
  color: var(--color-primary);
  font-weight: 600;
}

.tabs__item--active::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: -1px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 999px;
}

.activity__day {
  margin: 0 0 12px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #111827;
}

.activity__item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.activity__text {
  margin: 0 0 4px;
  font-size: 0.8125rem;
  color: #374151;
  line-height: 1.45;
}

.activity__time {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
}

.activity--empty {
  padding: 24px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.file-card {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.file-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  display: grid;
  place-items: center;
  font-size: 0.625rem;
  font-weight: 700;
}

.file-card__name {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
}

.file-card__size {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
}

.file-card__meta {
  flex: 1;
}

.file-card__dl {
  color: #9ca3af;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.field__input,
.field__textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
  font-family: inherit;
}

.field__textarea {
  resize: vertical;
  min-height: 96px;
}

.field__error {
  font-size: 0.75rem;
  color: #d92d20;
}

.form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.icon-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--ghost {
  background: #f3f4f6;
  color: #374151;
}

.btn--outline {
  background: #fff;
  color: #374151;
  border: 1px solid #e5e7eb;
}
</style>
