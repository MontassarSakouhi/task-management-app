import { Plus } from "lucide-react"
interface AddTaskCardProps {
  onClick: () => void
}
export function AddTaskCard({ onClick }: AddTaskCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full p-2 mt-2 text-sm text-muted-foreground rounded-lg border-2 border-dashed border-muted-foreground/50 hover:bg-muted/50 hover:border-muted-foreground transition-colors flex items-center justify-center opacity-60 hover:opacity-100"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add new task
    </button>
  )
} 