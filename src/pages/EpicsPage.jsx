import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GitBranch, GitCommit, Layers, CheckCircle2, Clock, Plus,
  ChevronRight, ArrowRight, User, Calendar
} from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { MAIN_BRANCH, EPICS, COLUMNS, PRIORITY_CONFIG } from "../data/constants";
import { formatDueDate } from "../utils/helpers";

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.3 },
});

export default function EpicsPage() {
  const { tasks, setFilters } = useBoardStore();
  const navigate = useNavigate();

  const [selectedEpicId, setSelectedEpicId] = useState("BSL-EPIC-1");

  const selectedEpic = EPICS.find((e) => e.id === selectedEpicId) || EPICS[0];
  const epicTasks = tasks.filter((t) => (t.epicId || "BSL-EPIC-1") === selectedEpicId);
  const doneTasks = epicTasks.filter((t) => t.status === "deployed_live");
  const totalHours = epicTasks.reduce((s, t) => s + t.estimatedHours, 0);

  return (
    <div className="p-8 overflow-y-auto max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <GitBranch size={20} />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Branching & Epics</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-mono">
            Main Root Branch: <span className="font-bold text-purple-700">{MAIN_BRANCH.code}</span> · {EPICS.length} Epics & Feature Branches
          </p>
        </div>

        <button
          onClick={() => {
            setFilters({ search: selectedEpic.key });
            navigate("/");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          View Epic on Board <ArrowRight size={15} />
        </button>
      </motion.div>

      {/* ── Epic Cards Grid ── */}
      <motion.div {...fadeUp(1)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EPICS.map((epic) => {
          const eTasks = tasks.filter((t) => (t.epicId || "BSL-EPIC-1") === epic.id);
          const eDone = eTasks.filter((t) => t.status === "deployed_live").length;
          const isSelected = epic.id === selectedEpicId;

          return (
            <div
              key={epic.id}
              onClick={() => setSelectedEpicId(epic.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-purple-50/60 border-purple-400 shadow-md ring-2 ring-purple-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span className="font-bold px-2 py-0.5 rounded border" style={{ background: epic.badgeBg, color: epic.color, borderColor: `${epic.color}40` }}>
                  {MAIN_BRANCH.code} / {epic.key}
                </span>
                <span className="text-[10px] text-slate-400">{eTasks.length} stories</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">{epic.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{epic.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Progress</span>
                <span style={{ color: epic.color }}>{eDone}/{eTasks.length} Deployed</span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Branching Tree Visualizer ── */}
      <motion.div {...fadeUp(2)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 font-mono text-sm mb-1">
            <GitBranch size={18} className="text-purple-600" />
            <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">{MAIN_BRANCH.code}</span>
            <span className="text-slate-400">➔</span>
            <span className="font-bold text-slate-800" style={{ color: selectedEpic.color }}>{selectedEpic.key}: {selectedEpic.title}</span>
          </div>
          <p className="text-xs text-slate-500">{selectedEpic.description}</p>
        </div>

        {/* Tree List of Stories under this Epic */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            User Stories / Tickets in Branch ({epicTasks.length})
          </h3>

          {epicTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs italic">
              No tasks assigned to {selectedEpic.key} yet.
            </div>
          ) : (
            <div className="space-y-2">
              {epicTasks.map((task) => {
                const col = COLUMNS.find((c) => c.id === task.status);
                const pCfg = PRIORITY_CONFIG[task.priority];
                const due = formatDueDate(task.dueDate);
                const ticketKey = task.ticketKey || `BSL-${task.id.slice(-3)}`;

                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/task/${task.id}`)}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <GitCommit size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                        {ticketKey}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-purple-700 transition-colors truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="tag-chip font-bold" style={{ background: `${col?.color}18`, color: col?.color }}>
                        {col?.emoji} {col?.title}
                      </span>
                      <span className={`tag-chip ${pCfg.bg} ${pCfg.color} ${pCfg.border} border`}>
                        {pCfg.label}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={11} /> {task.estimatedHours}h
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
