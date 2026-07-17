export type TaskStatus = 'todo' | 'in-progress' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export type ViewMode = 'kanban' | 'list'

export type SortField = 'dueDate' | 'priority'

export type SortDirection = 'asc' | 'desc'

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  assignee: string
  status: TaskStatus
  tags: string[]
  createdAt: string
}

export interface TaskFormData {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  assignee: string
  status: TaskStatus
  tags: string[]
}

export interface TaskFormErrors {
  title: string
  dueDate: string
}

export interface TaskFilters {
  priority: TaskPriority | null
  assignee: string | null
}

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface ITaskManager {
  tasks: Task[]
  filters: TaskFilters
  sortConfig: SortConfig
  getFilteredTasks: () => Task[]
  getTasksByStatus: (status: TaskStatus) => Task[]
  getSortedTasks: () => Task[]
  getSortedTasksByStatus: (status: TaskStatus) => Task[]
  getUniqueAssignees: () => string[]
  setPriorityFilter: (priority: TaskPriority | null) => void
  setAssigneeFilter: (assignee: string | null) => void
  setSort: (field: SortField, direction: SortDirection) => void
  toggleSort: (field: SortField) => void
  createTask: (data: TaskFormData) => Task
  updateTask: (id: string, data: TaskFormData) => Task | null
  deleteTask: (id: string) => boolean
  moveTo: (id: string, status: TaskStatus) => boolean
  isOverdue: (task: Task) => boolean
  validateTaskForm: (data: TaskFormData, originalDueDate: string | null) => TaskFormErrors
  parseTags: (raw: string) => string[]
  getTodayIso: () => string
  getColumnLabel: (status: TaskStatus) => string
  getStatusBadgeLabel: (status: TaskStatus) => string
  getPriorityWeight: (priority: TaskPriority) => number
  getInitials: (name: string) => string
  getAssigneeColor: (name: string) => string
  formatDueDate: (dueDate: string) => string
  formatCreatedAt: (createdAt: string) => string
}

export interface KanbanBoardProps {
  manager: ITaskManager
}

export interface KanbanColumnProps {
  manager: ITaskManager
  status: TaskStatus
}

export interface TaskCardProps {
  task: Task
  manager: ITaskManager
}

export interface ListViewProps {
  manager: ITaskManager
}

export interface TaskModalProps {
  manager: ITaskManager
  task: Task | null
  visible: boolean
}

export interface ViewToggleProps {
  modelValue: ViewMode
}

export interface ViewToggleEmits {
  (e: 'update:modelValue', value: ViewMode): void
}

export interface TaskModalEmits {
  (e: 'close'): void
}

export interface TaskCardEmits {
  (e: 'edit', task: Task): void
}

export interface KanbanBoardEmits {
  (e: 'edit', task: Task): void
  (e: 'add'): void
}

export interface KanbanColumnEmits {
  (e: 'edit', task: Task): void
  (e: 'add'): void
}

export interface ListViewEmits {
  (e: 'edit', task: Task): void
}

export interface TagsInputState {
  value: string
}

export type ActivityTab = 'activity' | 'my-work' | 'assigned' | 'comments'

export interface ActivityItem {
  id: string
  actor: string
  action: string
  timeLabel: string
  dayGroup: string
  fileName: string | null
  fileMeta: string | null
}


export type EmptyColumnMessages = {
  todo: string
  'in-progress': string
  done: string
}

export type PriorityWeightMap = {
  low: number
  medium: number
  high: number
}

export type StatusLabelMap = {
  todo: string
  'in-progress': string
  done: string
}

export type StatusCollapsedMap = {
  todo: boolean
  'in-progress': boolean
  done: boolean
}

export type StatusClassMap = {
  todo: string
  'in-progress': string
  done: string
}

export function isTaskPriority(value: string): value is TaskPriority {
  return value === 'low' || value === 'medium' || value === 'high'
}

export function isViewMode(value: string): value is ViewMode {
  return value === 'kanban' || value === 'list'
}
