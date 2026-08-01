import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, SlidersHorizontal, ChevronDown,
  LayoutGrid, List, Bell, X, Check, Repeat, Trash2
} from "lucide-react";
import { useBoardStore } from "../../store/boardStore";
import { TEAM_MEMBERS, ALL_LABELS, PRIORITY_CONFIG, CYCLES } from "../../data/constants";

const SORT_OPTIONS = [
  { value: "updatedAt",    label: "Recently Updated" },
  { value: "dueDate",      label: "Due Date" },
  { value: "priority",     label: "Priority" },
  { value: "alphabetical", label: "Alphabetical" },
];

export default function Header() {
  const { filters, setFilters, resetFilters, viewMode, setViewMode, openCreateModal, clearAllTasks } = useBoardStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort]       = useState(false);
  const [showCycles, setShowCycles]   = useState(false);
  const filterRef = useRef(null);
  const sortRef   = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false);
      if (sortRef.current   && !sortRef.current.contains(e.target))   setShowSort(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeFilterCount =
    filters.priorities.length + filters.assignees.length + filters.labels.length;

  const togglePriority = (p) => {
    setFilters({
      priorities: filters.priorities.includes(p)
        ? filters.priorities.filter((x) => x !== p)
        : [...filters.priorities, p],
    });
  };
  const toggleAssignee = (id) => {
    setFilters({
      assignees: filters.assignees.includes(id)
        ? filters.assignees.filter((x) => x !== id)
        : [...filters.assignees, id],
    });
  };
  const toggleLabel = (l) => {
    setFilters({
      labels: filters.labels.includes(l)
        ? filters.labels.filter((x) => x !== l)
        : [...filters.labels, l],
    });
  };

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-3 z-20 sticky top-0">
      {/* Project info */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white">BP</span>
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">Buysell Project</h1>
          <p className="text-[10px] text-slate-400 leading-tight">Software Development</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks…"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
        {filters.search && (
          <button onClick={() => setFilters({ search: "" })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={12} />
          </button>
        )}
      </div>

      {/* 2-Week Cycle Selector */}
      <div className="relative">
        <button
          onClick={() => { setShowCycles(!showCycles); setShowFilters(false); setShowSort(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            filters.cycleId && filters.cycleId !== "all"
              ? "bg-purple-50 border-purple-300 text-purple-700"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="Filter by 2-Week Scrum Cycle"
        >
          <Repeat size={13} className="text-purple-600" />
          <span>{CYCLES.find((c) => c.id === filters.cycleId)?.name ?? "All Cycles"}</span>
          <ChevronDown size={11} className={`transition-transform ${showCycles ? "rotate-180" : ""}`} />
        </button>

        {showCycles && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-2 animate-scale-in">
            <div className="px-3 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2-Week Scrum Cycles</span>
              <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">14 Days</span>
            </div>
            {CYCLES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setFilters({ cycleId: c.id });
                  setShowCycles(false);
                }}
                className={`w-full flex items-start gap-2 px-3 py-2 text-left text-xs transition-colors ${
                  filters.cycleId === c.id ? "bg-purple-50 font-bold text-purple-700" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span>{c.name}</span>
                    {c.status === "active" && (
                      <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.2 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal">{c.range}</p>
                </div>
                {filters.cycleId === c.id && <Check size={12} className="text-purple-600 mt-0.5" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => { setShowFilters(!showFilters); setShowSort(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-4 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Filters</p>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Priority */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => togglePriority(key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                      filters.priorities.includes(key)
                        ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    {filters.priorities.includes(key) && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Assignee</p>
              <div className="space-y-1">
                {TEAM_MEMBERS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleAssignee(m.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                      filters.assignees.includes(m.id)
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ background: m.color }}
                    >
                      {m.avatar}
                    </div>
                    <span>{m.name}</span>
                    {filters.assignees.includes(m.id) && <Check size={10} className="ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_LABELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => toggleLabel(l)}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-all ${
                      filters.labels.includes(l)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sort */}
      <div className="relative" ref={sortRef}>
        <button
          onClick={() => { setShowSort(!showSort); setShowFilters(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          <span>{SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label ?? "Sort"}</span>
          <ChevronDown size={13} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
        </button>
        {showSort && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1 animate-scale-in">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilters({ sortBy: opt.value }); setShowSort(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  filters.sortBy === opt.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {filters.sortBy === opt.value && <Check size={12} />}
                <span className={filters.sortBy === opt.value ? "" : "pl-4"}>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View toggle */}
      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
        <button
          onClick={() => setViewMode("board")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            viewMode === "board" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          }`}
          title="Kanban Board view"
        >
          <LayoutGrid size={13} />
          <span>Board</span>
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          }`}
          title="Line-by-Line List view"
        >
          <List size={13} />
          <span>Line List</span>
        </button>
      </div>

      {/* Bell */}
      <button className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
        <Bell size={16} />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </button>

      {/* Clear All Data */}
      <button
        onClick={() => {
          if (window.confirm("Remove all dummy data and clear the board?")) {
            clearAllTasks();
          }
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg transition-all"
        title="Clear all tasks from local storage and cloud database"
      >
        <Trash2 size={13} />
        <span>Clear All Data</span>
      </button>

      {/* Add Task */}
      <button
        onClick={() => openCreateModal()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95"
      >
        <Plus size={15} />
        <span>New Task</span>
      </button>
    </header>
  );
}
