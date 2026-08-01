import { motion } from "framer-motion";
import { X, Calendar, Globe, Cpu, CheckCircle2, ExternalLink } from "lucide-react";

export default function IntegrationsModal({ onClose }) {
  const integrations = [
    {
      name: "Microsoft 365 Calendar",
      icon: "📅",
      category: "Calendar & Schedule",
      connected: true,
      desc: "Sync sprint deadlines, release milestones, and BA review meetings with Outlook Calendar.",
    },
    {
      name: "Google Calendar",
      icon: "📆",
      category: "Calendar & Schedule",
      connected: true,
      desc: "Automatically post order matching engine deployment reminders to team calendars.",
    },
    {
      name: "BuySell Trading Engine API Gateway",
      icon: "⚡",
      category: "Trading Infrastructure",
      connected: true,
      desc: "Direct integration with Node.js high-frequency order matching engine log metrics.",
    },
    {
      name: "Fix Protocol Gateway",
      icon: "🌐",
      category: "Financial Protocol",
      connected: true,
      desc: "Real-time stream of institution order execution reports and drop copy feeds.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold">All Integrations</h3>
              <p className="text-[11px] text-slate-400">Connected services & external tool sync</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {integrations.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:border-blue-200 transition-all flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                  {item.connected ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  ) : (
                    <button className="text-[10px] font-bold text-blue-600 hover:underline">Connect</button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">Uses AI & Webhooks. Verify results.</span>
          <button onClick={onClose} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
