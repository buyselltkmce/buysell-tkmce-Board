import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, Check, Plus, Trash2, ChevronRight, ChevronDown,
  Repeat, Target, AlignJustify, LayoutList, GitBranch, Layers, GitCommit, MessageSquare
} from "lucide-react";
import { useBoardStore } from "../../store/boardStore";
import { EPICS, CYCLES, COLUMNS, PRIORITY_CONFIG, LABEL_COLORS, TEAM_MEMBERS, MAIN_BRANCH } from "../../data/constants";
import { formatDueDate } from "../../utils/helpers";

export default function ListView() {
  const { tasks, getFilteredTasks, moveTask, updateTask, deleteTask, addTask } = useBoardStore();
  const navigate = useNavigate();

  const [collapsedSections, setCollapsedSections] = useState({});
  const [quickInputs, setQuickInputs]             = useState({});
  const [displayMode, setDisplayMode]             = useState("by-epic"); // 'by-epic' (default) | 'by-cycle' | 'by-status' | 'flat'

  const toggleSection = (id) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickAdd = (epicId, cycleId = "cycle-2", status = "ba_requirements") => {
    const text = quickInputs[epicId]?.trim();
    if (!text) return;

    addTask({
      title: text,
      description: "",
      status: status,
      priority: "medium",
      epicId: epicId,
      cycleId: cycleId,
      labels: ["Feature"],
      assignee: TEAM_MEMBERS[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      estimatedHours: 4,
      attachments: 0,
      comments: 0,
      checklist: [],
      commentList: [],
      activityLog: [],
      progress: 0,
    });

    setQuickInputs((prev) => ({ ...prev, [epicId]: "" }));
  };

  const allFilteredTasks = getFilteredTasks();

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 max-w-7xl mx-auto space-y-4">
      {/* ── Sub-header: Branching & Grouping Options ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
            <GitBranch size={16} />
          </span>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                Root: {MAIN_BRANCH.code}
              </span>
              <span className="text-slate-400">➔</span>
              <span className="font-semibold text-slate-700">
                {displayMode === "by-epic"
                  ? "Grouped by Epics"
                  : displayMode === "by-cycle"
                  ? "Grouped by 2-Wk Cycles"
                  : displayMode === "by-status"
                  ? "Grouped by SDLC Pipeline"
                  : "Flat List"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Line-by-line task tree with full BSL branch breakdown
            </p>
          </div>
        </div>

        {/* Grouping switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setDisplayMode("by-epic")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              displayMode === "by-epic"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <GitBranch size={13} className="text-purple-600" /> By Epics
          </button>
          <button
            onClick={() => setDisplayMode("by-cycle")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              displayMode === "by-cycle"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Repeat size={13} className="text-purple-600" /> By Cycles
          </button>
          <button
            onClick={() => setDisplayMode("by-status")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              displayMode === "by-status"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutList size={13} /> By SDLC Status
          </button>
        </div>
      </div>

      {/* ── 1. GROUPED BY EPICS (DEFAULT) ── */}
      {displayMode === "by-epic" && (
        <div className="space-y-4">
          {EPICS.map((epic) => {
            const epicTasks = allFilteredTasks.filter((t) => (t.epicId || "BSL-EPIC-1") === epic.id);
            const isCollapsed = collapsedSections[epic.id];
            const doneCount = epicTasks.filter((t) => t.status === "deployed_live").length;
            const totalHours = epicTasks.reduce((s, t) => s + t.estimatedHours, 0);

            return (
              <div
                key={epic.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Epic Section Header */}
                <div
                  onClick={() => toggleSection(epic.id)}
                  className="flex items-center justify-between px-5 py-3.5 bg-slate-50/90 hover:bg-slate-100/90 border-b border-slate-200 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChevronRight
                      size={16}
                      className={`text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                    />
                    <GitBranch size={16} style={{ color: epic.color }} className="shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border" style={{ background: epic.badgeBg, color: epic.color, borderColor: `${epic.color}40` }}>
                        {MAIN_BRANCH.code} / {epic.key}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{epic.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-slate-400 font-medium hidden md:inline truncate">
                      {epic.description}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="px-2 py-0.5 rounded-md font-mono" style={{ background: epic.badgeBg, color: epic.color }}>
                        {doneCount}/{epicTasks.length} Done
                      </span>
                      <span className="text-slate-400 font-normal">{totalHours}h</span>
                    </div>
                  </div>
                </div>

                {/* Epic Task Lines */}
                {!isCollapsed && (
                  <div>
                    {epicTasks.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs italic">
                        No tasks assigned to {epic.key}. Add one below!
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {epicTasks.map((task) => (
                          <TaskLineRow key={task.id} task={task} />
                        ))}
                      </div>
                    )}

                    {/* Quick Line Add to Epic */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/50 border-t border-slate-100">
                      <Plus size={14} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder={`+ Add task line under ${MAIN_BRANCH.code} / ${epic.key}... (Press Enter)`}
                        value={quickInputs[epic.id] || ""}
                        onChange={(e) =>
                          setQuickInputs({ ...quickInputs, [epic.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleQuickAdd(epic.id);
                        }}
                        className="flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 placeholder:italic font-mono"
                      />
                      {quickInputs[epic.id] && (
                        <button
                          onClick={() => handleQuickAdd(epic.id)}
                          className="px-2.5 py-1 text-white rounded-md text-xs font-semibold transition-colors"
                          style={{ background: epic.color }}
                        >
                          Add User Story Line
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 2. GROUPED BY 2-WEEK SCRUM CYCLES ── */}
      {displayMode === "by-cycle" && (
        <div className="space-y-4">
          {CYCLES.filter((c) => c.id !== "all").map((cycle) => {
            const cycleTasks = allFilteredTasks.filter((t) => (t.cycleId || "cycle-2") === cycle.id);
            const isCollapsed = collapsedSections[cycle.id];

            return (
              <div key={cycle.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                  onClick={() => toggleSection(cycle.id)}
                  className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
                    <Repeat size={15} className="text-purple-600" />
                    <span className="text-sm font-bold text-slate-900">{cycle.name}</span>
                    <span className="text-xs text-slate-400 font-normal">({cycle.range})</span>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {cycleTasks.length} tasks
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {cycleTasks.map((task) => (
                      <TaskLineRow key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── 3. GROUPED BY SDLC PIPELINE ── */}
      {displayMode === "by-status" && (
        <div className="space-y-4">
          {COLUMNS.map((col) => {
            const sectionTasks = getFilteredTasks(col.id);
            const isCollapsed = collapsedSections[col.id];

            return (
              <div key={col.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                  onClick={() => toggleSection(col.id)}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
                    <span className="text-base">{col.emoji}</span>
                    <span className="text-sm font-bold text-slate-800">{col.title}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${col.color}18`, color: col.color }}>
                      {sectionTasks.length}
                    </span>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="divide-y divide-slate-100">
                    {sectionTasks.map((task) => (
                      <TaskLineRow key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Single Line Task Row Component with Branching Tree ──
function TaskLineRow({ task }) {
  const { moveTask, updateTask, deleteTask } = useBoardStore();
  const navigate = useNavigate();

  const [showStatusMenu, setShowStatusMenu]     = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showEpicMenu, setShowEpicMenu]         = useState(false);

  const due = formatDueDate(task.dueDate);
  const pCfg = PRIORITY_CONFIG[task.priority];
  const col = COLUMNS.find((c) => c.id === task.status);
  const epic = EPICS.find((e) => e.id === (task.epicId || "BSL-EPIC-1")) || EPICS[0];
  const ticketKey = task.ticketKey || `BSL-${task.id.slice(-3)}`;
  const isDone = task.status === "deployed_live";

  const toggleDone = (e) => {
    e.stopPropagation();
    moveTask(task.id, isDone ? "ba_requirements" : "deployed_live");
  };

  return (
    <div
      onClick={() => navigate(`/task/${task.id}`)}
      className="group grid grid-cols-[2.5fr_1.4fr_1.2fr_1fr_1.2fr_1.1fr_70px_40px] gap-3 px-4 py-2.5 items-center hover:bg-purple-50/40 cursor-pointer transition-colors"
    >
      {/* 1. Checkbox + Ticket Key + Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={toggleDone}
          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
            isDone
              ? "bg-green-500 border-green-500 text-white"
              : "border-slate-300 hover:border-purple-500 bg-white"
          }`}
          title={isDone ? "Mark incomplete" : "Mark released"}
        >
          {isDone && <Check size={10} />}
        </button>

        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
          {ticketKey}
        </span>

        <span
          className={`text-xs font-semibold truncate transition-colors ${
            isDone ? "line-through text-slate-400" : "text-slate-800 group-hover:text-purple-700"
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* 2. Branching Tree (BSL -> Epic) Selector */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowEpicMenu(!showEpicMenu)}
          className="tag-chip font-mono font-bold flex items-center gap-1 truncate max-w-full border"
          style={{ background: epic.badgeBg, color: epic.color, borderColor: `${epic.color}40` }}
        >
          <GitBranch size={10} />
          <span className="truncate">{MAIN_BRANCH.code}/{epic.key}</span>
          <ChevronDown size={10} />
        </button>

        {showEpicMenu && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 animate-scale-in">
            <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-mono font-bold text-purple-700">
              Branch: {MAIN_BRANCH.code}
            </div>
            {EPICS.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  updateTask(task.id, { epicId: e.id });
                  setShowEpicMenu(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs ${
                  task.epicId === e.id ? "bg-purple-50 font-bold text-purple-700" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span className="font-mono">{e.key}</span>
                <span className="text-[10px] truncate max-w-[110px]" style={{ color: e.color }}>{e.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. SDLC Status Pipeline Dropdown */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="tag-chip font-semibold flex items-center gap-1 transition-transform active:scale-95"
          style={{ background: `${col?.color}18`, color: col?.color }}
        >
          <span>{col?.emoji}</span>
          <span className="truncate">{col?.title}</span>
          <ChevronDown size={10} />
        </button>

        {showStatusMenu && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 animate-scale-in">
            {COLUMNS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  moveTask(task.id, c.id);
                  setShowStatusMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs ${
                  task.status === c.id ? "bg-blue-50 font-bold text-blue-600" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>{c.emoji}</span>
                <span>{c.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Priority Dropdown */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowPriorityMenu(!showPriorityMenu)}
          className={`tag-chip ${pCfg.bg} ${pCfg.color} ${pCfg.border} border flex items-center gap-1`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
          <span>{pCfg.label}</span>
        </button>

        {showPriorityMenu && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 animate-scale-in">
            {Object.entries(PRIORITY_CONFIG).map(([k, cfg]) => (
              <button
                key={k}
                onClick={() => {
                  updateTask(task.id, { priority: k });
                  setShowPriorityMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs ${cfg.color} hover:bg-slate-50`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <span>{cfg.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Assignee */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
          style={{ background: task.assignee.color }}
        >
          {task.assignee.avatar}
        </div>
        <span className="text-xs text-slate-600 truncate">{task.assignee.name.split(" ")[0]}</span>
      </div>

      {/* 6. Due Date */}
      <div className={`flex items-center gap-1 text-xs ${due.color}`}>
        <Calendar size={11} />
        <span className="truncate">{due.label}</span>
      </div>

      {/* 7. Estimate Hours */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <Clock size={11} />
        <span>{task.estimatedHours}h</span>
      </div>

      {/* 8. Comment & Delete Actions */}
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => navigate(`/task/${task.id}`)}
          className="flex items-center gap-1 px-1.5 py-0.5 text-slate-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors text-[10px]"
          title="View & Add Comments"
        >
          <MessageSquare size={12} />
          <span className="font-semibold">{task.commentList?.length || task.comments || 0}</span>
        </button>

        <button
          onClick={() => {
            if (window.confirm("Delete this task line?")) deleteTask(task.id);
          }}
          className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
