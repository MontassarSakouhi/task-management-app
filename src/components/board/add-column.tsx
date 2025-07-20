import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useTasksDispatch } from "@/contexts/tasks-context.tsx";
export function AddColumn() {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const dispatch = useTasksDispatch();
  const handleAdd = () => {
    if (title.trim()) {
      const newId = `col-${Date.now()}`;
      dispatch({
        type: "ADD_COLUMN",
        payload: { id: newId, title: title.trim() },
      });
      setTitle("");
      setIsAdding(false);
    }
  };
  if (isAdding) {
    return (
      <div className="w-72 bg-muted/50 rounded-lg p-3 flex-shrink-0 h-fit">
        <Input
          placeholder="Enter column title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          autoFocus
          className="mb-2"
        />
        <div className="flex gap-2">
          <Button onClick={handleAdd}>Add Column</Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }
  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-72 p-3 text-muted-foreground rounded-lg border-2 border-dashed border-muted-foreground/50 hover:bg-muted/50 hover:border-muted-foreground transition-colors flex-shrink-0 flex items-center justify-center h-fit opacity-50 hover:opacity-100"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add another column
    </button>
  );
}