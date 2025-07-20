import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { useTasks, useTasksDispatch } from "@/contexts/tasks-context.tsx";
import type { Priority, Task } from "@/lib/types.ts";
interface TaskFormInputs {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  statusId: string;
}
interface TaskFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task?: Task;
  defaultColumnId?: string;
}
export function TaskForm({
  isOpen,
  onOpenChange,
  task,
  defaultColumnId,
}: TaskFormProps) {
  const { columns } = useTasks();
  const dispatch = useTasksDispatch();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormInputs>();
  useEffect(() => {
    if (isOpen) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
          priority: task.priority,
          statusId: task.statusId,
        });
      } else {
        const firstColumnId = Object.keys(columns)[0];
        reset({
          title: "",
          description: "",
          dueDate: "",
          priority: "Medium",
          statusId: defaultColumnId || firstColumnId || "",
        });
      }
    }
  }, [isOpen, task, defaultColumnId, columns, reset]);
  const onSubmit: SubmitHandler<TaskFormInputs> = (data) => {
    if (task) {
      const updatedTask = {
        ...task,
        ...data,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
      };
      if (task.statusId !== data.statusId) {
        dispatch({
          type: "MOVE_TASK_BETWEEN_COLUMNS",
          payload: {
            taskId: task.id,
            sourceColumnId: task.statusId,
            destinationColumnId: data.statusId,
            updatedTask,
          },
        });
      } else {
        dispatch({
          type: "UPDATE_TASK",
          payload: updatedTask,
        });
      }
    } else {
      const newId = `task-${Date.now()}`;
      const newTask = {
        id: newId,
        ...data,
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
      };
      dispatch({
        type: "ADD_TASK",
        payload: {
          task: newTask,
          columnId: data.statusId,
        },
      });
    }
    onOpenChange(false);
  };
  const handleCancel = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Input
              {...register("title", { required: "Title is required" })}
              placeholder="Task Title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>
          <Textarea {...register("description")} placeholder="Description" />
          <Input type="date" {...register("dueDate")} />
          <Select
            onValueChange={(value: Priority) => setValue("priority", value)}
            defaultValue={task?.priority || "Medium"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value: string) => setValue("statusId", value)}
            defaultValue={
              task?.statusId || defaultColumnId || Object.keys(columns)[0]
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(columns).map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
