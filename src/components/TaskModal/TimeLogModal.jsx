import { useState } from "react";
import { motion } from "framer-motion";
import { X, Clock, Calendar, FileText, Check } from "lucide-react";
import { useBoardStore } from "../../store/boardStore";
import { TEAM_MEMBERS } from "../../data/constants";

export default function TimeLogModal({ taskId, onClose }) {
  const { logWorkTime } = useBoardStore();
  const [hours, setHours] = useState("2");
  const [category, setCategory] = useState("Development");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [authorId, setAuthorId] = useState("u1");

  const handleSubmit = (e) => {
    e.preventDefault();
    const numHours = parseFloat(hours);
    if (!numHours || numHours <= 0) return;

    const authorObj = TEAM_MEMBERS.find((m) => m.id === authorId) || TEAM_MEMBERS[0];
    logWorkTime(taskId, {
      hours: numHours,
      category,
      date,
      note,
      author: authorObj,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Tempo Time Tracker</h3>
              <p className="text-[11px] text-slate-400">Log work time on this BuySell task</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Time Spent */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Time Spent (Hours)</label>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Clock size={16} className="text-blue-600 shrink-0" />
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="100"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 2.5"
                required
                className="w-full text-sm font-bold text-slate-900 bg-transparent outline-none"
              />
              <span className="text-xs font-semibold text-slate-400">hours</span>
            </div>
          </div>

          {/* Work Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Work Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="BA Specification">BA Specification</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Development">Development</option>
              <option value="Architecture Review">Architecture Review</option>
              <option value="QA Stress Test">QA Stress Test</option>
              <option value="Code Review">Code Review</option>
              <option value="Bug Fix">Bug Fix</option>
            </select>
          </div>

          {/* Contributor */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Logged By</label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Date Logged</label>
            <div
              className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 cursor-pointer transition-all"
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input[type="date"]');
                if (input && typeof input.showPicker === 'function') input.showPicker();
              }}
            >
              <Calendar size={16} className="text-blue-600 shrink-0" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-bold bg-transparent outline-none text-slate-800 cursor-pointer"
              />
            </div>
          </div>

          {/* Description / Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Work Description (Optional)</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Implemented WebSocket ticker stream and unit test cases..."
              className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-700"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Check size={14} /> Save Logged Time
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
