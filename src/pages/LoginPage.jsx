import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { TEAM_MEMBERS } from "../data/constants";

export default function LoginPage() {
  const { login, loginError, clearError } = useAuthStore();
  const [email, setEmail]       = useState("Haro09a@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
    }, 400);
  };

  const selectQuickUser = (memberEmail) => {
    setEmail(memberEmail);
    setPassword("admin123");
    clearError();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

      {/* Main Glassmorphism Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl z-10 space-y-6"
      >
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Buysell Project</h1>
          <p className="text-xs text-slate-400">Enter your credentials to access your Kanban workspace</p>
        </div>

        {/* Quick Member Switch Chips */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
            Quick 1-Click Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEAM_MEMBERS.map((m) => {
              const isSelected = email.toLowerCase() === m.email.toLowerCase();
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectQuickUser(m.email)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500/60 text-white"
                      : "bg-slate-900/40 border-slate-700/40 hover:border-slate-600 text-slate-300"
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                    style={{ background: m.color }}
                  >
                    {m.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{m.name.split(" ")[0]}</p>
                    <p className="text-[9px] text-slate-400 truncate">Admin</p>
                  </div>
                  {isSelected && <CheckCircle2 size={13} className="text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {loginError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium text-center"
          >
            {loginError}
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="name@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <span className="text-[10px] text-slate-500">Min. 4 characters</span>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={15} /> Sign In to Workspace
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="pt-2 text-center border-t border-slate-800/60">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck size={13} className="text-emerald-500" /> Secure SSL Encrypted Authorization
          </p>
        </div>
      </motion.div>
    </div>
  );
}
