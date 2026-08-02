import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Trash2, Edit3, Check, Plus, Calendar, Clock,
  Paperclip, MessageSquare, Flag, Tag, User, ChevronDown,
  CheckSquare, Activity, Send, Circle, UploadCloud,
  FileText, Image as ImageIcon, Download, Repeat, FileCode,
  Globe, Sparkles, UserCheck, Layers, Award, ShieldAlert, Zap, Layers3
} from "lucide-react";
import { useBoardStore } from "../../store/boardStore";
import {
  COLUMNS, PRIORITY_CONFIG, LABEL_COLORS, ALL_LABELS,
  TEAM_MEMBERS, CYCLES, EPICS, LOB_OPTIONS, PI_OPTIONS, FIX_VERSIONS
} from "../../data/constants";
import { formatDate, formatDueDate, generateId } from "../../utils/helpers";
import TimeLogModal from "./TimeLogModal";
import LinkedWorkItems from "./LinkedWorkItems";
import IntegrationsModal from "./IntegrationsModal";

const INITIAL_ATTACHMENTS = [
  { id: "att-1", name: "Buysell_Order_Matching_Engine_v1.pdf", size: "2.4 MB", type: "pdf", url: "#", uploadedAt: "2026-07-20T14:30:00Z" },
  { id: "att-2", name: "Trading_UI_Figma_Design_Spec.png", size: "4.8 MB", type: "image", url: "#", uploadedAt: "2026-07-22T09:15:00Z" },
];

