import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Column from "../Column/Column";
import TaskCard from "../TaskCard/TaskCard";
import ListView from "../ListView/ListView";
import { COLUMNS } from "../../data/constants";
import { useBoardStore } from "../../store/boardStore";

export default function Board() {
  const { tasks, moveTask, viewMode } = useBoardStore();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped onto a column id
    const isColumn = COLUMNS.some((c) => c.id === over.id);
    if (isColumn) {
      if (activeTask.status !== over.id) {
        moveTask(active.id, over.id);
      }
      return;
    }

    // Dropped onto another task — find its column
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && overTask.status !== activeTask.status) {
      moveTask(active.id, overTask.status);
    }
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask   = tasks.find((t) => t.id === over.id);
    if (!activeTask || !overTask) return;
    if (activeTask.status !== overTask.status) {
      moveTask(active.id, overTask.status);
    }
  };

  if (viewMode === "list") {
    return <ListView />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="columns-scroll">
        {COLUMNS.map((col) => (
          <Column key={col.id} column={col} />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeTask && <TaskCard task={activeTask} isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
