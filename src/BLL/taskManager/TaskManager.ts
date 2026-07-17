import { mockTasks } from './mockData'
import type {
  ITaskManager,
  PriorityWeightMap,
  SortDirection,
  SortField,
  StatusLabelMap,
  Task,
  TaskFilters,
  TaskFormData,
  TaskFormErrors,
  TaskPriority,
  TaskStatus,
  SortConfig,
} from './types'

const PRIORITY_WEIGHT: PriorityWeightMap = {
  low: 1,
  medium: 2,
  high: 3,
}

const COLUMN_LABELS: StatusLabelMap = {
  todo: 'To do',
  'in-progress': 'In Progress',
  done: 'Done',
}

const STATUS_BADGE_LABELS: StatusLabelMap = {
  todo: 'Not Started',
  'in-progress': 'In Research',
  done: 'Complete',
}

export class TaskManager implements ITaskManager {
  tasks: Task[]
  filters: TaskFilters
  sortConfig: SortConfig

  constructor() {
    this.tasks = mockTasks.map((task) => ({ ...task, tags: [...task.tags] }))
    this.filters = { priority: null, assignee: null }
    this.sortConfig = { field: 'dueDate', direction: 'asc' }
  }

  getFilteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchesPriority =
        this.filters.priority === null || task.priority === this.filters.priority
      const matchesAssignee =
        this.filters.assignee === null || task.assignee === this.filters.assignee
      return matchesPriority && matchesAssignee
    })
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getFilteredTasks().filter((task) => task.status === status)
  }

  getSortedTasks(): Task[] {
    const tasks = [...this.getFilteredTasks()]
    const { field, direction } = this.sortConfig
    const directionFactor = direction === 'asc' ? 1 : -1

    return tasks.sort((a, b) => {
      if (field === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate) * directionFactor
      }
      return (
        (this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority)) *
        directionFactor
      )
    })
  }

  getSortedTasksByStatus(status: TaskStatus): Task[] {
    return this.getSortedTasks().filter((task) => task.status === status)
  }

  getUniqueAssignees(): string[] {
    return [...new Set(this.tasks.map((task) => task.assignee))].sort((a, b) =>
      a.localeCompare(b),
    )
  }

  setPriorityFilter(priority: TaskPriority | null): void {
    this.filters.priority = priority
  }

  setAssigneeFilter(assignee: string | null): void {
    this.filters.assignee = assignee
  }

  setSort(field: SortField, direction: SortDirection): void {
    this.sortConfig = { field, direction }
  }

  toggleSort(field: SortField): void {
    if (this.sortConfig.field === field) {
      this.sortConfig = {
        field,
        direction: this.sortConfig.direction === 'asc' ? 'desc' : 'asc',
      }
      return
    }
    this.sortConfig = { field, direction: 'asc' }
  }

  getTodayIso(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  parseTags(raw: string): string[] {
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  validateTaskForm(data: TaskFormData, originalDueDate: string | null): TaskFormErrors {
    const errors: TaskFormErrors = { title: '', dueDate: '' }

    if (!data.title.trim()) {
      errors.title = 'Title is required.'
    }

    if (!data.dueDate) {
      errors.dueDate = 'Due date is required.'
    } else {
      const dueDateUnchanged = originalDueDate !== null && data.dueDate === originalDueDate
      if (!dueDateUnchanged && data.dueDate < this.getTodayIso()) {
        errors.dueDate = 'Due date cannot be in the past.'
      }
    }

    return errors
  }

  createTask(data: TaskFormData): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority,
      dueDate: data.dueDate,
      assignee: data.assignee.trim() || 'Unassigned',
      status: data.status,
      tags: data.tags.map((tag) => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    }
    this.tasks.push(task)
    return task
  }

  updateTask(id: string, data: TaskFormData): Task | null {
    const index = this.tasks.findIndex((task) => task.id === id)
    if (index === -1) {
      return null
    }

    const updated: Task = {
      ...this.tasks[index],
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority,
      dueDate: data.dueDate,
      assignee: data.assignee.trim() || 'Unassigned',
      status: data.status,
      tags: data.tags.map((tag) => tag.trim()).filter(Boolean),
    }

    this.tasks.splice(index, 1, updated)
    return updated
  }

  deleteTask(id: string): boolean {
    const index = this.tasks.findIndex((task) => task.id === id)
    if (index === -1) {
      return false
    }
    this.tasks.splice(index, 1)
    return true
  }

  moveTo(id: string, status: TaskStatus): boolean {
    const task = this.tasks.find((item) => item.id === id)
    if (!task) {
      return false
    }
    task.status = status
    return true
  }

  isOverdue(task: Task): boolean {
    if (task.status === 'done') {
      return false
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(`${task.dueDate}T00:00:00`)
    return due < today
  }

  getColumnLabel(status: TaskStatus): string {
    return COLUMN_LABELS[status]
  }

  getStatusBadgeLabel(status: TaskStatus): string {
    return STATUS_BADGE_LABELS[status]
  }

  getPriorityWeight(priority: TaskPriority): number {
    return PRIORITY_WEIGHT[priority]
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }

  getAssigneeColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i += 1) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 52%, 42%)`
  }

  formatDueDate(dueDate: string): string {
    const date = new Date(`${dueDate}T00:00:00`)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  formatCreatedAt(createdAt: string): string {
    const date = new Date(createdAt)
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }
}
