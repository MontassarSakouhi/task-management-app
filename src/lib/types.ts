export type Priority = "Low" | "Medium" | "High"
export type SortKey = "dueDate" | "priority" | "none"
export type SortDirection = "asc" | "desc"
export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  priority: Priority
  statusId: string
}
export interface Column {
  id: string
  title: string
  taskIds: string[]
  sortKey: SortKey
  sortDirection: SortDirection
  filterPriorities: Priority[] | null
}
export interface AppState {
  tasks: Record<string, Task>
  columns: Record<string, Column>
  columnOrder: string[]
}
