import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Users, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { COLUMNS, PRIORITY_CONFIG, TEAM_MEMBERS } from "../data/constants";
import { formatDueDate } from "../utils/helpers";

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.3 },
});

// Simple bar component
function Bar({ value, max, color }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-full rounded-lg flex items-center px-2"
          style={{ background: color, minWidth: value ? "32px" : "0" }}
        >
          {value > 0 && <span className="text-[10px] font-bold text-white">{value}</span>}
        </motion.div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { tasks } = useBoardStore();

  const total      = tasks.length;
  const done       = tasks.filter((t) => t.status === "done").length;
  const overdue    = tasks.filter((t) => {
    const { isOverdue } = formatDueDate(t.dueDate);
    return isOverdue && t.status !== "done";
  }).length;
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  // Tasks per member
  const memberStats = TEAM_MEMBERS.map((m) => {
    const memberTasks = tasks.filter((t) => t.assignee.id === m.id);
    return {
      ...m,
      total:    memberTasks.length,
      done:     memberTasks.filter((t) => t.status === "done").length,
      progress: memberTasks.filter((t) => t.status === "progress").length,
      hours:    memberTasks.reduce((s, t) => s + t.estimatedHours, 0),
    };
  }).sort((a, b) => b.total - a.total);

  const maxMemberTasks = Math.max(...memberStats.map((m) => m.total), 1);

  // Tasks per priority
  const priorityStats = Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => ({
    key, ...cfg,
    count: tasks.filter((t) => t.priority === key).length,
  }));
  const maxPriority = Math.max(...priorityStats.map((p) => p.count), 1);

  // Tasks per column
  const columnStats = COLUMNS.map((col) => ({
    ...col,
    count: tasks.filter((t) => t.status === col.id).length,
  }));

  return (
    <div className="p-8 overflow-y-auto max-w-5xl mx-auto">
      <motion.div {...fadeUp(0)} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Project analytics and team performance</p>
      </motion.div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks",      value: total,            icon: BarChart2,     color: "#2563EB", bg: "#EFF6FF" },
          { label: "Completed",         value: `${done} (${total ? Math.round((done/total)*100) : 0}%)`, icon: CheckCircle2, color: "#059669", bg: "#F0FDF4" },
          { label: "Total Est. Hours",  value: `${totalHours}h`, icon: Clock,         color: "#7C3AED", bg: "#FAF5FF" },
          { label: "Overdue Tasks",     value: overdue,          icon: AlertTriangle, color: "#DC2626", bg: "#FFF1F2" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} {...fadeUp(i + 1)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: kpi.bg }}>
              <kpi.icon size={22} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Workload by member */}
        <motion.div {...fadeUp(5)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Users size={15} className="text-slate-500" /> Workload by Team Member
          </h2>
          <div className="space-y-4">
            {memberStats.map((m) => (
              <div key={m.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: m.color }}>
                    {m.avatar}
                  </div>
                  <span className="text-xs font-medium text-slate-700 w-24 truncate">{m.name.split(" ")[0]}</span>
                  <Bar value={m.total} max={maxMemberTasks} color={m.color} />
                  <span className="text-xs text-slate-400 w-12 text-right">{m.hours}h</span>
                </div>
                <div className="flex gap-1 pl-8">
                  <span className="text-[10px] text-green-600 font-medium">{m.done} done</span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-amber-600 font-medium">{m.progress} in progress</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority distribution */}
        <motion.div {...fadeUp(6)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
            <TrendingUp size={15} className="text-slate-500" /> Priority Distribution
          </h2>
          <div className="space-y-4">
            {priorityStats.map((p) => (
              <div key={p.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
                    <span className={`text-xs font-semibold ${p.color}`}>{p.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">{p.count} tasks</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: maxPriority ? `${(p.count / maxPriority) * 100}%` : "0%" }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className={`h-full rounded-full ${p.dot}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Status funnel */}
      <motion.div {...fadeUp(7)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-800 mb-5">Status Pipeline</h2>
        <div className="flex items-end gap-4 h-40">
          {columnStats.map((col) => {
            const pct = total ? (col.count / total) * 100 : 0;
            return (
              <div key={col.id} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-slate-700">{col.count}</span>
                <div className="w-full rounded-t-xl overflow-hidden" style={{ height: "80px", background: "#F1F5F9" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(pct, 4)}%` }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="w-full rounded-t-xl mt-auto"
                    style={{ background: col.color, marginTop: "auto", height: `${Math.max(pct * 0.8, 4)}px`, maxHeight: "80px" }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 text-center font-medium">{col.emoji} {col.title}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
