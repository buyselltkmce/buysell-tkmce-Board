import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Board from "./components/Board/Board";
import CreateTaskModal from "./components/TaskModal/CreateTaskModal";
import TaskDetailPage from "./pages/TaskDetailPage";
import DashboardPage from "./pages/DashboardPage";
import EpicsPage from "./pages/EpicsPage";
import CyclesPage from "./pages/CyclesPage";
import CalendarPage from "./pages/CalendarPage";
import ReportsPage from "./pages/ReportsPage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import { useBoardStore } from "./store/boardStore";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";

import ErrorBoundary from "./components/ErrorBoundary";

// Board layout — sidebar + header + content
function BoardLayout() {
  const { isCreateModalOpen } = useBoardStore();
  return (
    <div className="board-layout flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />
      <div className="board-main flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <div className="board-content flex-1 overflow-hidden">
          <Board />
        </div>
      </div>
      <AnimatePresence>
        {isCreateModalOpen && <CreateTaskModal key="create-modal" />}
      </AnimatePresence>
    </div>
  );
}

// Pages with sidebar but no board header (full height vertical scrolling)
function PageLayout({ children }) {
  const toggleMobileSidebar = useBoardStore((s) => s.toggleMobileSidebar);
  return (
    <div className="board-layout flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 md:hidden shrink-0">
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Buysell Project</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
            BP
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const initCloudSync   = useBoardStore((s) => s.initCloudSync);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initAuth        = useAuthStore((s) => s.initAuth);
  const initTheme       = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    initAuth();
    if (isAuthenticated) {
      initCloudSync();
    }
  }, [initCloudSync, isAuthenticated, initAuth, initTheme]);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<BoardLayout />} />
          <Route path="/dashboard" element={<PageLayout><DashboardPage /></PageLayout>} />
          <Route path="/epics"     element={<PageLayout><EpicsPage /></PageLayout>} />
          <Route path="/cycles"    element={<PageLayout><CyclesPage /></PageLayout>} />
          <Route path="/calendar"  element={<PageLayout><CalendarPage /></PageLayout>} />
          <Route path="/reports"   element={<PageLayout><ReportsPage /></PageLayout>} />
          <Route path="/team"      element={<PageLayout><TeamPage /></PageLayout>} />
          <Route path="/settings"  element={<PageLayout><SettingsPage /></PageLayout>} />
          <Route path="/task/:taskId" element={<PageLayout><TaskDetailPage /></PageLayout>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
