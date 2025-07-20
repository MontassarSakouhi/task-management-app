import { useState } from "react";
import { TasksProvider } from "./contexts/tasks-context";
import { LayoutGrid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { BoardView } from "@/components/board/board-view.tsx";
import { ListView } from "@/components/list-view.tsx";
type View = "board" | "list";
function App() {
  const [view, setView] = useState<View>("board");
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <TasksProvider>
      <div className="h-screen w-full flex flex-col bg-background text-foreground">
        <header className="p-4 border-b flex justify-between items-center gap-4">
          <h1 className="text-2xl font-bold hidden sm:block">
            Task Management
          </h1>
          <div className="relative flex-1 md:flex-grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks by title or description..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("board")}
              className={view === "board" ? "bg-accent" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {view === "board" ? (
            <BoardView searchQuery={searchQuery} />
          ) : (
            <ListView searchQuery={searchQuery} />
          )}
        </main>
      </div>
    </TasksProvider>
  );
}
export default App;
