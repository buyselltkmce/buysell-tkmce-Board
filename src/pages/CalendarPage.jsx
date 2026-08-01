import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { PRIORITY_CONFIG, COLUMNS } from "../data/constants";
import { formatDueDate } from "../utils/helpers";

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const { tasks } = useBoardStore();
  const navigate  = useNavigate();

  const today     = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const { year, month } = current;
  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrent(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  const nextMonth = () => setCurrent(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
  const goToday   = () => setCurrent({ year: today.getFullYear(), month: today.getMonth() });

  // Map tasks to their due date day number (same month/year)
  const tasksByDay = {};
  tasks.forEach((t) => {
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(t);
    }
  });

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 ? day : null;
  });

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="p-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
            <p className="text-sm text-slate-500 mt-1">View tasks by due date</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              Today
            </button>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 transition-colors"><ChevronLeft size={16} className="text-slate-600" /></button>
              <span className="px-3 text-sm font-semibold text-slate-800 min-w-[140px] text-center">{MONTHS[month]} {year}</span>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 transition-colors"><ChevronRight size={16} className="text-slate-600" /></button>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map((d) => (
              <div key={d} className="py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dayTasks = day ? (tasksByDay[day] ?? []) : [];
              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 border-b border-r border-slate-100 last:border-r-0 ${
                    !day ? "bg-slate-50/40" : "bg-white hover:bg-slate-50/60"
                  } transition-colors`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday(day) ? "bg-blue-600 text-white" : "text-slate-600"
                      }`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 3).map((t) => {
                          const pCfg = PRIORITY_CONFIG[t.priority];
                          return (
                            <div
                              key={t.id}
                              onClick={() => navigate(`/task/${t.id}`)}
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md cursor-pointer truncate ${pCfg.bg} ${pCfg.color} hover:opacity-80 transition-opacity border ${pCfg.border}`}
                              title={t.title}
                            >
                              {t.title}
                            </div>
                          );
                        })}
                        {dayTasks.length > 3 && (
                          <p className="text-[9px] text-slate-400 pl-1">+{dayTasks.length - 3} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4">
          {Object.entries(PRIORITY_CONFIG).map(([k, cfg]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${cfg.bg} border ${cfg.border}`} />
              <span className="text-xs text-slate-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
