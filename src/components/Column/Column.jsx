import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { Plus, LayoutList } from "lucide-react";
import TaskCard from "../TaskCard/TaskCard";
import { useBoardStore } from "../../store/boardStore";

export default function Column({ column }) {
  const { getFilteredTasks, openCreateModal } = useBoardStore();
  const tasks = getFilteredTasks(column.id);

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="column-wrapper">
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border-t-2 bg-white border-l border-r border-t border-slate-200 sticky top-0 z-10"
        style={{ borderTopColor: column.color }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <h2 className="text-sm font-semibold text-slate-800">{column.title}</h2>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: `${column.color}18`, color: column.color }}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => openCreateModal(column.id)}
          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title={`Add task to ${column.title}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`column-tasks rounded-b-xl border border-t-0 border-slate-200 px-2 py-2 transition-all ${
          isOver ? "drop-active" : "bg-slate-50/60"
        }`}
        style={{ minHeight: "120px" }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 opacity-60"
              style={{ background: column.bgColor }}
            >
              <LayoutList size={18} style={{ color: column.color }} />
            </div>
            <p className="text-xs text-slate-400 font-medium">No tasks yet</p>
            <button
              onClick={() => openCreateModal(column.id)}
              className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              + Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
