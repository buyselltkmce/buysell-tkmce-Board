import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, Paperclip, MessageSquare, CheckSquare,
  AlertCircle, Flag, GripVertical, Zap, GitBranch, BookOpen, Bug,
} from "lucide-react";
import { PRIORITY_CONFIG, LABEL_COLORS, EPICS } from "../../data/constants";
import { formatDueDate } from "../../utils/helpers";
import { useBoardStore } from "../../store/boardStore";

export default function TaskCard({ task, isDragOverlay }) {
  const navigate = useNavigate();
  const { epics: storeEpics } = useBoardStore();
  const epicsList = storeEpics || EPICS;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const due = formatDueDate(task.dueDate);
  const pCfg = PRIORITY_CONFIG[task.priority];
  const checkedCount = task.checklist.filter((c) => c.completed).length;

  const epic = epicsList.find((e) => e.id === task.epicId) || epicsList[0];
  const ticketKey = task.ticketKey || (() => {
    const match = (task.id || "").match(/task-bsl-(\d+)/i);
    return match ? `BSL-${match[1]}` : `BSL-${task.id.slice(-3)}`;
  })();

  const card = (
    <div
      onClick={() => !isDragOverlay && navigate(`/task/${task.id}`)}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group ${
        isDragOverlay ? "drag-overlay" : ""
      }`}
    >
      {/* Branching Tree Badge */}
      <div className="px-3 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[10px] font-mono rounded-t-xl">
        <div className="flex items-center gap-1 text-slate-500 font-semibold truncate">
          <GitBranch size={10} className="text-purple-600 shrink-0" />
          <span className="text-purple-700 font-bold">BSL</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 truncate max-w-[110px]" title={epic.title}>{epic.key}</span>
        </div>
        <div className="flex items-center gap-1">
          {task.type === "bug" ? (
            <Bug size={10} className="text-rose-600 shrink-0" />
          ) : (
            <BookOpen size={10} className="text-blue-600 shrink-0" />
          )}
          <span className="font-bold text-slate-900 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            {ticketKey}
          </span>
        </div>
      </div>

      {/* Priority stripe */}
      <div
        className="h-0.5 rounded-t-xl"
        style={{
          background:
            task.priority === "critical" ? "#EF4444" :
            task.priority === "high"     ? "#F97316" :
            task.priority === "medium"   ? "#EAB308" : "#60A5FA",
        }}
      />

      <div className="p-3.5 space-y-3">
        {/* Top row: priority + drag handle */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`tag-chip ${pCfg.bg} ${pCfg.color} ${pCfg.border} border`}
            >
              {task.priority === "critical" && <AlertCircle size={9} className="mr-0.5" />}
              {task.priority === "high"     && <Zap size={9} className="mr-0.5" />}
              {task.priority === "medium"   && <Flag size={9} className="mr-0.5" />}
              {pCfg.label}
            </span>
            {task.labels.slice(0, 2).map((l) => (
              <span key={l} className={`tag-chip ${LABEL_COLORS[l] ?? "bg-slate-100 text-slate-600"}`}>
                {l}
              </span>
            ))}
            {task.labels.length > 2 && (
              <span className="tag-chip bg-slate-100 text-slate-500">+{task.labels.length - 2}</span>
            )}
          </div>
          <div
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 rounded text-slate-400 hover:text-slate-600 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {task.description.replace(/<[^>]*>/g, " ")}
          </p>
        )}

        {/* Progress bar */}
        {task.progress > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Progress</span>
              <span className="text-[10px] font-semibold text-blue-600">{task.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="progress-bar" style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        )}

        {/* Checklist mini */}
        {task.checklist.length > 0 && (
          <div className="flex items-center gap-1.5">
            <CheckSquare size={11} className={checkedCount === task.checklist.length ? "text-green-500" : "text-slate-400"} />
            <span className="text-[10px] text-slate-500">
              {checkedCount}/{task.checklist.length} done
            </span>
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(checkedCount / task.checklist.length) * 100}%`,
                  background: checkedCount === task.checklist.length ? "#10B981" : "#2563EB",
                }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="flex items-center gap-2.5">
            {/* Assignee */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold tooltip shrink-0"
              style={{ background: task.assignee.color }}
              data-tooltip={task.assignee.name}
            >
              {task.assignee.avatar}
            </div>

            {/* Due date */}
            <div className={`flex items-center gap-1 ${due.color}`}>
              <Calendar size={11} />
              <span className="text-[10px] font-medium">{due.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            {task.attachments > 0 && (
              <span className="flex items-center gap-0.5 text-[10px]">
                <Paperclip size={10} />{task.attachments}
              </span>
            )}
            {task.comments > 0 && (
              <span className="flex items-center gap-0.5 text-[10px]">
                <MessageSquare size={10} />{task.comments}
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[10px]">
              <Clock size={10} />{task.estimatedHours}h
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isDragOverlay) return card;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {card}
    </motion.div>
  );
}
