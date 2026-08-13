import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useBoardStore } from "../../store/boardStore";
import { COLUMNS, PRIORITY_CONFIG, LABEL_COLORS, ALL_LABELS, TEAM_MEMBERS, CYCLES, EPICS, MAIN_BRANCH } from "../../data/constants";
import { generateId } from "../../utils/helpers";
import RichTextEditor from "./RichTextEditor";

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "medium",
  epicId: "BSL-EPIC-1",
  cycleId: "cycle-4",
  labels: [],
  assignee: TEAM_MEMBERS[0],
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  estimatedHours: 4,
  attachments: 0,
  comments: 0,
  progress: 0,
  checklist: [],
  commentList: [],
  activityLog: [],
};

export default function CreateTaskModal() {
  const { isCreateModalOpen, createTaskStatus, closeCreateModal, addTask, epics: storeEpics } = useBoardStore();
  const epicsList = storeEpics || EPICS;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  if (!isCreateModalOpen) return null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleLabel = (l) =>
    set("labels", form.labels.includes(l) ? form.labels.filter((x) => x !== l) : [...form.labels, l]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    addTask({ ...form, status: createTaskStatus ?? "ba_requirements" });
    setForm(EMPTY_FORM);
    setErrors({});
    closeCreateModal();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) closeCreateModal(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Create New Task</h2>
          <button onClick={closeCreateModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => { set("title", e.target.value); setErrors((x) => ({ ...x, title: "" })); }}
              className={`w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all ${
                errors.title
                  ? "border-red-400 focus:ring-2 focus:ring-red-500/20"
                  : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Description</label>
            <RichTextEditor
              placeholder="Add more detail…"
              value={form.description}
              onChange={(val) => set("description", val)}
            />
          </div>

          {/* Branch Epic */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Branch Epic ({MAIN_BRANCH.code})
            </label>
            <select
              value={form.epicId ?? "BSL-EPIC-1"}
              onChange={(e) => set("epicId", e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono font-bold border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 bg-purple-50 text-purple-700 transition-all cursor-pointer"
            >
              {epicsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {MAIN_BRANCH.code} / {e.key}: {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Status</label>
              <select
                value={form.status ?? createTaskStatus ?? "ba_requirements"}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
              >
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Due date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Assignee</label>
              <select
                value={form.assignee.id}
                onChange={(e) => set("assignee", TEAM_MEMBERS.find((m) => m.id === e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Cycle + Estimated hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Scrum Cycle</label>
              <select
                value={form.cycleId ?? "cycle-4"}
                onChange={(e) => set("cycleId", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
              >
                {CYCLES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.range})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Estimated Hours</label>
              <input
                type="number"
                value={form.estimatedHours}
                onChange={(e) => set("estimatedHours", Number(e.target.value))}
                min={0}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_LABELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLabel(l)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    form.labels.includes(l)
                      ? `${LABEL_COLORS[l] ?? "bg-blue-100 text-blue-700"} border-current`
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {form.labels.includes(l) && <Check size={9} className="inline mr-0.5" />}
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={closeCreateModal}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95"
          >
            Create Task
          </button>
        </div>
      </motion.div>
    </div>
  );
}
