import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Palette, Globe, Database,
  Zap, Check, ChevronRight, Moon, Sun, Monitor,
} from "lucide-react";

import { useAuthStore } from "../store/authStore";

const fadeUp = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.25 },
});

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0 ml-4">{children}</div>
    </div>
  );
}

const SECTIONS = [
  { id: "profile",       label: "Profile",       icon: User       },
  { id: "notifications", label: "Notifications", icon: Bell       },
  { id: "appearance",   label: "Appearance",    icon: Palette    },
  { id: "privacy",      label: "Privacy",       icon: Shield     },
  { id: "integrations", label: "Integrations",  icon: Globe      },
  { id: "data",         label: "Data & Export", icon: Database   },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [active, setActive]     = useState("profile");
  const [saved, setSaved]       = useState(false);
  const [theme, setTheme]       = useState("light");
  const [notifs, setNotifs]     = useState({
    email: true, push: false, mentions: true, dueDate: true, assignments: true,
  });
  const [privacy, setPrivacy]   = useState({
    publicProfile: false, activityStatus: true, analytics: true,
  });
  const [profile, setProfile]   = useState({
    name: user?.name || "Haroshin K K",
    email: user?.email || "Haro09a@gmail.com",
    role: user?.role || "Lead Developer & UI/UX (Admin)",
    avatar: user?.avatar || "HK",
    color: user?.color || "#7C3AED",
    timezone: "Asia/Kolkata",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 overflow-y-auto max-w-5xl mx-auto">
      <motion.div {...fadeUp(0)} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </motion.div>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        {/* Left nav */}
        <motion.div {...fadeUp(1)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 h-fit">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={15} />
              {label}
              {active === id && <ChevronRight size={12} className="ml-auto" />}
            </button>
          ))}
        </motion.div>

        {/* Right panel */}
        <motion.div {...fadeUp(2)} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

          {/* ── Profile ── */}
          {active === "profile" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900">Profile Settings</h2>
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-sm" style={{ background: profile.color || "#7C3AED" }}>
                  {profile.avatar || "HK"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{profile.name}</p>
                  <p className="text-xs text-slate-500">{profile.email}</p>
                  <button className="mt-1.5 text-xs text-blue-600 font-medium hover:underline">Change avatar</button>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Full Name",  key: "name",     type: "text"  },
                  { label: "Email",      key: "email",    type: "email" },
                  { label: "Role",       key: "role",     type: "text"  },
                  { label: "Timezone",   key: "timezone", type: "text"  },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={profile[key]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 mb-5">Notification Preferences</h2>
              <SettingRow label="Email notifications" description="Receive updates via email">
                <Toggle checked={notifs.email} onChange={(v) => setNotifs((n) => ({ ...n, email: v }))} />
              </SettingRow>
              <SettingRow label="Push notifications" description="Browser and mobile push alerts">
                <Toggle checked={notifs.push} onChange={(v) => setNotifs((n) => ({ ...n, push: v }))} />
              </SettingRow>
              <SettingRow label="Mentions" description="When someone mentions you in a comment">
                <Toggle checked={notifs.mentions} onChange={(v) => setNotifs((n) => ({ ...n, mentions: v }))} />
              </SettingRow>
              <SettingRow label="Due date reminders" description="Reminders 24h before due date">
                <Toggle checked={notifs.dueDate} onChange={(v) => setNotifs((n) => ({ ...n, dueDate: v }))} />
              </SettingRow>
              <SettingRow label="Task assignments" description="When a task is assigned to you">
                <Toggle checked={notifs.assignments} onChange={(v) => setNotifs((n) => ({ ...n, assignments: v }))} />
              </SettingRow>
            </div>
          )}

          {/* ── Appearance ── */}
          {active === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900">Appearance</h2>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "light",  label: "Light",  icon: Sun     },
                    { id: "dark",   label: "Dark",   icon: Moon    },
                    { id: "system", label: "System", icon: Monitor },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setTheme(id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon size={20} className={theme === id ? "text-blue-600" : "text-slate-400"} />
                      <span className={`text-xs font-semibold ${theme === id ? "text-blue-700" : "text-slate-600"}`}>{label}</span>
                      {theme === id && <Check size={12} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
              <SettingRow label="Compact mode" description="Reduce card padding and spacing">
                <Toggle checked={false} onChange={() => {}} />
              </SettingRow>
              <SettingRow label="Animations" description="Enable motion and transition effects">
                <Toggle checked={true} onChange={() => {}} />
              </SettingRow>
            </div>
          )}

          {/* ── Privacy ── */}
          {active === "privacy" && (
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 mb-5">Privacy & Security</h2>
              <SettingRow label="Public profile" description="Allow others to view your profile">
                <Toggle checked={privacy.publicProfile} onChange={(v) => setPrivacy((p) => ({ ...p, publicProfile: v }))} />
              </SettingRow>
              <SettingRow label="Activity status" description="Show when you're online to teammates">
                <Toggle checked={privacy.activityStatus} onChange={(v) => setPrivacy((p) => ({ ...p, activityStatus: v }))} />
              </SettingRow>
              <SettingRow label="Usage analytics" description="Help improve the product with usage data">
                <Toggle checked={privacy.analytics} onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))} />
              </SettingRow>
              <div className="pt-5 mt-5 border-t border-slate-100 space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-colors font-medium">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {active === "integrations" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 mb-5">Integrations</h2>
              {[
                { name: "GitHub",    icon: "🐙", desc: "Sync issues and pull requests",   connected: true  },
                { name: "Slack",     icon: "💬", desc: "Get notifications in Slack",       connected: true  },
                { name: "Figma",     icon: "🎨", desc: "Attach designs to tasks",          connected: false },
                { name: "Jira",      icon: "📋", desc: "Import existing Jira tickets",     connected: false },
                { name: "Supabase",  icon: "⚡", desc: "Connect your Supabase database",   connected: false },
                { name: "Firebase",  icon: "🔥", desc: "Real-time database integration",   connected: false },
              ].map((int) => (
                <div key={int.name} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">{int.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{int.name}</p>
                    <p className="text-xs text-slate-400">{int.desc}</p>
                  </div>
                  <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    int.connected
                      ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                    {int.connected ? "✓ Connected" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Data ── */}
          {active === "data" && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-900">Data & Export</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Export as JSON",   desc: "Full data export",          icon: Database },
                  { label: "Export as CSV",    desc: "Spreadsheet compatible",    icon: Globe    },
                  { label: "Export as PDF",    desc: "Print-ready report",        icon: Zap      },
                  { label: "Backup project",   desc: "Create a full backup",      icon: Shield   },
                ].map(({ label, desc, icon: Icon }) => (
                  <button key={label} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{label}</p>
                      <p className="text-[10px] text-slate-400">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">Your data is stored locally in browser memory. Connect a backend to persist across sessions.</p>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                saved ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {saved ? <><Check size={14} /> Saved!</> : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
