import { useMemo } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import type {
  Column as ColumnType,
  Priority,
  SortDirection,
  SortKey,
  Task,
} from "@/lib/types.ts";
import { ColumnHeader } from "./column-header.tsx";
import { TaskCard } from "./task-card.tsx";
import { AddTaskCard } from "./add-task-card.tsx";
import { priorityOrder } from "./priority-badge.tsx";
interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  index: number;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
  onRename: (columnId: string, newTitle: string) => void;
  onDelete: (columnId: string) => void;
  onSetSort: (
    columnId: string,
    sortKey: SortKey,
    sortDirection: SortDirection,
  ) => void;
  onSetFilter: (columnId: string, priorities: Priority[] | null) => void;
}
export function Column({
  column,
  tasks,
  index,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onRename,
  onDelete,
  onSetSort,
  onSetFilter,
}: ColumnProps) {
  const processedTasks = useMemo(() => {
    let filteredTasks = tasks;
    if (column.filterPriorities && column.filterPriorities.length > 0) {
      filteredTasks = tasks.filter((task) =>
        column.filterPriorities!.includes(task.priority),
      );
    }
    if (column.sortKey !== "none") {
      filteredTasks.sort((a, b) => {
        let comparison = 0;
        if (column.sortKey === "priority") {
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        } else if (column.sortKey === "dueDate") {
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          comparison = dateA - dateB;
        }
        return column.sortDirection === "asc" ? comparison : -comparison;
      });
    }
    return filteredTasks;
  }, [tasks, column.sortKey, column.sortDirection, column.filterPriorities]);
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-72 bg-gray-50 rounded-lg flex-shrink-0 flex flex-col max-h-full"
        >
          <div {...provided.dragHandleProps}>
            <ColumnHeader
              column={column}
              onRename={onRename}
              onDelete={onDelete}
              onSetSort={onSetSort}
              onSetFilter={onSetFilter}
            />
          </div>
          <Droppable droppableId={column.id} type="TASK">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-3 pt-0 min-h-[100px] transition-colors overflow-y-auto flex-1 ${
                  snapshot.isDraggingOver ? "bg-muted" : ""
                }`}
              >
                {processedTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id, column.id)}
                  />
                ))}
                {provided.placeholder}
                <AddTaskCard onClick={() => onAddTask(column.id)} />
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}