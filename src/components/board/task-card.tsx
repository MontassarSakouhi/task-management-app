import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/lib/types.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Edit, Trash2 } from "lucide-react";
import { PriorityBadge } from "./priority-badge.tsx";
interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}
export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 ${snapshot.isDragging ? "shadow-lg" : ""}`}
        >
          <Card>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <p className="font-semibold">{task.title}</p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onEdit}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
              )}
              <div className="flex justify-between items-center mt-2">
                <PriorityBadge priority={task.priority} />
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}