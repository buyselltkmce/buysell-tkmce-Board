import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Trash2, Check, Plus, Calendar, Clock,
  Paperclip, MessageSquare, Flag, Tag, User, ChevronDown,
  CheckSquare, Activity, Send, Circle, Edit3, UploadCloud,
  FileText, Image as ImageIcon, Download, Repeat, FileCode, GitBranch,
  Globe, Sparkles, UserCheck, Layers, Award, ShieldAlert, Zap, Copy
} from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import {
  COLUMNS, PRIORITY_CONFIG, LABEL_COLORS, ALL_LABELS,
  TEAM_MEMBERS, CYCLES, EPICS, MAIN_BRANCH, LOB_OPTIONS, PI_OPTIONS, FIX_VERSIONS
} from "../data/constants";
import { formatDate, formatDueDate, generateId } from "../utils/helpers";
import TimeLogModal from "../components/TaskModal/TimeLogModal";
import LinkedWorkItems from "../components/TaskModal/LinkedWorkItems";
import IntegrationsModal from "../components/TaskModal/IntegrationsModal";
import HistorySection from "../components/TaskModal/HistorySection";

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate   = useNavigate();
  const { tasks, isLoadingTasks, updateTask, deleteTask, duplicateTask, epics: storeEpics, deleteComment, editComment, deleteWorklog, editWorklog } = useBoardStore();
  const epicsList = storeEpics || EPICS;

  const task = tasks.find((t) => {
    if (!t) return false;
    const tid = (t.id || "").toLowerCase();
    const tkey = (t.ticketKey || "").toLowerCase();
    const paramId = (taskId || "").toLowerCase();
    return (
      tid === paramId ||
      tkey === paramId ||
      tid === `task-${paramId}` ||
      `task-${tkey}` === paramId
    );
  });

  const [editingTitle, setEditingTitle]   = useState(false);
  const [title, setTitle]                 = useState("");
  const [editingDesc, setEditingDesc]     = useState(false);
  const [desc, setDesc]                   = useState("");
  const [newComment, setNewComment]       = useState("");
  const [newItem, setNewItem]             = useState("");

  const [showTimeLogModal, setShowTimeLogModal]         = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showAgentMenu, setShowAgentMenu]               = useState(false);
  const [includeSubtasks, setIncludeSubtasks]           = useState(true);
  const [editingCommentId, setEditingCommentId]         = useState(null);
  const [editingCommentText, setEditingCommentText]     = useState("");
  const [editingWorklogId, setEditingWorklogId]         = useState(null);
  const [editingWorklogHours, setEditingWorklogHours]   = useState("");
  const [editingWorklogNote, setEditingWorklogNote]     = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description);
    }
  }, [task?.id]);

  if (isLoadingTasks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading task details...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-400">
        <p className="text-5xl">🔍</p>
        <p className="text-lg font-semibold text-slate-600">Task not found</p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={15} /> Back to Board
        </button>
      </div>
    );
  }

  const attachments = Array.isArray(task.attachmentsList) ? task.attachmentsList : [];
  const checklist = Array.isArray(task.checklist) ? task.checklist : [];
  const commentList = Array.isArray(task.commentList) ? task.commentList : [];
  const assignee = task.assignee || TEAM_MEMBERS[0];
  const reporter = task.reporter || TEAM_MEMBERS[0];

  const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const col  = COLUMNS.find((c) => c.id === task.status) || COLUMNS[0];
  const cycleObj = CYCLES.find((c) => c.id === (task.cycleId || "cycle-4")) || CYCLES.find((c) => c.status === "active") || CYCLES[4];
  const due  = formatDueDate(task.dueDate);

  const checkedCount = checklist.filter((c) => c.completed).length;
  const progressValue = checklist.length
    ? Math.round((checkedCount / checklist.length) * 100)
    : (task.progress || 0);

  // Tempo metrics
  const tempo = task.tempo || {
    estimatedHours: task.estimatedHours || 16,
    loggedHours: 10,
    remainingHours: 6,
    worklogs: [],
  };

  const estimatedHs = tempo.estimatedHours || 1;
  const loggedHs = tempo.loggedHours || 0;
  const remainingHs = tempo.remainingHours || 0;
  const loggedPercent = Math.min(100, Math.round((loggedHs / estimatedHs) * 100));

  // ── Handlers ───────────────────────────────────────────
  const saveTitle = () => {
    if (title.trim()) updateTask(task.id, { title: title.trim() });
    setEditingTitle(false);
  };

  const saveDesc = () => {
    updateTask(task.id, { description: desc });
    setEditingDesc(false);
  };

  const toggleChecklist = (itemId) => {
    const list = Array.isArray(task.checklist) ? task.checklist : [];
    updateTask(task.id, {
      checklist: list.map((c) => c.id === itemId ? { ...c, completed: !c.completed } : c),
    });
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    const list = Array.isArray(task.checklist) ? task.checklist : [];
    updateTask(task.id, {
      checklist: [...list, { id: generateId(), title: newItem.trim(), completed: false }],
    });
    setNewItem("");
  };

  const removeChecklistItem = (itemId) => {
    const list = Array.isArray(task.checklist) ? task.checklist : [];
    updateTask(task.id, {
      checklist: list.filter((c) => c.id !== itemId),
    });
  };

  const addComment = (customText) => {
    const textToPost = customText || newComment;
    if (!textToPost.trim()) return;
    const me = { id: "you", name: "You", avatar: "YO", color: "#2563EB" };
    const list = Array.isArray(task.commentList) ? task.commentList : [];
    updateTask(task.id, {
      commentList: [...list, {
        id: generateId(), author: me, content: textToPost.trim(), createdAt: new Date().toISOString(),
      }],
      comments: (task.comments || 0) + 1,
    });
    setNewComment("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newAtt = {
      id: generateId(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      type: file.type.includes("image") ? "image" : file.type.includes("pdf") ? "pdf" : "file",
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    };

    const updatedList = [newAtt, ...attachments];
    updateTask(task.id, { attachmentsList: updatedList, attachments: updatedList.length });
  };

  const handleDeleteAttachment = (attId) => {
    const updatedList = attachments.filter((a) => a.id !== attId);
    updateTask(task.id, { attachmentsList: updatedList, attachments: updatedList.length });
  };

  const handleDelete = () => {
    if (window.confirm("Delete this task? This cannot be undone.")) {
      deleteTask(task.id);
      navigate("/");
    }
  };

  const handleDuplicate = () => {
    const newId = duplicateTask(task.id);
    if (newId) {
      navigate(`/task/${newId}`);
    }
  };

  const epic = epicsList.find((e) => e.id === (task.epicId || "BSL-EPIC-1")) || epicsList[0];
  const ticketKey = task.ticketKey || (() => {
    const match = (task.id || "").match(/task-bsl-(\d+)/i);
    return match ? `BSL-${match[1]}` : `BSL-${task.id.slice(-3)}`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-slate-50 pb-16"
    >
      {/* ── Top Bar with Branching Breadcrumb & Jira Actions ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-purple-600 text-sm font-medium transition-colors group shrink-0"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Board
          </button>
          <span className="text-slate-300">/</span>

          {/* Branching Tree Breadcrumb */}
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
            <GitBranch size={13} className="text-purple-600" />
            <span className="text-purple-700 font-bold">{MAIN_BRANCH.code}</span>
            <span className="text-slate-400">➔</span>
            <span style={{ color: epic.color }}>{epic.key}</span>
            <span className="text-slate-400">➔</span>
            <span className="text-slate-900 font-bold">{ticketKey}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-500 text-sm truncate max-w-xs hidden sm:inline">{task.title}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* All Integrations */}
          <button
            onClick={() => setShowIntegrationsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-2xs"
          >
            <Globe size={13} /> All integrations
          </button>

          {/* Start work dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAgentMenu(!showAgentMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <Sparkles size={13} /> Start work <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {showAgentMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs"
                >
                  <button
                    onClick={() => {
                      addComment("[AI Agent] Automated order matching engine test suite generated.");
                      setShowAgentMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-medium flex items-center gap-2"
                  >
                    <Zap size={13} className="text-emerald-600" /> Ask BuySell AI Agent
                  </button>
                  <button
                    onClick={() => {
                      addComment("[AI Agent] Enhanced story description with order cancellation edge cases.");
                      setShowAgentMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-800 font-medium flex items-center gap-2"
                  >
                    <Sparkles size={13} className="text-purple-600" /> + Improve Story
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors font-medium mr-2"
          >
            <Copy size={13} /> Duplicate Task
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors font-medium"
          >
            <Trash2 size={13} /> Delete Task
          </button>
        </div>
      </div>

      {/* ── Main Single Page Grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* ── LEFT PAGE CONTENT ── */}
        <div className="space-y-8 min-w-0">

          {/* Priority indicator stripe */}
          <div
            className="h-1.5 rounded-full w-24"
            style={{
              background:
                task.priority === "critical" ? "linear-gradient(90deg,#EF4444,#F97316)" :
                task.priority === "high"     ? "linear-gradient(90deg,#F97316,#EAB308)" :
                task.priority === "medium"   ? "linear-gradient(90deg,#EAB308,#84CC16)" :
                                               "linear-gradient(90deg,#60A5FA,#818CF8)",
            }}
          />

          {/* Task Header Title & Badges */}
          <div>
            {editingTitle ? (
              <div className="flex gap-2 items-start">
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") { setTitle(task.title); setEditingTitle(false); }
                  }}
                  className="text-2xl font-bold text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent flex-1 pb-1"
                />
              </div>
            ) : (
              <h1
                className="text-2xl font-bold text-slate-900 leading-snug cursor-pointer group flex items-start gap-2"
                onClick={() => setEditingTitle(true)}
              >
                {task.title}
                <Edit3 size={16} className="text-slate-300 group-hover:text-blue-500 mt-1.5 shrink-0 transition-colors" />
              </h1>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`tag-chip ${pCfg.bg} ${pCfg.color} ${pCfg.border} border`}>{pCfg.label}</span>
              <span className="tag-chip font-bold" style={{ background: `${col?.color}18`, color: col?.color }}>
                {col?.emoji} {col?.title}
              </span>
              <span className="tag-chip bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                <Repeat size={10} className="inline mr-1" />
                {cycleObj?.name || "Cycle 2"}
              </span>
              <span className="tag-chip bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                LOB: {task.lob || "Spot Trading"}
              </span>
              <span className="text-xs text-slate-400">Created {formatDate(task.createdAt)}</span>
              <span className="text-xs text-slate-400">· Updated {formatDate(task.updatedAt)}</span>
            </div>
          </div>

          {/* SECTION 1: DESCRIPTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText size={16} className="text-blue-600" />
              Description & Specification
            </h2>

            {editingDesc ? (
              <div className="space-y-3 pt-1">
                <textarea
                  autoFocus
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={5}
                  className="w-full text-sm text-slate-700 border border-blue-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveDesc} className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 text-white text-xs rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                    <Check size={12} /> Save Description
                  </button>
                  <button onClick={() => { setDesc(task.description); setEditingDesc(false); }} className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                className="text-sm text-slate-600 leading-relaxed min-h-[60px] cursor-pointer hover:bg-slate-50 rounded-xl p-3 -m-3 transition-colors border border-transparent hover:border-slate-200 group"
              >
                {task.description ? (
                  <p className="whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <span className="text-slate-400 italic flex items-center gap-1.5">
                    <Edit3 size={13} /> Click to add a detailed description and acceptance criteria…
                  </span>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: LINKED WORK ITEMS */}
          <LinkedWorkItems currentTask={task} />

          {/* SECTION 3: CHECKLIST */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare size={16} className="text-green-600" />
                Checklist ({checkedCount}/{checklist.length})
              </h2>
              {checklist.length > 0 && (
                <span className="text-xs font-bold text-blue-600">
                  {Math.round((checkedCount / checklist.length) * 100)}% Done
                </span>
              )}
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <div
                    onClick={() => toggleChecklist(item.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      item.completed ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-blue-400"
                    }`}
                  >
                    {item.completed && <Check size={11} className="text-white" />}
                  </div>
                  <span
                    onClick={() => toggleChecklist(item.id)}
                    className={`text-sm transition-all flex-1 cursor-pointer ${item.completed ? "line-through text-slate-400" : "text-slate-700"}`}
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeChecklistItem(item.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add checklist item…"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addChecklistItem(); }}
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button onClick={addChecklistItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors">
                Add Item
              </button>
            </div>
          </div>

          {/* SECTION 4: TEMPO LOGGED WORKLOGS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                Tempo Worklogs ({tempo.worklogs?.length || 0})
              </h2>
              <button
                onClick={() => setShowTimeLogModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                + Log Time
              </button>
            </div>

            {tempo.worklogs?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No worklogs logged yet. Click "+ Log Time" to track work.</p>
            ) : (
              <div className="space-y-2.5">
                {tempo.worklogs.map((wl) => (
                  <div key={wl.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 group">
                    {editingWorklogId === wl.id ? (
                      <div className="space-y-2">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Hours</label>
                            <input
                              type="number" min="0.25" step="0.25"
                              value={editingWorklogHours}
                              onChange={(e) => setEditingWorklogHours(e.target.value)}
                              className="w-full text-xs border border-blue-300 rounded-xl px-3 py-2 outline-none mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Note</label>
                            <input
                              type="text"
                              value={editingWorklogNote}
                              onChange={(e) => setEditingWorklogNote(e.target.value)}
                              className="w-full text-xs border border-blue-300 rounded-xl px-3 py-2 outline-none mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { editWorklog(task.id, wl.id, { hours: parseFloat(editingWorklogHours) || wl.hours, note: editingWorklogNote }); setEditingWorklogId(null); }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button onClick={() => setEditingWorklogId(null)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5"
                            style={{ background: wl.author?.color || "#2563EB" }}
                          >
                            {wl.author?.avatar || "US"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800">
                              {wl.author?.name} logged <span className="font-bold text-blue-600">{wl.hours}h</span>
                            </p>
                            <p className="text-[10px] text-slate-400">{wl.category} · {wl.date}</p>
                            {wl.note && <p className="text-xs text-slate-600 mt-1 italic">{wl.note}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => { setEditingWorklogId(wl.id); setEditingWorklogHours(String(wl.hours)); setEditingWorklogNote(wl.note || ""); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => deleteWorklog(task.id, wl.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: ATTACHMENTS MANAGER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Paperclip size={16} className="text-purple-600" />
                Attachments & Files ({attachments.length})
              </h2>

              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <UploadCloud size={13} /> Upload File
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-2 pt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      {att.type === "image" ? <ImageIcon size={18} /> : att.type === "code" ? <FileCode size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{att.name}</p>
                      <p className="text-[10px] text-slate-400">{att.size} · Uploaded {formatDate(att.uploadedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a href={att.url} download={att.name} className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                      <Download size={14} />
                    </a>
                    <button onClick={() => handleDeleteAttachment(att.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: COMMENTS & DISCUSSION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare size={16} className="text-amber-600" />
              Discussion & Comments ({commentList.length})
            </h2>

            {/* Quick Comment Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Reply:</span>
              {["Status update...", "Thanks!", "Agree with approach", "Ready for Code Review"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => addComment(chip)}
                  className="px-2.5 py-1 bg-slate-100 border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg text-xs transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {commentList.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-sm"
                    style={{ background: c.author?.color || "#2563EB" }}
                  >
                    {c.author?.avatar || "US"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">{c.author?.name || "User"}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                        {c.editedAt && <span className="text-[10px] text-slate-400 italic">(edited)</span>}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit comment"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => deleteComment(task.id, c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {editingCommentId === c.id ? (
                      <div className="space-y-2">
                        <textarea
                          autoFocus
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          rows={3}
                          className="w-full text-xs border border-blue-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { editComment(task.id, c.id, editingCommentText.trim()); setEditingCommentId(null); }}
                            disabled={!editingCommentText.trim()}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 disabled:opacity-40 text-white text-xs rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 whitespace-pre-wrap">
                        {c.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <input
                type="text"
                placeholder="Write a comment or update…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button
                onClick={() => addComment()}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 disabled:opacity-40 hover:bg-blue-700 text-white rounded-xl transition-colors font-semibold text-xs flex items-center gap-1"
              >
                <Send size={13} /> Post
              </button>
            </div>
          </div>

          {/* SECTION 7: ACTIVITY & AUDIT HISTORY (Collapsible) */}
          <HistorySection activityLog={task.activityLog || []} />

        </div>

        {/* ── RIGHT SIDEBAR PANEL ── */}
        <div className="space-y-6">

          {/* TEMPO TIME TRACKER WIDGET */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock size={15} className="text-blue-600" /> Tempo Time Tracker
              </span>
              <button
                onClick={() => setShowTimeLogModal(true)}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-2xs"
              >
                Log Time
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Logged: <strong className="text-blue-600">{loggedHs}h</strong></span>
                <span>Remaining: <strong className="text-slate-900">{remainingHs}h</strong></span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${loggedPercent}%` }}
                />
                <div
                  className="h-full bg-slate-700 transition-all opacity-80"
                  style={{ width: `${100 - loggedPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Estimated: {estimatedHs}h</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSubtasks}
                    onChange={(e) => setIncludeSubtasks(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  Include sub-tasks
                </label>
              </div>
            </div>
          </div>

          {/* DETAILS METADATA PANEL */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Details Panel
            </p>

            {/* Assignee */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Assignee</label>
                <button
                  onClick={() => updateTask(task.id, { assignee: TEAM_MEMBERS[0] })}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Assign to me
                </button>
              </div>
              <select
                value={assignee.id}
                onChange={(e) => updateTask(task.id, { assignee: TEAM_MEMBERS.find((m) => m.id === e.target.value) })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none text-slate-800"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            {/* Reporter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">Reporter</label>
              <select
                value={task.reporter?.id || "u2"}
                onChange={(e) => updateTask(task.id, { reporter: TEAM_MEMBERS.find((m) => m.id === e.target.value) })}
                className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none text-slate-800"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">Status</label>
              <select
                value={task.status}
                onChange={(e) => updateTask(task.id, { status: e.target.value })}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none"
                style={{ color: col?.color }}
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                className={`w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none ${pCfg.color}`}
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Program Increment */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">Program Increment (PI)</label>
              <select
                value={task.pi || PI_OPTIONS[0]}
                onChange={(e) => updateTask(task.id, { pi: e.target.value })}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800"
              >
                {PI_OPTIONS.map((pi) => (
                  <option key={pi} value={pi}>{pi}</option>
                ))}
              </select>
            </div>

            {/* LOB Domain */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">LOB Domain</label>
              <select
                value={task.lob || LOB_OPTIONS[0]}
                onChange={(e) => updateTask(task.id, { lob: e.target.value })}
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800"
              >
                {LOB_OPTIONS.map((lob) => (
                  <option key={lob} value={lob}>{lob}</option>
                ))}
              </select>
            </div>

            {/* Fix Version */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">Fix Versions</label>
              <select
                value={task.fixVersion || FIX_VERSIONS[0]}
                onChange={(e) => updateTask(task.id, { fixVersion: e.target.value })}
                className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800"
              >
                {FIX_VERSIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Scrum Cycle */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">Scrum Cycle</label>
              <select
                value={task.cycleId || "cycle-4"}
                onChange={(e) => updateTask(task.id, { cycleId: e.target.value })}
                className="w-full text-xs font-semibold border border-purple-200 rounded-xl px-3 py-2 bg-purple-50 text-purple-700 outline-none cursor-pointer"
              >
                {CYCLES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.range})</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase block">Due Date</label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className={`w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none ${due.color}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Modals */}
      <AnimatePresence>
        {showTimeLogModal && (
          <TimeLogModal taskId={task.id} onClose={() => setShowTimeLogModal(false)} />
        )}
        {showIntegrationsModal && (
          <IntegrationsModal onClose={() => setShowIntegrationsModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
