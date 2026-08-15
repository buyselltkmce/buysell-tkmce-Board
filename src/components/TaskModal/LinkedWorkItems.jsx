import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Plus, X, GitBranch, AlertCircle, ArrowUpRight, Trash2, BookOpen, Bug } from "lucide-react";
import { useBoardStore } from "../../store/boardStore";
import { COLUMNS } from "../../data/constants";

export default function LinkedWorkItems({ currentTask }) {
  const { tasks, addLinkedTask, removeLinkedTask, openTaskModal } = useBoardStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [relationship, setRelationship] = useState("is cloned by");
  const [selectedTargetId, setSelectedTargetId] = useState("");

  const linkedList = currentTask.linkedTasks || [];

  // Filter out current task and already linked tasks
  const availableTasks = tasks.filter(
    (t) => t.id !== currentTask.id && !linkedList.some((l) => l.id === t.id)
  );

  const handleAddLink = () => {
    if (!selectedTargetId) return;
    const targetTask = tasks.find((t) => t.id === selectedTargetId);
    if (targetTask) {
      addLinkedTask(currentTask.id, targetTask, relationship);
      setShowAddModal(false);
      setSelectedTargetId("");
    }
  };

  // Group by relationship type
  const groupedLinks = linkedList.reduce((acc, item) => {
    const rel = item.relationship || "relates to";
    if (!acc[rel]) acc[rel] = [];
    acc[rel].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Link2 size={14} className="text-purple-600" /> Linked Work Items ({linkedList.length})
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-[11px] font-bold transition-colors"
        >
          <Plus size={12} /> Link Task
        </button>
      </div>

      {linkedList.length === 0 ? (
        <div className="text-center py-4 bg-white rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
          No linked work items. Click "Link Task" to add relationships (clones, dependencies, blocks).
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedLinks).map(([relGroup, items]) => (
            <div key={relGroup} className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {relGroup}
              </span>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const actualTask = tasks.find((t) => t.id === item.id) || item;
                  const col = COLUMNS.find((c) => c.id === actualTask.status);
                  return (
                    <a
                      key={item.id}
                      href={`/task/${actualTask.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center gap-1 shrink-0">
                          {actualTask.type === "bug" ? (
                            <Bug size={10} className="text-rose-600 shrink-0" title="Bug / Defect" />
                          ) : (
                            <BookOpen size={10} className="text-blue-600 shrink-0" title="User Story" />
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                            {actualTask.ticketKey}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-purple-700 transition-colors">
                          {actualTask.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {col && (
                          <span
                            className="tag-chip font-bold text-[10px]"
                            style={{ background: `${col.color}15`, color: col.color }}
                          >
                            {col.title}
                          </span>
                        )}
                        {actualTask.assignee && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                            style={{ background: actualTask.assignee.color }}
                            title={actualTask.assignee.name}
                          >
                            {actualTask.assignee.avatar}
                          </div>
                        )}
                        <button
                          onClick={() => removeLinkedTask(currentTask.id, item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                          title="Remove Link"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Link Modal Popover */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 size={14} className="text-purple-600" /> Link Work Item
                </h4>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                >
                  <option value="is cloned by">is cloned by</option>
                  <option value="blocks">blocks</option>
                  <option value="depends on">depends on</option>
                  <option value="relates to">relates to</option>
                  <option value="duplicates">duplicates</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Select Target Task</label>
                {availableTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No available tasks to link.</p>
                ) : (
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800"
                  >
                    <option value="">-- Choose a BuySell task --</option>
                    {availableTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.ticketKey}: {t.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLink}
                  disabled={!selectedTargetId}
                  className="px-4 py-1.5 bg-purple-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg hover:bg-purple-700"
                >
                  Link Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
