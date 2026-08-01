import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Kanban, Calendar, BarChart2,
  Users, Settings, ChevronRight, Zap, Repeat, GitBranch,
} from "lucide-react";
import { useBoardStore } from "../../store/boardStore";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard, path: "/dashboard" },
  { id: "board",     label: "Kanban Board", icon: Kanban,          path: "/"          },
  { id: "epics",     label: "BSL Epics",    icon: GitBranch,       path: "/epics"     },
  { id: "cycles",    label: "Scrum Cycles", icon: Repeat,          path: "/cycles"    },
  { id: "calendar",  label: "Calendar",     icon: Calendar,        path: "/calendar"  },
  { id: "reports",   label: "Reports",      icon: BarChart2,       path: "/reports"   },
  { id: "team",      label: "Team",         icon: Users,           path: "/team"      },
  { id: "settings",  label: "Settings",     icon: Settings,        path: "/settings"  },
];

export default function Sidebar() {
  const { tasks } = useBoardStore();
  const navigate  = useNavigate();
  const inProgress = tasks.filter((t) => t.status === "progress").length;

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-100 flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div
          className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">Buysell</p>
          <p className="text-[10px] text-slate-400 leading-tight">Project Management</p>
        </div>
      </div>

      {/* Project pill */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition-colors group">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">BP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">Buysell Project</p>
            <p className="text-[10px] text-slate-400">Software Dev</p>
          </div>
          <ChevronRight size={12} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 pt-2 pb-1">
          Main Menu
        </p>
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => (
          <NavLink
            key={id}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `nav-item w-full ${isActive ? "nav-active" : ""}`
            }
          >
            <Icon size={16} />
            <span className="flex-1 text-left">{label}</span>
            {id === "board" && inProgress > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {inProgress}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
            style={{ background: "linear-gradient(135deg,#7C3AED,#2563EB)" }}
          >
            HK
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">Haroshin K K</p>
            <p className="text-[10px] text-slate-400 truncate">Haro09a@gmail.com</p>
          </div>
          <NavLink to="/settings">
            <Settings size={14} className="ml-auto text-slate-400 cursor-pointer hover:text-slate-600 transition-colors shrink-0" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
