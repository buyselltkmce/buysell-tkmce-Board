import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, SlidersHorizontal, ChevronDown,
  LayoutGrid, List, Bell, X, Check, Repeat, Trash2, Sun, Moon, Menu,
  BookOpen, Bug
} from "lucide-react";
import { useBoardStore } from "../../store/boardStore";
import { useThemeStore } from "../../store/themeStore";
import { TEAM_MEMBERS, ALL_LABELS, PRIORITY_CONFIG, CYCLES, COLUMNS } from "../../data/constants";

const SORT_OPTIONS = [
  { value: "updatedAt",    label: "Recently Updated" },
  { value: "dueDate",      label: "Due Date" },
  { value: "priority",     label: "Priority" },
  { value: "alphabetical", label: "Alphabetical" },
];

export default function Header() {
  const { filters, setFilters, resetFilters, viewMode, setViewMode, openCreateModal, clearAllTasks, toggleMobileSidebar } = useBoardStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort]       = useState(false);
  const [showCycles, setShowCycles]   = useState(false);
  const filterRef = useRef(null);
  const sortRef   = useRef(null);
  const cyclesRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false);
      if (sortRef.current   && !sortRef.current.contains(e.target))   setShowSort(false);
      if (cyclesRef.current && !cyclesRef.current.contains(e.target)) setShowCycles(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeFilterCount =
    filters.priorities.length +
    filters.assignees.length +
    filters.labels.length +
    (filters.types?.length || 0) +
    (filters.statuses?.length || 0);

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
  const toggleType = (t) => {
    setFilters({
      types: filters.types?.includes(t)
        ? filters.types.filter((x) => x !== t)
        : [...(filters.types || []), t],
    });
  };
  const toggleStatus = (sId) => {
    setFilters({
      statuses: filters.statuses?.includes(sId)
        ? filters.statuses.filter((x) => x !== sId)
        : [...(filters.statuses || []), sId],
    });
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3 z-20 sticky top-0">
      {/* Top Row (brand + hamburger + mobile actions) */}
      <div className="flex items-center justify-between w-full md:w-auto shrink-0">
        <div className="flex items-center gap-2">
          {/* Hamburger menu for mobile */}
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden shrink-0"
          >
            <Menu size={18} />
          </button>
          
          {/* Project info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white">BP</span>
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-tight">Buysell Project</h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 leading-tight font-medium">Software Dev</p>
            </div>
          </div>
        </div>

        {/* Mobile action buttons */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button className="relative p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => openCreateModal()}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Middle/Bottom Area (Search + Horizontal Scrollable Filters) */}
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 max-w-full sm:max-w-xs shrink-0">
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

        {/* Scrollable Filters row */}
        <div className="flex flex-wrap items-center gap-2 pb-1.5 sm:pb-0 w-full md:w-auto shrink-0">

      {/* 2-Week Cycle Selector */}
      <div className="relative" ref={cyclesRef}>
        <button
          onClick={() => { setShowCycles(!showCycles); setShowFilters(false); setShowSort(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            filters.cycleId && filters.cycleId !== "all"
              ? "bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
          title="Filter by 2-Week Scrum Cycle"
        >
          <Repeat size={13} className="text-purple-600 dark:text-purple-400" />
          <span>{CYCLES.find((c) => c.id === filters.cycleId)?.name ?? "All Cycles"}</span>
          <ChevronDown size={11} className={`transition-transform ${showCycles ? "rotate-180" : ""}`} />
        </button>

        {showCycles && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-30 py-2 animate-scale-in">
            <div className="px-3 pb-2 mb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">2-Week Scrum Cycles</span>
              <span className="text-[9px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold">14 Days</span>
            </div>
            {CYCLES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setFilters({ cycleId: c.id });
                  setShowCycles(false);
                }}
                className={`w-full flex items-start gap-2 px-3 py-2 text-left text-xs transition-colors ${
                  filters.cycleId === c.id
                    ? "bg-purple-50 dark:bg-purple-950/50 font-bold text-purple-700 dark:text-purple-300"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
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
          onClick={() => { setShowFilters(!showFilters); setShowSort(false); setShowCycles(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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
          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-30 p-4 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Filters</p>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Priority */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Priority</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => togglePriority(key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                      filters.priorities.includes(key)
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} dark:bg-slate-800 dark:border-slate-700 dark:text-white`
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    {filters.priorities.includes(key) && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Type */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Task Type</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => toggleType("story")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                    filters.types?.includes("story")
                      ? "bg-blue-50 border-blue-300 text-blue-700 font-bold dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                  }`}
                >
                  <BookOpen size={11} className="text-blue-500" />
                  Story
                  {filters.types?.includes("story") && <Check size={10} />}
                </button>
                <button
                  onClick={() => toggleType("bug")}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                    filters.types?.includes("bug")
                      ? "bg-rose-50 border-rose-300 text-rose-700 font-bold dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Bug size={11} className="text-rose-500" />
                  Bug
                  {filters.types?.includes("bug") && <Check size={10} />}
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {COLUMNS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleStatus(c.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                      filters.statuses?.includes(c.id)
                        ? "bg-blue-50 border-blue-300 text-blue-700 font-bold dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.title.replace(/^\d+\.\s*/, "")}</span>
                    {filters.statuses?.includes(c.id) && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Assignee</p>
              <div className="space-y-1">
                {TEAM_MEMBERS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleAssignee(m.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                      filters.assignees.includes(m.id)
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
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
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_LABELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => toggleLabel(l)}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-all ${
                      filters.labels.includes(l)
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
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
          onClick={() => { setShowSort(!showSort); setShowFilters(false); setShowCycles(false); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span>{SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label ?? "Sort"}</span>
          <ChevronDown size={13} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
        </button>
        {showSort && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-30 py-1 animate-scale-in">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setFilters({ sortBy: opt.value }); setShowSort(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  filters.sortBy === opt.value
                    ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-950/40 dark:text-blue-300"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
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

          {/* Clear All Data */}
          <button
            onClick={() => {
              if (window.confirm("Remove all dummy data and clear the board?")) {
                clearAllTasks();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold rounded-lg transition-all shrink-0"
            title="Clear all tasks"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear All Data</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
        <button className="relative p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition-colors">
          <Bell size={16} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition-colors"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus size={15} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}
