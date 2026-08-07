import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GitBranch, GitCommit, Layers, CheckCircle2, Clock, Plus,
  ChevronRight, ArrowRight, User, Calendar, Edit3, X, Check
} from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { MAIN_BRANCH, EPICS as DEFAULT_EPICS, COLUMNS, PRIORITY_CONFIG } from "../data/constants";
import { formatDueDate } from "../utils/helpers";

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.3 },
});

export default function EpicsPage() {
  const { tasks, setFilters, epics: storeEpics, updateEpic, resetEpics } = useBoardStore();
  const navigate = useNavigate();

  const epicsList = storeEpics || DEFAULT_EPICS;
  const [selectedEpicId, setSelectedEpicId] = useState("BSL-EPIC-1");

  // Edit Epic Modal state
  const [editingEpic, setEditingEpic]   = useState(null);
  const [editTitle, setEditTitle]       = useState("");
  const [editDesc, setEditDesc]         = useState("");
  const [editKey, setEditKey]           = useState("");

  const selectedEpic = epicsList.find((e) => e.id === selectedEpicId) || epicsList[0];
  const epicTasks = tasks.filter((t) => (t.epicId || "BSL-EPIC-1") === selectedEpicId);
  const doneTasks = epicTasks.filter((t) => t.status === "deployed_live");

  const openEditModal = (epic, e) => {
    if (e) e.stopPropagation();
    setEditingEpic(epic);
    setEditTitle(epic.title);
    setEditDesc(epic.description || "");
    setEditKey(epic.key || epic.id);
  };

  const handleSaveEpic = (e) => {
    e.preventDefault();
    if (!editingEpic || !editTitle.trim()) return;
    updateEpic(editingEpic.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      key: editKey.trim(),
    });
    setEditingEpic(null);
  };

  return (
    <div className="p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <GitBranch size={20} />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Branching & Epics</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-mono">
            Main Root Branch: <span className="font-bold text-purple-700">{MAIN_BRANCH.code}</span> · {epicsList.length} Epics & Feature Branches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { if (window.confirm("Reset all Epics to default titles from code?")) resetEpics(); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
            title="Reset Epics to default constants"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => {
              setFilters({ search: selectedEpic.key });
              navigate("/");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            View Epic on Board <ArrowRight size={15} />
          </button>
        </div>
      </motion.div>

      {/* ── Epic Cards Grid ── */}
      <motion.div {...fadeUp(1)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {epicsList.map((epic) => {
          const eTasks = tasks.filter((t) => (t.epicId || "BSL-EPIC-1") === epic.id);
          const eDone = eTasks.filter((t) => t.status === "deployed_live").length;
          const isSelected = epic.id === selectedEpicId;

          return (
            <div
              key={epic.id}
              onClick={() => setSelectedEpicId(epic.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all relative group ${
                isSelected
                  ? "bg-purple-50/60 dark:bg-purple-950/20 border-purple-400 shadow-md ring-2 ring-purple-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2 font-mono text-xs">
                <span className="font-bold px-2 py-0.5 rounded border" style={{ background: epic.badgeBg, color: epic.color, borderColor: `${epic.color}40` }}>
                  {MAIN_BRANCH.code} / {epic.key}
                </span>
                <button
                  onClick={(e) => openEditModal(epic, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                  title="Edit Epic Name & Details"
                >
                  <Edit3 size={13} />
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{epic.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{epic.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Progress</span>
                <span style={{ color: epic.color }}>{eDone}/{eTasks.length} Deployed</span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Branching Tree Visualizer ── */}
      <motion.div {...fadeUp(2)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 font-mono text-sm mb-1">
              <GitBranch size={18} className="text-purple-600" />
              <span className="font-bold text-purple-700 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">{MAIN_BRANCH.code}</span>
              <span className="text-slate-400">➔</span>
              <span className="font-bold text-slate-800 dark:text-white" style={{ color: selectedEpic.color }}>{selectedEpic.key}: {selectedEpic.title}</span>
            </div>
            <p className="text-xs text-slate-500">{selectedEpic.description}</p>
          </div>

          <button
            onClick={() => openEditModal(selectedEpic)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-700 dark:text-slate-200 hover:text-purple-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
          >
            <Edit3 size={13} /> Edit Epic Details
          </button>
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
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-purple-200 hover:bg-purple-50/30 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <GitCommit size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                        {ticketKey}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-purple-700 transition-colors truncate flex-1">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
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

      {/* ── Edit Epic Modal ── */}
      <AnimatePresence>
        {editingEpic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={() => setEditingEpic(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                    <Edit3 size={16} />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Epic Name & Specs</h3>
                </div>
                <button onClick={() => setEditingEpic(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEpic} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Epic Key / Code</label>
                  <input
                    type="text"
                    required
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 text-purple-700 dark:text-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Epic Title / Name</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Core Trading Matching Engine"
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Epic Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Brief scope and features of this epic..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700 dark:text-slate-300 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingEpic(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Check size={14} /> Save Epic Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
