import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
    <div className="board-layout">
      <Sidebar />
      <div className="board-main">
        <Header />
        <div className="board-content">
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
  return (
    <div className="board-layout">
      <Sidebar />
      <div className="flex-1 h-screen overflow-y-auto bg-slate-50 min-w-0">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const initCloudSync   = useBoardStore((s) => s.initCloudSync);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initTheme       = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    if (isAuthenticated) {
      initCloudSync();
    }
  }, [initCloudSync, isAuthenticated, initTheme]);

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
