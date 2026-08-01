import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mail, GitBranch, Globe, CheckCircle2, Clock, Zap } from "lucide-react";
import { useBoardStore } from "../store/boardStore";
import { TEAM_MEMBERS, PRIORITY_CONFIG } from "../data/constants";
import { formatDueDate } from "../utils/helpers";

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.3 },
});

const ROLES = ["Lead Developer", "Backend Engineer", "DevOps Engineer", "Database Architect", "Frontend Developer"];
const SKILLS = [
  ["React", "TypeScript", "Figma", "CSS"],
  ["Node.js", "PostgreSQL", "Docker", "Redis"],
  ["AWS", "GitHub Actions", "Kubernetes", "Terraform"],
  ["PostgreSQL", "MongoDB", "GraphQL", "Redis"],
  ["React Native", "Vue.js", "Performance", "Webpack"],
];

export default function TeamPage() {
  const { tasks } = useBoardStore();
  const navigate  = useNavigate();

  return (
    <div className="p-8 overflow-y-auto max-w-5xl mx-auto">
      <motion.div {...fadeUp(0)} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
        <p className="text-sm text-slate-500 mt-1">{TEAM_MEMBERS.length} members · Software Development</p>
      </motion.div>

      {/* Member cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {TEAM_MEMBERS.map((member, i) => {
          const memberTasks  = tasks.filter((t) => t.assignee?.id === member.id);
          const done         = memberTasks.filter((t) => t.status === "deployed_live").length;
          const inProg       = memberTasks.filter((t) => t.status === "in_development").length;
          const totalHours   = memberTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
          const completionPct = memberTasks.length ? Math.round((done / memberTasks.length) * 100) : 0;
          const memberSkills  = SKILLS[i] || ["React", "Node.js", "Docker", "DevOps"];

          return (
            <motion.div key={member.id} {...fadeUp(i + 1)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}cc)` }}
                >
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{member.role}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] text-slate-400">Online</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Tasks",     value: memberTasks.length, icon: CheckCircle2, color: "#2563EB" },
                  { label: "In Prog",  value: inProg,             icon: Zap,          color: "#D97706" },
                  { label: "Hours",     value: `${totalHours}h`,  icon: Clock,        color: "#7C3AED" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 rounded-xl p-2 text-center border border-slate-100">
                    <stat.icon size={12} className="mx-auto mb-1" style={{ color: stat.color }} />
                    <p className="text-sm font-bold text-slate-800">{stat.value}</p>
                    <p className="text-[9px] text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Completion bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 font-medium">Completion rate</span>
                  <span className="text-[10px] font-bold text-blue-600">{completionPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.07 }}
                    className="h-full rounded-full"
                    style={{ background: member.color }}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-4">
                {memberSkills.map((skill) => (
                  <span key={skill} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Mail size={13} />
                </button>
                <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <GitBranch size={13} />
                </button>
                <button className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <Globe size={13} />
                </button>
                <button
                  onClick={() => navigate(`/?assignee=${member.id}`)}
                  className="ml-auto text-[10px] font-semibold text-blue-600 hover:underline"
                >
                  View tasks →
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
