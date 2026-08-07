import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  ArrowUpRight, BarChart2, Users, Zap,
} from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { COLUMNS, PRIORITY_CONFIG } from "../data/constants";
import { formatDueDate } from "../utils/helpers";

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.3 },
});

export default function DashboardPage() {
  const { tasks } = useBoardStore();
  const navigate  = useNavigate();

  const total      = tasks.length;
  const done       = tasks.filter((t) => t.status === "deployed_live").length;
  const inProgress = tasks.filter((t) => t.status === "in_development").length;
  const overdue    = tasks.filter((t) => {
    const { isOverdue } = formatDueDate(t.dueDate);
    return isOverdue && t.status !== "deployed_live";
  }).length;

  const completionRate = total ? Math.round((done / total) * 100) : 0;

  // Tasks per column
  const columnCounts = COLUMNS.map((col) => ({
    ...col,
    count: tasks.filter((t) => t.status === col.id).length,
  }));

  // Priority breakdown
  const priorityCounts = Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => ({
    key, ...cfg,
    count: tasks.filter((t) => t.priority === key).length,
  }));

  // Recent tasks
  const recent = [...tasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  // Upcoming due tasks
  const upcoming = [...tasks]
    .filter((t) => t.status !== "deployed_live")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-8 overflow-y-auto max-w-6xl mx-auto">
      {/* Page title */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Project overview and key metrics</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks",     value: total,           icon: BarChart2,    color: "#2563EB", bg: "#EFF6FF" },
          { label: "In Progress",     value: inProgress,      icon: Zap,          color: "#D97706", bg: "#FFFBEB" },
          { label: "Completed",       value: done,            icon: CheckCircle2, color: "#059669", bg: "#F0FDF4" },
          { label: "Overdue",         value: overdue,         icon: AlertTriangle,color: "#DC2626", bg: "#FFF1F2" },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} {...fadeUp(i + 1)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: kpi.bg }}>
              <kpi.icon size={22} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
        {/* Completion rate + column breakdown */}
        <motion.div {...fadeUp(5)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800">Tasks by Column</h2>
            <span className="text-xs text-slate-500">{total} total</span>
          </div>
          <div className="space-y-4">
            {columnCounts.map((col) => (
              <div key={col.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-700">{col.emoji} {col.title}</span>
                  <span className="text-xs font-bold" style={{ color: col.color }}>{col.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: total ? `${(col.count / total) * 100}%` : "0%" }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: col.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overall completion */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">Overall Completion</span>
              <span className="text-sm font-bold text-blue-600">{completionRate}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #2563EB, #7C3AED)" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Priority breakdown */}
        <motion.div {...fadeUp(6)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-6">Priority Breakdown</h2>
          <div className="space-y-3">
            {priorityCounts.map((p) => (
              <div key={p.key} className={`flex items-center justify-between px-4 py-3 rounded-xl ${p.bg} border ${p.border}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
                  <span className={`text-sm font-semibold ${p.color}`}>{p.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${p.color}`}>{p.count}</span>
                  <span className="text-xs text-slate-400">tasks</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent activity */}
        <motion.div {...fadeUp(7)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Recently Updated</h2>
            <button onClick={() => navigate("/")} className="text-xs text-blue-600 hover:underline font-medium">View board →</button>
          </div>
          <div className="space-y-3">
            {recent.map((task) => {
              const pCfg = PRIORITY_CONFIG[task.priority];
              return (
                <div key={task.id} onClick={() => navigate(`/task/${task.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background:
                        task.priority === "critical" ? "#EF4444" :
                        task.priority === "high"     ? "#F97316" :
                        task.priority === "medium"   ? "#EAB308" : "#60A5FA",
                    }}
                  />
                  <p className="text-sm text-slate-700 group-hover:text-blue-700 font-medium truncate flex-1 transition-colors">{task.title}</p>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ background: task.assignee.color }}>
                    {task.assignee.avatar}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upcoming due */}
        <motion.div {...fadeUp(8)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800">Upcoming Due Dates</h2>
          </div>
          <div className="space-y-3">
            {upcoming.map((task) => {
              const due  = formatDueDate(task.dueDate);
              const col  = COLUMNS.find((c) => c.id === task.status);
              return (
                <div key={task.id} onClick={() => navigate(`/task/${task.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 group-hover:text-blue-700 font-medium truncate transition-colors">{task.title}</p>
                    <span className="text-[10px]" style={{ color: col?.color }}>{col?.emoji} {col?.title}</span>
                  </div>
                  <span className={`text-xs font-semibold ${due.color} shrink-0`}>{due.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
