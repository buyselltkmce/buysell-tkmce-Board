import { useState } from "react";
import { Activity, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { formatDate } from "../../utils/helpers";
import { TEAM_MEMBERS } from "../../data/constants";

const FIELD_ICONS = {
  Status:       "🔄",
  Priority:     "🚩",
  Assignee:     "👤",
  Reporter:     "📋",
  Title:        "✏️",
  Description:  "📝",
  Comment:      "💬",
  Checklist:    "✅",
  Attachment:   "📎",
  Cycle:        "🔁",
  Epic:         "🏔️",
  "LOB Domain": "🏢",
  PI:           "📅",
  "Fix Version":"🏷️",
  "Due Date":   "📆",
};

const FIELD_COLORS = {
  Status:       "bg-blue-50 text-blue-700 border-blue-200",
  Priority:     "bg-orange-50 text-orange-700 border-orange-200",
  Assignee:     "bg-indigo-50 text-indigo-700 border-indigo-200",
  Reporter:     "bg-slate-100 text-slate-700 border-slate-300",
  Title:        "bg-yellow-50 text-yellow-700 border-yellow-200",
  Description:  "bg-green-50 text-green-700 border-green-200",
  Comment:      "bg-amber-50 text-amber-700 border-amber-200",
  Checklist:    "bg-teal-50 text-teal-700 border-teal-200",
  Attachment:   "bg-purple-50 text-purple-700 border-purple-200",
  Cycle:        "bg-violet-50 text-violet-700 border-violet-200",
  Epic:         "bg-pink-50 text-pink-700 border-pink-200",
  "LOB Domain": "bg-cyan-50 text-cyan-700 border-cyan-200",
  PI:           "bg-rose-50 text-rose-700 border-rose-200",
  "Fix Version":"bg-lime-50 text-lime-700 border-lime-200",
  "Due Date":   "bg-sky-50 text-sky-700 border-sky-200",
};

// Strip any legacy ellipsis from old stored data
function clean(text) {
  if (!text) return text;
  return String(text).replace(/[…\.]{3,}$/, "").trim();
}

function LogEntry({ log, idx }) {
  const [expanded, setExpanded] = useState(false);

  const actor      = log.actor || TEAM_MEMBERS[0];
  const fieldLabel = log.field || "Change";
  const fieldColor = FIELD_COLORS[fieldLabel] || "bg-slate-50 text-slate-700 border-slate-200";
  const fieldIcon  = FIELD_ICONS[fieldLabel]  || "🔧";
  const rawBefore  = log.before !== null && log.before !== undefined ? clean(String(log.before)) : null;
  const rawAfter   = log.after  !== null && log.after  !== undefined ? clean(String(log.after))  : null;
  const hasDiff    = rawBefore !== null || rawAfter !== null;

  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden hover:border-purple-200 transition-all">
      {/* ── Summary row (always visible) ── */}
      <div
        className={`flex items-start gap-3 p-3.5 cursor-pointer ${hasDiff ? "hover:bg-purple-50/30" : "hover:bg-slate-50"} transition-colors`}
        onClick={() => hasDiff && setExpanded((e) => !e)}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-sm"
          style={{ background: actor.color || "#7C3AED" }}
        >
          {actor.avatar || "US"}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800">{actor.name}</span>
              <span className="text-xs text-slate-500">{log.action}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${fieldColor}`}>
                {fieldIcon} {fieldLabel}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">{formatDate(log.createdAt)}</span>
              {hasDiff && (
                <span className="ml-1 text-purple-400">
                  {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              )}
            </div>
          </div>

          {/* Collapsed preview — show truncated before→after on one line */}
          {hasDiff && !expanded && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] overflow-hidden">
              {rawBefore !== null && (
                <span className="bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5 font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                  {rawBefore}
                </span>
              )}
              {rawBefore !== null && rawAfter !== null && (
                <ChevronRight size={11} className="text-slate-400 shrink-0" />
              )}
              {rawAfter !== null && (
                <span className="bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5 font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
                  {rawAfter}
                </span>
              )}
              <span className="text-purple-500 text-[10px] font-medium ml-1 shrink-0">
                click to expand
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded full before/after ── */}
      {hasDiff && expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 space-y-2">
          {rawBefore !== null && (
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-bold text-red-500 uppercase shrink-0 mt-1 w-12 tracking-wider">
                Before
              </span>
              <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <p className="text-xs text-red-700 font-medium leading-relaxed" style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                  {rawBefore}
                </p>
              </div>
            </div>
          )}
          {rawAfter !== null && (
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-bold text-green-600 uppercase shrink-0 mt-1 w-12 tracking-wider">
                After
              </span>
              <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <p className="text-xs text-green-800 font-medium leading-relaxed" style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                  {rawAfter}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setExpanded(false)}
            className="text-[10px] text-slate-400 hover:text-purple-600 font-medium mt-1 transition-colors"
          >
            ↑ Collapse
          </button>
        </div>
      )}
    </div>
  );
}

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
        <div className="border-t border-slate-100 px-4 py-4 space-y-2 max-h-[600px] overflow-y-auto">
          {activityLog.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No history recorded yet. Make any change to start tracking.
            </p>
          ) : (
            activityLog.map((log, idx) => (
              <LogEntry key={log.id || idx} log={log} idx={idx} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
