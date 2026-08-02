import { useState } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import { TEAM_MEMBERS } from "../../data/constants";

const FIELD_ICONS = {
  Status:      "🔄",
  Priority:    "🚩",
  Assignee:    "👤",
  Reporter:    "📋",
  Title:       "✏️",
  Description: "📝",
  Comment:     "💬",
  Checklist:   "✅",
  Attachment:  "📎",
  Cycle:       "🔁",
  Epic:        "🏔️",
  "LOB Domain": "🏢",
  PI:          "📅",
  "Fix Version": "🏷️",
  "Due Date":  "📆",
};

const FIELD_COLORS = {
  Status:      "bg-blue-50 text-blue-700 border-blue-200",
  Priority:    "bg-orange-50 text-orange-700 border-orange-200",
  Assignee:    "bg-indigo-50 text-indigo-700 border-indigo-200",
  Reporter:    "bg-slate-50 text-slate-700 border-slate-200",
  Title:       "bg-yellow-50 text-yellow-700 border-yellow-200",
  Description: "bg-green-50 text-green-700 border-green-200",
  Comment:     "bg-amber-50 text-amber-700 border-amber-200",
  Checklist:   "bg-teal-50 text-teal-700 border-teal-200",
  Attachment:  "bg-purple-50 text-purple-700 border-purple-200",
  Cycle:       "bg-violet-50 text-violet-700 border-violet-200",
  Epic:        "bg-pink-50 text-pink-700 border-pink-200",
  "LOB Domain": "bg-cyan-50 text-cyan-700 border-cyan-200",
  PI:          "bg-rose-50 text-rose-700 border-rose-200",
  "Fix Version": "bg-lime-50 text-lime-700 border-lime-200",
  "Due Date":  "bg-sky-50 text-sky-700 border-sky-200",
};

export default function HistorySection({ activityLog = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Clickable Tab Header ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Activity size={14} />
          </div>
          <span className="text-sm font-bold text-slate-900">Activity &amp; Change History</span>
          <span className="text-[11px] font-semibold bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
            {activityLog.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-purple-600 transition-colors">
          <span className="text-xs font-medium">{open ? "Collapse" : "View history"}</span>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* ── Collapsible Body ── */}
      {open && (
        <div className="border-t border-slate-100 px-6 py-4 space-y-3 max-h-[500px] overflow-y-auto">
          {activityLog.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No history recorded yet. Make any change to start tracking.
            </p>
          ) : (
            activityLog.map((log, idx) => {
              const actor = log.actor || TEAM_MEMBERS[0];
              const fieldLabel = log.field || "Change";
              const fieldColor = FIELD_COLORS[fieldLabel] || "bg-slate-50 text-slate-700 border-slate-200";
              const fieldIcon = FIELD_ICONS[fieldLabel] || "🔧";
              const hasDiff = log.before !== null || log.after !== null;

              return (
                <div
                  key={log.id || idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/20 transition-all group"
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-sm"
                    style={{ background: actor.color || "#7C3AED" }}
                  >
                    {actor.avatar || "US"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">{actor.name}</span>
                        <span className="text-xs text-slate-500">{log.action}</span>
                        {/* Field badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fieldColor}`}>
                          {fieldIcon} {fieldLabel}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatDate(log.createdAt)}</span>
                    </div>

                    {/* Before → After diff row */}
                    {hasDiff && (
                      <div className="flex flex-col gap-1.5 mt-2">
                        {log.before !== null && (
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-red-500 uppercase shrink-0 mt-0.5 w-12">Before</span>
                            <span className="text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg px-2.5 py-1.5 break-words whitespace-pre-wrap leading-relaxed flex-1">
                              {log.before}
                            </span>
                          </div>
                        )}
                        {log.after !== null && (
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-bold text-green-600 uppercase shrink-0 mt-0.5 w-12">After</span>
                            <span className="text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg px-2.5 py-1.5 break-words whitespace-pre-wrap leading-relaxed flex-1">
                              {log.after}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
