import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, Sun, Moon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";

export default function LoginPage() {
  const { login, loginError, clearError } = useAuthStore();
  const { theme, toggleTheme }              = useThemeStore();
  const [email, setEmail]                 = useState("Haro09a@gmail.com");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center p-6 relative font-sans transition-colors">
      {/* Top right Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs flex items-center gap-2 text-xs font-semibold"
        title="Toggle Light/Dark Theme"
      >
        {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
      </button>

      {/* Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6"
      >
        {/* Workspace Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buysell Workspace</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with your email and password to access the board
          </p>
        </div>

        {/* Error Alert */}
        {loginError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold text-center"
          >
            {loginError}
          </motion.div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                placeholder="e.g. Haro09a@gmail.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                placeholder="Enter your password"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Default password: <span className="font-semibold text-slate-500">buysell2026</span>
            </p>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={15} /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck size={13} className="text-green-500" /> Authorized Admin Workspace
          </p>
        </div>
      </motion.div>
    </div>
  );
}
