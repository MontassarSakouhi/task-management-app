import { useState } from "react";
import type {
  Column as ColumnType,
  Priority,
  SortDirection,
  SortKey,
} from "@/lib/types.ts";
import { CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { ArrowDown, ArrowUp, MoreHorizontal, Trash2 } from "lucide-react";
interface ColumnHeaderProps {
  column: ColumnType;
  onRename: (columnId: string, newTitle: string) => void;
  onDelete: (columnId: string) => void;
  onSetSort: (
    columnId: string,
    sortKey: SortKey,
    sortDirection: SortDirection,
  ) => void;
  onSetFilter: (columnId: string, priorities: Priority[] | null) => void;
}
export function ColumnHeader({
  column,
  onRename,
  onDelete,
  onSetSort,
  onSetFilter,
}: ColumnHeaderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState(column.title);
  const isDefaultColumn = ["To Do", "In Progress", "Done"].includes(
    column.title,
  );
  const handleRename = () => {
    if (title.trim()) {
      onRename(column.id, title.trim());
      setIsRenaming(false);
    }
  };
  const handleSortChange = (key: SortKey) => {
    let direction: SortDirection = "desc";
    if (column.sortKey === key) {
      direction = column.sortDirection === "asc" ? "desc" : "asc";
    }
    onSetSort(column.id, key, direction);
  };
  const handleFilterChange = (priority: Priority) => {
    const currentFilters = column.filterPriorities || [];
    const newFilters = currentFilters.includes(priority)
      ? currentFilters.filter((p) => p !== priority)
      : [...currentFilters, priority];
    onSetFilter(column.id, newFilters.length > 0 ? newFilters : null);
  };
  return (
    <CardHeader className="p-3 cursor-grab">
      <div className="flex justify-between items-center">
        {isRenaming ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
            className="h-8"
          />
        ) : (
          <div className="flex items-center gap-2">
            <CardTitle
              className="text-base font-medium"
              onClick={() => !isDefaultColumn && setIsRenaming(true)}
            >
              {column.title}
            </CardTitle>
            {column.sortKey !== "none" &&
              (column.sortDirection === "asc" ? (
                <ArrowUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              ))}
          </div>
        )}
        <div className="flex items-center">
          {!isDefaultColumn && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-red-600"
              onClick={() => onDelete(column.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete column</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border shadow-lg">
              <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Sort by</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-white border shadow-lg">
                  <DropdownMenuItem
                    onClick={() => handleSortChange("priority")}
                  >
                    Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange("dueDate")}>
                    Due Date
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onSetSort(column.id, "none", "asc")}
                  >
                    Clear Sort
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Filter by Priority
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-white border shadow-lg">
                  {(["High", "Medium", "Low"] as Priority[]).map((p) => (
                    <DropdownMenuCheckboxItem
                      key={p}
                      checked={column.filterPriorities?.includes(p)}
                      onCheckedChange={() => handleFilterChange(p)}
                    >
                      {p}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onSetFilter(column.id, null)}
                  >
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  );
}