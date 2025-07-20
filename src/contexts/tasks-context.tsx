import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useReducer,
} from "react";
import type { AppState } from "@/lib/types";
import { type Action, tasksReducer } from "./tasks-reducer";
const initialState: AppState = {
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Setup project structure",
      description: "Create folders for components, context, etc.",
      priority: "High",
      statusId: "col-1",
    },
    "task-2": {
      id: "task-2",
      title: "Design UI components",
      description: "Design TaskCard, Board, and List views.",
      priority: "Medium",
      statusId: "col-1",
      dueDate: "2025-07-25",
    },
    "task-3": {
      id: "task-3",
      title: "Implement drag and drop",
      description: "Use react-beautiful-dnd for board view.",
      priority: "High",
      statusId: "col-2",
    },
    "task-4": {
      id: "task-4",
      title: "Develop list view",
      description: "Add sorting by priority and due date.",
      priority: "Medium",
      statusId: "col-2",
    },
    "task-5": {
      id: "task-5",
      title: "Final testing and deployment",
      description: "Test all CRUD operations and features.",
      priority: "Low",
      statusId: "col-3",
    },
  },
  columns: {
    "col-1": {
      id: "col-1",
      title: "To Do",
      taskIds: ["task-1", "task-2"],
      sortKey: "none",
      sortDirection: "asc",
      filterPriorities: null,
    },
    "col-2": {
      id: "col-2",
      title: "In Progress",
      taskIds: ["task-3", "task-4"],
      sortKey: "none",
      sortDirection: "asc",
      filterPriorities: null,
    },
    "col-3": {
      id: "col-3",
      title: "Done",
      taskIds: ["task-5"],
      sortKey: "none",
      sortDirection: "asc",
      filterPriorities: null,
    },
  },
  columnOrder: ["col-1", "col-2", "col-3"],
};
const TasksContext = createContext<AppState | null>(null);
const TasksDispatchContext = createContext<Dispatch<Action> | null>(null);
export function TasksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  return (
    <TasksContext.Provider value={state}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}
export function useTasks() {
  const context = useContext(TasksContext);
  if (context === null) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
export function useTasksDispatch() {
  const context = useContext(TasksDispatchContext);
  if (context === null) {
    throw new Error("useTasksDispatch must be used within a TasksProvider");
  }
  return context;
}
