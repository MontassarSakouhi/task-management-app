import { useMemo, useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useTasks, useTasksDispatch } from "@/contexts/tasks-context.tsx";
import type { Priority, SortDirection, SortKey, Task } from "@/lib/types.ts";
import { TaskForm } from "../task-form.tsx";
import { Column } from "./column.tsx";
import { AddColumn } from "./add-column.tsx";
export function BoardView({ searchQuery }: { searchQuery: string }) {
  const state = useTasks();
  const dispatch = useTasksDispatch();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [defaultColumnId, setDefaultColumnId] = useState<string | undefined>(
    undefined,
  );
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (type === "COLUMN") {
      dispatch({
        type: "MOVE_COLUMN",
        payload: {
          sourceIndex: source.index,
          destinationIndex: destination.index,
        },
      });
      return;
    }
    dispatch({
      type: "MOVE_TASK",
      payload: { source, destination, draggableId },
    });
  };
  const handleAddTask = (columnId: string) => {
    setEditingTask(undefined);
    setDefaultColumnId(columnId);
    setIsFormOpen(true);
  };
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultColumnId(undefined);
    setIsFormOpen(true);
  };
  const handleDeleteTask = (taskId: string, columnId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch({ type: "DELETE_TASK", payload: { taskId, columnId } });
    }
  };
  const handleRenameColumn = (columnId: string, newTitle: string) => {
    dispatch({ type: "RENAME_COLUMN", payload: { columnId, newTitle } });
  };
  const handleDeleteColumn = (columnId: string) => {
    const column = state.columns[columnId];
    if (!column) return;
    if (column.taskIds.length > 0) {
      if (
        window.confirm(
          `Are you sure you want to delete the "${column.title}" column and its ${column.taskIds.length} tasks? This action cannot be undone.`,
        )
      ) {
        dispatch({ type: "DELETE_COLUMN", payload: { columnId } });
      }
    } else {
      dispatch({ type: "DELETE_COLUMN", payload: { columnId } });
    }
  };
  const handleSetSort = (
    columnId: string,
    sortKey: SortKey,
    sortDirection: SortDirection,
  ) => {
    dispatch({
      type: "SET_COLUMN_SORT",
      payload: { columnId, sortKey, sortDirection },
    });
  };
  const handleSetFilter = (columnId: string, priorities: Priority[] | null) => {
    dispatch({ type: "SET_COLUMN_FILTER", payload: { columnId, priorities } });
  };
  const filteredTasksByColumn = useMemo(() => {
    if (!searchQuery) {
      return state.columns;
    }
    const newColumns = { ...state.columns };
    const lowercasedQuery = searchQuery.toLowerCase();
    for (const columnId in newColumns) {
      const column = newColumns[columnId];
      const tasksInColumn = column.taskIds.map((taskId) => state.tasks[taskId]);
      const filteredTaskIds = tasksInColumn
        .filter(
          (task) =>
            task.title.toLowerCase().includes(lowercasedQuery) ||
            task.description?.toLowerCase().includes(lowercasedQuery),
        )
        .map((task) => task.id);
      newColumns[columnId] = { ...column, taskIds: filteredTaskIds };
    }
    return newColumns;
  }, [searchQuery, state.columns, state.tasks]);
  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="COLUMN"
        >
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-4 overflow-x-auto p-4 h-full items-start"
            >
              {state.columnOrder.map((columnId, index) => {
                const column = filteredTasksByColumn[columnId];
                if (!column) return null;
                const tasks = column.taskIds.map(
                  (taskId) => state.tasks[taskId],
                );
                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                    onAddTask={handleAddTask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onRename={handleRenameColumn}
                    onDelete={handleDeleteColumn}
                    onSetSort={handleSetSort}
                    onSetFilter={handleSetFilter}
                  />
                );
              })}
              {provided.placeholder}
              <AddColumn />
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <TaskForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
        defaultColumnId={defaultColumnId}
      />
    </>
  );
}