export default function TaskModal() {
  const { selectedTask, isModalOpen, closeTaskModal, updateTask, deleteTask, epics: storeEpics } = useBoardStore();
  const epicsList = storeEpics || EPICS;
  const [editingTitle, setEditingTitle]   = useState(false);
  const [title, setTitle]                 = useState("");
  const [desc, setDesc]                   = useState("");
  const [editingDesc, setEditingDesc]     = useState(false);
  const [newComment, setNewComment]       = useState("");
  const [newItem, setNewItem]             = useState("");
  const [attachments, setAttachments]     = useState(INITIAL_ATTACHMENTS);

  // Modals & Popovers state
  const [showTimeLogModal, setShowTimeLogModal]       = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showAgentMenu, setShowAgentMenu]             = useState(false);
  const [includeSubtasks, setIncludeSubtasks]         = useState(true);

  const titleRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDesc(selectedTask.description);
      setEditingTitle(false);
      setEditingDesc(false);
      setNewComment("");
      setNewItem("");
    }
  }, [selectedTask?.id]);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  if (!isModalOpen || !selectedTask) return null;

  const task = selectedTask;
  const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const col  = COLUMNS.find((c) => c.id === task.status);
  const cycleObj = CYCLES.find((c) => c.id === (task.cycleId || "cycle-2"));
  const epicObj = epicsList.find((e) => e.id === (task.epicId || "BSL-EPIC-1")) || epicsList[0];
  const due  = formatDueDate(task.dueDate);
  const checkedCount = task.checklist.filter((c) => c.completed).length;

  const saveTitle = () => {
    if (title.trim()) updateTask(task.id, { title: title.trim() });
    setEditingTitle(false);
  };

  const saveDesc = () => {
    updateTask(task.id, { description: desc });
    setEditingDesc(false);
  };

  const toggleChecklist = (itemId) => {
    updateTask(task.id, {
      checklist: task.checklist.map((c) =>
        c.id === itemId ? { ...c, completed: !c.completed } : c
      ),
    });
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    updateTask(task.id, {
      checklist: [...task.checklist, { id: generateId(), title: newItem.trim(), completed: false }],
    });
    setNewItem("");
  };

  const addComment = (customText) => {
    const textToPost = customText || newComment;
    if (!textToPost.trim()) return;
    const me = { id: "you", name: "You", avatar: "YO", color: "#2563EB" };
    updateTask(task.id, {
      commentList: [...task.commentList, {
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

    setAttachments((prev) => [newAtt, ...prev]);
    updateTask(task.id, { attachments: (task.attachments || 0) + 1 });
  };

  const handleDeleteAttachment = (attId) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
    updateTask(task.id, { attachments: Math.max(0, (task.attachments || 1) - 1) });
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) closeTaskModal();
  };

  // Tempo time metrics calculation
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

  const progressValue = task.checklist.length
    ? Math.round((checkedCount / task.checklist.length) * 100)
    : task.progress;

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col border border-slate-200"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Priority Gradient Stripe */}
        <div
          className="h-1.5 shrink-0"
          style={{
            background:
              task.priority === "critical" ? "linear-gradient(90deg,#EF4444,#F97316)" :
              task.priority === "high"     ? "linear-gradient(90deg,#F97316,#EAB308)" :
              task.priority === "medium"   ? "linear-gradient(90deg,#EAB308,#84CC16)" :
                                             "linear-gradient(90deg,#60A5FA,#818CF8)",
          }}
        />

        {/* ── Jira Enterprise Header Strip ── */}
        <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600">
            <span className="text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-md">
              Spaces / BSL
            </span>
            <span>/</span>
            <span className="text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
              {task.ticketKey}
            </span>
          </div>

          {/* Quick Jira Action Strip (Integrations, AI Agents, Time Logging) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Integrations Button */}
            <button
              onClick={() => setShowIntegrationsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors shadow-2xs"
            >
              <Globe size={13} />
              All integrations
            </button>

            {/* AI Agents Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAgentMenu(!showAgentMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
              >
                <Sparkles size={13} />
                Start work
                <ChevronDown size={12} />
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

            {/* Close & Delete */}
            <button
              onClick={() => { if (window.confirm("Delete this task?")) { deleteTask(task.id); } }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={closeTaskModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Title & Status Header */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-100 shrink-0">
          {editingTitle ? (
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setTitle(task.title); setEditingTitle(false); } }}
              className="w-full text-lg font-bold text-slate-900 border-b-2 border-blue-500 outline-none bg-transparent pb-1"
            />
          ) : (
            <h2
              className="text-lg font-bold text-slate-900 leading-snug cursor-pointer hover:text-blue-700 transition-colors flex items-center gap-2"
              onClick={() => setEditingTitle(true)}
            >
              {task.title} <Edit3 size={14} className="text-slate-300 hover:text-blue-500 shrink-0" />
            </h2>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
            <span className={`tag-chip ${pCfg.bg} ${pCfg.color} ${pCfg.border} border`}>{pCfg.label}</span>
            <span className="tag-chip font-bold" style={{ background: `${col?.color}18`, color: col?.color }}>
              {col?.emoji} {col?.title}
            </span>
            <span className="tag-chip bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              <Repeat size={10} className="inline mr-1" />
              {cycleObj?.name || "Cycle 2"}
            </span>
            <span className="tag-chip bg-slate-100 text-slate-700 border border-slate-200">
              LOB: {task.lob || "Spot Trading"}
            </span>
          </div>
        </div>

        {/* ── Unified Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">

          {/* Left Main Column */}
          <div className="space-y-6">

            {/* 1. Description */}
            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-blue-600" /> Description & Specification
              </h3>
              {editingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={4}
                    className="w-full text-xs text-slate-700 border border-blue-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-white"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveDesc} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md font-semibold">
                      Save Description
                    </button>
                    <button onClick={() => { setDesc(task.description); setEditingDesc(false); }} className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  onClick={() => setEditingDesc(true)}
                  className="text-xs text-slate-600 leading-relaxed cursor-pointer hover:bg-white rounded-lg p-2 -m-2 transition-colors border border-transparent hover:border-slate-200"
                >
                  {task.description || <span className="text-slate-400 italic">Click to add description…</span>}
                </p>
              )}
            </div>

            {/* 2. Linked Work Items (Cloned by, Blocks, Relates to) */}
            <LinkedWorkItems currentTask={task} />

            {/* 3. Checklist */}
            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-green-600" /> Checklist ({checkedCount}/{task.checklist.length})
                </h3>
                {task.checklist.length > 0 && (
                  <span className="text-[11px] font-bold text-blue-600">{progressValue}%</span>
                )}
              </div>

              <div className="space-y-1.5">
                {task.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-100 hover:border-blue-200 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      item.completed ? "bg-green-500 border-green-500 text-white" : "border-slate-300"
                    }`}>
                      {item.completed && <Check size={10} />}
                    </div>
                    <span className={`text-xs ${item.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                      {item.title}
                    </span>
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
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none"
                />
                <button onClick={addChecklistItem} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                  Add
                </button>
              </div>
            </div>

            {/* 4. Tempo Worklogs & Activity Log */}
            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" /> Tempo Logged Worklogs ({tempo.worklogs?.length || 0})
                </h3>
                <button
                  onClick={() => setShowTimeLogModal(true)}
                  className="px-2.5 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-[11px] font-bold transition-colors"
                >
                  + Log Time
                </button>
              </div>

              {tempo.worklogs?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No worklogs logged yet. Click "+ Log Time" to log hours.</p>
              ) : (
                <div className="space-y-2">
                  {tempo.worklogs.map((wl) => (
                    <div key={wl.id} className="p-2.5 rounded-lg bg-white border border-slate-100 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                          style={{ background: wl.author.color }}
                        >
                          {wl.author.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            {wl.author.name} logged <span className="font-bold text-blue-600">{wl.hours}h</span>
                          </p>
                          <p className="text-[10px] text-slate-400">{wl.category} · {wl.date}</p>
                          {wl.note && <p className="text-xs text-slate-600 mt-1 italic">{wl.note}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Attachments */}
            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip size={14} className="text-purple-600" /> Attachments ({attachments.length})
                </h3>
                <label className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors">
                  <UploadCloud size={12} /> Attach File
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        {att.type === "image" ? <ImageIcon size={14} /> : <FileText size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{att.name}</p>
                        <p className="text-[9px] text-slate-400">{att.size} · {formatDate(att.uploadedAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <a href={att.url} download={att.name} className="p-1 text-slate-400 hover:text-purple-600" title="Download">
                        <Download size={13} />
                      </a>
                      <button onClick={() => handleDeleteAttachment(att.id)} className="p-1 text-slate-400 hover:text-red-500" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Activity & Comments with Quick Reaction Chips */}
            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} className="text-amber-600" /> Discussion & Comments ({task.commentList.length})
              </h3>

              {/* Quick Reaction Comment Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Reply:</span>
                {["Status update...", "Thanks!", "Agree with approach", "Ready for Code Review"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => addComment(chip)}
                    className="px-2 py-0.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-md text-[11px] transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <div className="space-y-2.5">
                {task.commentList.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5"
                      style={{ background: c.author.color }}
                    >
                      {c.author.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-slate-800">{c.author.name}</span>
                        <span className="text-[9px] text-slate-400">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-600 bg-white rounded-lg p-2 border border-slate-100">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment input */}
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none"
                />
                <button onClick={() => addComment()} disabled={!newComment.trim()} className="px-3 py-1.5 bg-blue-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold">
                  Post
                </button>
              </div>
            </div>

            {/* 7. Activity & Audit History (Who done, What done, When done) */}
            <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity size={14} className="text-purple-600" /> Activity & Audit History ({(task.activityLog || []).length})
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Who · What · When</span>
              </h3>

              {(!task.activityLog || task.activityLog.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {task.activityLog.map((log, idx) => {
                    const actor = log.actor || TEAM_MEMBERS[0];
                    return (
                      <div key={log.id || idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-100 text-xs">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5"
                          style={{ background: actor.color || "#7C3AED" }}
                        >
                          {actor.avatar || "US"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800">{actor.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">{formatDate(log.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{log.action}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ── Right Column: Jira Tempo & Metadata Panel ── */}
          <div className="space-y-4 border-l border-slate-100 pl-6">

            {/* TEMPO TIME TRACKING WIDGET (Image 4) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-600" /> Tempo Time Tracker
                </span>
                <button
                  onClick={() => setShowTimeLogModal(true)}
                  className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  Log Time
                </button>
              </div>

              {/* Estimate vs Remaining Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Logged: <strong className="text-blue-600">{loggedHs}h</strong></span>
                  <span>Remaining: <strong className="text-slate-900">{remainingHs}h</strong></span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${loggedPercent}%` }}
                    title={`Logged: ${loggedHs}h`}
                  />
                  <div
                    className="h-full bg-blue-900 transition-all opacity-80"
                    style={{ width: `${100 - loggedPercent}%` }}
                    title={`Remaining: ${remainingHs}h`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
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

              {/* Collaborators */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Collaborators</span>
                <div className="flex items-center gap-1">
                  {TEAM_MEMBERS.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: m.color }}
                      title={m.name}
                    >
                      {m.avatar}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DETAILS METADATA PANEL (Image 1, 2, 5) */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details Panel</p>

              {/* Assignee & Assign to Me */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Assignee</label>
                  <button
                    onClick={() => updateTask(task.id, { assignee: TEAM_MEMBERS[0] })}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    Assign to me
                  </button>
                </div>
                <select
                  value={task.assignee.id}
                  onChange={(e) => updateTask(task.id, { assignee: TEAM_MEMBERS.find((m) => m.id === e.target.value) })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Reporter</label>
                <select
                  value={task.reporter?.id || "u2"}
                  onChange={(e) => updateTask(task.id, { reporter: TEAM_MEMBERS.find((m) => m.id === e.target.value) })}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                >
                  {TEAM_MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Priority</label>
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                  className={`w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 ${pCfg.color}`}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([k, cfg]) => (
                    <option key={k} value={k}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {/* Program Increment (PI) */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Program Increment (PI)</label>
                <select
                  value={task.pi || PI_OPTIONS[0]}
                  onChange={(e) => updateTask(task.id, { pi: e.target.value })}
                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                >
                  {PI_OPTIONS.map((pi) => (
                    <option key={pi} value={pi}>{pi}</option>
                  ))}
                </select>
              </div>

              {/* Line of Business (LOB) */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">LOB Domain</label>
                <select
                  value={task.lob || LOB_OPTIONS[0]}
                  onChange={(e) => updateTask(task.id, { lob: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                >
                  {LOB_OPTIONS.map((lob) => (
                    <option key={lob} value={lob}>{lob}</option>
                  ))}
                </select>
              </div>

              {/* Fix Versions */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Fix Versions</label>
                <select
                  value={task.fixVersion || FIX_VERSIONS[0]}
                  onChange={(e) => updateTask(task.id, { fixVersion: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                >
                  {FIX_VERSIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Scrum Cycle */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Scrum Cycle</label>
                <select
                  value={task.cycleId || "cycle-2"}
                  onChange={(e) => updateTask(task.id, { cycleId: e.target.value })}
                  className="w-full text-xs font-semibold border border-purple-200 rounded-lg p-2 bg-purple-50 text-purple-700"
                >
                  {CYCLES.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Due Date</label>
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                  className={`w-full text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 ${due.color}`}
                />
              </div>

            </div>

          </div>
        </div>

        {/* ── Sub-Modals (TimeLog, Integrations) ── */}
        <AnimatePresence>
          {showTimeLogModal && (
            <TimeLogModal taskId={task.id} onClose={() => setShowTimeLogModal(false)} />
          )}
          {showIntegrationsModal && (
            <IntegrationsModal onClose={() => setShowIntegrationsModal(false)} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
