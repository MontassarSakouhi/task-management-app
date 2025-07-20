import type { AppState, Task, Column, SortKey, SortDirection, Priority } from "@/lib/types"
export type Action =
  | { type: "ADD_TASK"; payload: { task: Task; columnId: string } }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: { taskId: string; columnId: string } }
  | {
      type: "MOVE_TASK"
      payload: {
        source: { droppableId: string; index: number }
        destination: { droppableId: string; index: number }
        draggableId: string
      }
    }
  | {
      type: "MOVE_TASK_BETWEEN_COLUMNS"
      payload: {
        taskId: string
        sourceColumnId: string
        destinationColumnId: string
        updatedTask: Task
      }
    }
  | { type: "ADD_COLUMN"; payload: { id: string; title: string } }
  | { type: "RENAME_COLUMN"; payload: { columnId: string; newTitle: string } }
  | { type: "DELETE_COLUMN"; payload: { columnId: string } }
  | { type: "SET_COLUMN_SORT"; payload: { columnId: string; sortKey: SortKey; sortDirection: SortDirection } }
  | { type: "SET_COLUMN_FILTER"; payload: { columnId: string; priorities: Priority[] | null } }
  | { type: "MOVE_COLUMN"; payload: { sourceIndex: number; destinationIndex: number } }
export function tasksReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_TASK": {
      const { task, columnId } = action.payload
      const column = state.columns[columnId]
      const newTaskIds = [...column.taskIds, task.id]
      return {
        ...state,
        tasks: { ...state.tasks, [task.id]: task },
        columns: { ...state.columns, [columnId]: { ...column, taskIds: newTaskIds } },
      }
    }
    case "UPDATE_TASK": {
      const task = action.payload
      return {
        ...state,
        tasks: { ...state.tasks, [task.id]: task },
      }
    }
    case "MOVE_TASK_BETWEEN_COLUMNS": {
      const { taskId, sourceColumnId, destinationColumnId, updatedTask } = action.payload
      const sourceColumn = state.columns[sourceColumnId]
      const destinationColumn = state.columns[destinationColumnId]
      if (!sourceColumn || !destinationColumn) return state
      const newSourceTaskIds = sourceColumn.taskIds.filter((id) => id !== taskId)
      const newSourceColumn = { ...sourceColumn, taskIds: newSourceTaskIds }
      const newDestinationTaskIds = [...destinationColumn.taskIds, taskId]
      const newDestinationColumn = { ...destinationColumn, taskIds: newDestinationTaskIds }
      return {
        ...state,
        tasks: { ...state.tasks, [taskId]: updatedTask },
        columns: {
          ...state.columns,
          [sourceColumnId]: newSourceColumn,
          [destinationColumnId]: newDestinationColumn,
        },
      }
    }
    case "DELETE_TASK": {
      const { taskId, columnId } = action.payload
      const { [taskId]: _, ...remainingTasks } = state.tasks
      const column = state.columns[columnId]
      const newTaskIds = column.taskIds.filter((id) => id !== taskId)
      return {
        ...state,
        tasks: remainingTasks,
        columns: { ...state.columns, [columnId]: { ...column, taskIds: newTaskIds } },
      }
    }
    case "MOVE_TASK": {
      const { source, destination, draggableId } = action.payload
      if (!destination) return state
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return state
      }
      const startColumn = state.columns[source.droppableId]
      const finishColumn = state.columns[destination.droppableId]
      if (startColumn === finishColumn) {
        const newTaskIds = Array.from(startColumn.taskIds)
        newTaskIds.splice(source.index, 1)
        newTaskIds.splice(destination.index, 0, draggableId)
        const newColumn = { ...startColumn, taskIds: newTaskIds }
        return {
          ...state,
          columns: { ...state.columns, [newColumn.id]: newColumn },
        }
      }
      const startTaskIds = Array.from(startColumn.taskIds)
      startTaskIds.splice(source.index, 1)
      const newStartColumn = { ...startColumn, taskIds: startTaskIds }
      const finishTaskIds = Array.from(finishColumn.taskIds)
      finishTaskIds.splice(destination.index, 0, draggableId)
      const newFinishColumn = { ...finishColumn, taskIds: finishTaskIds }
      const updatedTask = { ...state.tasks[draggableId], statusId: destination.droppableId }
      return {
        ...state,
        tasks: { ...state.tasks, [draggableId]: updatedTask },
        columns: {
          ...state.columns,
          [newStartColumn.id]: newStartColumn,
          [newFinishColumn.id]: newFinishColumn,
        },
      }
    }
    case "ADD_COLUMN": {
      const { id, title } = action.payload
      const newColumn: Column = {
        id,
        title,
        taskIds: [],
        sortKey: "none",
        sortDirection: "asc",
        filterPriorities: null,
      }
      return {
        ...state,
        columns: { ...state.columns, [newColumn.id]: newColumn },
        columnOrder: [...state.columnOrder, newColumn.id],
      }
    }
    case "RENAME_COLUMN": {
      const { columnId, newTitle } = action.payload
      const column = state.columns[columnId]
      if (!column) return state
      const updatedColumn = { ...column, title: newTitle }
      return {
        ...state,
        columns: { ...state.columns, [columnId]: updatedColumn },
      }
    }
    case "DELETE_COLUMN": {
      const { columnId } = action.payload
      const columnToDelete = state.columns[columnId]
      if (!columnToDelete) return state
      const taskIdsToDelete = new Set(columnToDelete.taskIds)
      const newTasks = Object.entries(state.tasks)
        .filter(([taskId]) => !taskIdsToDelete.has(taskId))
        .reduce(
          (acc, [taskId, task]) => {
            acc[taskId] = task
            return acc
          },
          {} as Record<string, Task>,
        )
      const newColumns = { ...state.columns }
      delete newColumns[columnId]
      const newColumnOrder = state.columnOrder.filter((id) => id !== columnId)
      return {
        ...state,
        tasks: newTasks,
        columns: newColumns,
        columnOrder: newColumnOrder,
      }
    }
    case "SET_COLUMN_SORT": {
      const { columnId, sortKey, sortDirection } = action.payload
      const column = state.columns[columnId]
      if (!column) return state
      const updatedColumn = { ...column, sortKey, sortDirection }
      return {
        ...state,
        columns: { ...state.columns, [columnId]: updatedColumn },
      }
    }
    case "SET_COLUMN_FILTER": {
      const { columnId, priorities } = action.payload
      const column = state.columns[columnId]
      if (!column) return state
      const updatedColumn = { ...column, filterPriorities: priorities }
      return {
        ...state,
        columns: { ...state.columns, [columnId]: updatedColumn },
      }
    }
    case "MOVE_COLUMN": {
      const { sourceIndex, destinationIndex } = action.payload
      const newColumnOrder = Array.from(state.columnOrder)
      const [removed] = newColumnOrder.splice(sourceIndex, 1)
      newColumnOrder.splice(destinationIndex, 0, removed)
      return {
        ...state,
        columnOrder: newColumnOrder,
      }
    }
    default:
      return state
  }
}
