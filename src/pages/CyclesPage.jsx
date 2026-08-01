import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Repeat, Calendar, Clock, CheckCircle2, Zap, AlertCircle,
  Plus, ChevronRight, Check, Target, ArrowRight, ShieldAlert,
} from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { CYCLES, COLUMNS, PRIORITY_CONFIG } from "../data/constants";
import { formatDueDate } from "../utils/helpers";

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.3 },
});

export default function CyclesPage() {
  const { tasks, updateTask, setFilters } = useBoardStore();
  const navigate = useNavigate();

  const [selectedCycleId, setSelectedCycleId] = useState("cycle-2");

  // Active cycle object
  const activeCycle = CYCLES.find((c) => c.id === selectedCycleId) || CYCLES[2];

  // Tasks in selected cycle
  const cycleTasks = tasks.filter((t) => t.cycleId === selectedCycleId);
  const doneTasks  = cycleTasks.filter((t) => t.status === "deployed_live");
  const inProgTasks = cycleTasks.filter((t) => t.status === "in_development");
  const totalHours = cycleTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const doneHours  = doneTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  const completionPct = cycleTasks.length
    ? Math.round((doneTasks.length / cycleTasks.length) * 100)
    : 0;

  const hoursPct = totalHours ? Math.round((doneHours / totalHours) * 100) : 0;

  const viewOnBoard = (cycleId) => {
    setFilters({ cycleId });
    navigate("/");
  };

  return (
    <div className="p-8 overflow-y-auto max-w-7xl mx-auto space-y-8">
      {/* ── Page Title ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Repeat size={20} />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">2-Week Scrum Cycles</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage 14-day Scrum sprint iterations, velocity, and goals
          </p>
        </div>

        <button
          onClick={() => viewOnBoard(selectedCycleId)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
        >
          View Cycle on Board <ArrowRight size={15} />
        </button>
      </motion.div>

      {/* ── Scrum Cycle Selector Tabs ── */}
      <motion.div {...fadeUp(1)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {CYCLES.filter((c) => c.id !== "all").map((cycle) => {
          const cTasks = tasks.filter((t) => t.cycleId === cycle.id);
          const cDone = cTasks.filter((t) => t.status === "deployed_live").length;
          const isCurrent = cycle.id === selectedCycleId;

          return (
            <div
              key={cycle.id}
              onClick={() => setSelectedCycleId(cycle.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isCurrent
                  ? "bg-purple-50/60 border-purple-400 shadow-md ring-2 ring-purple-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    cycle.status === "active"
                      ? "bg-green-100 text-green-700"
                      : cycle.status === "completed"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {cycle.status === "active"
                    ? "Active Sprint"
                    : cycle.status === "completed"
                    ? "Completed"
                    : "Upcoming"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">14 Days</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{cycle.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{cycle.range}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Tasks</span>
                <span className="font-bold text-slate-800">
                  {cDone}/{cTasks.length} done
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* ── Active Cycle Summary Banner ── */}
      <motion.div
        {...fadeUp(2)}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{activeCycle.name} Detail</h2>
              <span className="text-xs text-slate-400 font-medium">({activeCycle.range})</span>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-1.5">
              <Target size={14} className="text-purple-600 shrink-0" />
              <span className="font-semibold text-slate-700">Sprint Goal:</span> {activeCycle.goal}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Sprint Duration</p>
              <p className="text-xs font-bold text-slate-800">2 Weeks (14 Days)</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Sprint Velocity</p>
              <p className="text-xs font-bold text-purple-700">{doneHours} / {totalHours} Hours</p>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Task Completion Rate</span>
              <span className="font-bold text-blue-600">{completionPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #2563EB, #7C3AED)" }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Hour Capacity Burned</span>
              <span className="font-bold text-purple-600">{hoursPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hoursPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-purple-600"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Cycle Task List ── */}
      <motion.div
        {...fadeUp(3)}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">
            Tasks in {activeCycle.name} ({cycleTasks.length})
          </h3>
          <span className="text-xs text-slate-400">
            Change sprint assignment anytime via dropdown
          </span>
        </div>

        {cycleTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Repeat size={32} className="mx-auto opacity-30" />
            <p className="text-sm font-medium">No tasks assigned to {activeCycle.name} yet.</p>
            <p className="text-xs text-slate-400">Reassign tasks below or from the main board.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cycleTasks.map((task) => {
              const pCfg = PRIORITY_CONFIG[task.priority];
              const col = COLUMNS.find((c) => c.id === task.status);
              const due = formatDueDate(task.dueDate);

              return (
                <div
                  key={task.id}
                  onClick={() => navigate(`/task/${task.id}`)}
                  className="p-4 hover:bg-purple-50/30 cursor-pointer transition-colors flex items-center gap-4 group"
                >
                  <span className="text-xs font-mono text-slate-400">#{task.id.slice(-4)}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="tag-chip" style={{ background: `${col?.color}18`, color: col?.color }}>
                        {col?.emoji} {col?.title}
                      </span>
                      <span>·</span>
                      <span className={`tag-chip ${pCfg.bg} ${pCfg.color} ${pCfg.border} border`}>
                        {pCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: task.assignee.color }}
                    >
                      {task.assignee.avatar}
                    </div>
                    <span className="text-xs text-slate-600 hidden sm:inline">{task.assignee.name}</span>
                  </div>

                  {/* Hours */}
                  <span className="text-xs font-medium text-slate-500 shrink-0">{task.estimatedHours}h</span>

                  {/* Re-assign cycle dropdown */}
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <select
                      value={task.cycleId || "cycle-2"}
                      onChange={(e) => updateTask(task.id, { cycleId: e.target.value })}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700"
                    >
                      {CYCLES.filter((c) => c.id !== "all").map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
