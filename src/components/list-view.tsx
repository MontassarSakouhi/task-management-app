import { useMemo, useState } from "react";
import { useTasks, useTasksDispatch } from "@/contexts/tasks-context";
import type { Task } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown, Edit, Plus, Trash2 } from "lucide-react";
import { TaskForm } from "./task-form.tsx";
type SortKey = "dueDate" | "priority";
type SortDirection = "asc" | "desc";
const priorityOrder: Record<Task["priority"], number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};
export function ListView({ searchQuery }: { searchQuery: string }) {
  const { tasks, columns, columnOrder } = useTasks();
  const dispatch = useTasksDispatch();
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const groupedAndSortedTasks = useMemo(() => {
    return columnOrder
      .map((columnId) => {
        const column = columns[columnId];
        if (!column) return null;
        let tasksInColumn = column.taskIds
          .map((taskId) => tasks[taskId])
          .filter(Boolean);
        if (searchQuery) {
          const lowercasedQuery = searchQuery.toLowerCase();
          tasksInColumn = tasksInColumn.filter(
            (task) =>
              task.title.toLowerCase().includes(lowercasedQuery) ||
              task.description?.toLowerCase().includes(lowercasedQuery),
          );
        }
        tasksInColumn.sort((a, b) => {
          let comparison = 0;
          if (sortKey === "priority") {
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          } else if (sortKey === "dueDate") {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            comparison = dateA - dateB;
          }
          return sortDirection === "asc" ? comparison : -comparison;
        });
        return { column, tasks: tasksInColumn };
      })
      .filter(
        (group): group is { column: (typeof columns)[string]; tasks: Task[] } =>
          group !== null,
      );
  }, [tasks, columns, columnOrder, sortKey, sortDirection, searchQuery]);
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };
  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };
  const handleDeleteTask = (taskId: string, columnId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch({ type: "DELETE_TASK", payload: { taskId, columnId } });
    }
  };
  const handleDeleteColumn = (columnId: string) => {
    const column = columns[columnId];
    if (!column) return;
    const isDefaultColumn = ["To Do", "In Progress", "Done"].includes(
      column.title,
    );
    if (isDefaultColumn) {
      alert("Cannot delete default columns.");
      return;
    }
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
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleCreateTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => handleSort("priority")}>
            Sort by Priority <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={() => handleSort("dueDate")}>
            Sort by Due Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      {groupedAndSortedTasks.map((group) => {
        if (group.tasks.length === 0 && !searchQuery) return null;
        if (group.tasks.length === 0 && searchQuery) return null;
        const isDefaultColumn = ["To Do", "In Progress", "Done"].includes(
          group.column.title,
        );
        return (
          <Card key={group.column.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{group.column.title}</CardTitle>
                {!isDefaultColumn && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteColumn(group.column.id)}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete column</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.title}
                      </TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDeleteTask(task.id, task.statusId)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
      <TaskForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        task={editingTask}
      />
    </div>
  );
}
