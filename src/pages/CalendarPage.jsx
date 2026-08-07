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
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const { year, month } = current;
  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDayOfMonth(year, month);

  const prevMonth = () => { setCurrent(month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }); setSelectedDay(1); };
  const nextMonth = () => { setCurrent(month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }); setSelectedDay(1); };
  const goToday   = () => { setCurrent({ year: today.getFullYear(), month: today.getMonth() }); setSelectedDay(today.getDate()); };

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
    <div className="p-4 sm:p-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
            <p className="text-sm text-slate-500 mt-1">View tasks by due date</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
              Today
            </button>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" /></button>
              <span className="px-3 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[120px] sm:min-w-[140px] text-center">{MONTHS[month]} {year}</span>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={16} className="text-slate-600 dark:text-slate-400" /></button>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            {DAYS.map((d) => (
              <div key={d} className="py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                  onClick={() => day && setSelectedDay(day)}
                  className={`min-h-[55px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-slate-100 dark:border-slate-800 last:border-r-0 cursor-pointer ${
                    !day ? "bg-slate-50/40 dark:bg-slate-900/10" : "bg-white dark:bg-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-850/60"
                  } ${day && selectedDay === day ? "bg-blue-50/70 dark:bg-blue-950/30" : ""} transition-colors`}
                >
                  {day && (
                    <>
                      <span className={`text-[10px] sm:text-xs font-semibold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                        isToday(day) ? "bg-blue-600 text-white font-bold" : "text-slate-600 dark:text-slate-300"
                      } ${selectedDay === day && !isToday(day) ? "border border-blue-400" : ""}`}>
                        {day}
                      </span>
                      
                      {/* Desktop labels */}
                      <div className="mt-1 space-y-1 hidden md:block">
                        {dayTasks.slice(0, 3).map((t) => {
                          const pCfg = PRIORITY_CONFIG[t.priority];
                          return (
                            <div
                              key={t.id}
                              onClick={(e) => { e.stopPropagation(); navigate(`/task/${t.id}`); }}
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

                      {/* Mobile dot indicators */}
                      <div className="flex justify-center gap-0.5 mt-1 sm:mt-1.5 md:hidden flex-wrap max-w-full">
                        {dayTasks.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background:
                                t.priority === "critical" ? "#EF4444" :
                                t.priority === "high"     ? "#F97316" :
                                t.priority === "medium"   ? "#EAB308" : "#60A5FA"
                            }}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected day task list (mobile only) */}
        <div className="mt-6 md:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <CalIcon size={14} className="text-blue-500" />
            Tasks Due on {MONTHS[month]} {selectedDay}, {year}
          </h3>
          {cells.includes(selectedDay) && (tasksByDay[selectedDay] ?? []).length > 0 ? (
            <div className="space-y-2">
              {(tasksByDay[selectedDay] ?? []).map((t) => {
                const pCfg = PRIORITY_CONFIG[t.priority];
                const col = COLUMNS.find((c) => c.id === t.status);
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/task/${t.id}`)}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl hover:border-blue-200 dark:hover:border-blue-900 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{col?.emoji} {col?.title}</p>
                    </div>
                    <span className={`tag-chip ${pCfg.bg} ${pCfg.color} ${pCfg.border} border text-[9px] shrink-0`}>
                      {pCfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">No tasks due on this day.</p>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
          {Object.entries(PRIORITY_CONFIG).map(([k, cfg]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${cfg.bg} border ${cfg.border}`} />
              <span className="text-xs text-slate-500 dark:text-slate-400">{cfg.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
