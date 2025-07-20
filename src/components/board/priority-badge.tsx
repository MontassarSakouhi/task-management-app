import type { Priority } from "@/lib/types.ts";
const priorityOrder: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}
    >
      {priority}
    </span>
  );
};
export { priorityOrder };