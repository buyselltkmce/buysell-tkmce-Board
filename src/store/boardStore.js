import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { INITIAL_TASKS, EPICS, TEAM_MEMBERS, COLUMNS, CYCLES } from "../data/constants";
import {
  fetchTasksFromSupabase,
  saveTaskToSupabase,
  updateTaskInSupabase,
  deleteTaskFromSupabase,
  subscribeToSupabaseRealtime,
} from "../services/taskService";
import { isSupabaseConfigured, supabase } from "../services/supabase";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const DEFAULT_FILTERS = {
  search: "",
  priorities: [],
  assignees: [],
  labels: [],
  cycleId: "all",
  sortBy: "updatedAt",
};

export const useBoardStore = create(
  persist(
    (set, get) => ({
      tasks: INITIAL_TASKS,
      epics: EPICS,
      filters: DEFAULT_FILTERS,
      viewMode: "list",
      selectedTask: null,
      isModalOpen: false,
      isCreateModalOpen: false,
      createTaskStatus: null,
      isCloudSynced: isSupabaseConfigured,

      updateEpic: (epicId, updates) => {
        set((s) => ({
          epics: (s.epics || EPICS).map((e) =>
            e.id === epicId ? { ...e, ...updates } : e
          ),
        }));
      },

      // ── Cloud Sync Initialization ──────────────────────
      initCloudSync: async () => {
        if (!isSupabaseConfigured) return;

        // 1. Fetch remote tasks
        const remoteTasks = await fetchTasksFromSupabase();
        if (remoteTasks !== null) {
          set({ tasks: remoteTasks, isCloudSynced: true });
        }

        // 2. Subscribe to real-time changes
        subscribeToSupabaseRealtime((event, task) => {
          if (event === "UPSERT") {
            set((s) => {
              const exists = s.tasks.some((t) => t.id === task.id);
              return {
                tasks: exists
                  ? s.tasks.map((t) => (t.id === task.id ? { ...t, ...task } : t))
                  : [...s.tasks, task],
              };
            });
          } else if (event === "DELETE") {
            set((s) => ({ tasks: s.tasks.filter((t) => t.id !== task.id) }));
          }
        });
      },

      // ── Actions ───────────────────────────────────────
      addTask: (taskData, actorInfo) => {
        const now = new Date().toISOString();
        const count = get().tasks.length + 1;
        const currentActor = actorInfo || TEAM_MEMBERS[0];
        const initialLog = [
          {
            id: `al-${Date.now()}`,
            actor: currentActor,
            action: "created this task",
            createdAt: now,
          },
        ];

        const newTask = {
          ticketKey: `BSL-${100 + count}`,
          epicId: taskData.epicId || "BSL-EPIC-1",
          cycleId: taskData.cycleId || "cycle-3",
          checklist: [],
          commentList: [],
          ...taskData,
          activityLog: taskData.activityLog?.length ? taskData.activityLog : initialLog,
          id: `task-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };

        set((s) => ({ tasks: [...s.tasks, newTask] }));
        saveTaskToSupabase(newTask); // Cloud sync
      },

      updateTask: (id, updates, actorInfo) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === id);
          if (!task) return s;

          const currentActor = actorInfo || TEAM_MEMBERS[0];
          const logs = [...(task.activityLog || [])];

          // Auto-generate activity logs for updates
          if (updates.status && updates.status !== task.status) {
            const oldCol = COLUMNS.find((c) => c.id === task.status)?.title || task.status;
            const newCol = COLUMNS.find((c) => c.id === updates.status)?.title || updates.status;
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `changed status from "${oldCol}" to "${newCol}"`,
              createdAt: now,
            });
          }
          if (updates.priority && updates.priority !== task.priority) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `changed priority to "${updates.priority.toUpperCase()}"`,
              createdAt: now,
            });
          }
          if (updates.assignee && updates.assignee.id !== task.assignee?.id) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `reassigned task to ${updates.assignee.name}`,
              createdAt: now,
            });
          }
          if (updates.title && updates.title !== task.title) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `updated title to "${updates.title}"`,
              createdAt: now,
            });
          }
          if (updates.description !== undefined && updates.description !== task.description) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `updated task description & specifications`,
              createdAt: now,
            });
          }
          if (updates.commentList && updates.commentList.length > (task.commentList?.length || 0)) {
            const lastComment = updates.commentList[updates.commentList.length - 1];
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: lastComment.author || currentActor,
              action: `posted a comment: "${lastComment.content.length > 35 ? lastComment.content.slice(0, 35) + '...' : lastComment.content}"`,
              createdAt: now,
            });
          }
          if (updates.checklist && Array.isArray(updates.checklist)) {
            const oldLen = task.checklist?.length || 0;
            if (updates.checklist.length > oldLen) {
              const newestItem = updates.checklist[updates.checklist.length - 1];
              logs.unshift({
                id: `al-${Date.now()}-${Math.random()}`,
                actor: currentActor,
                action: `added checklist item "${newestItem.title}"`,
                createdAt: now,
              });
            } else if (updates.checklist.length === oldLen) {
              logs.unshift({
                id: `al-${Date.now()}-${Math.random()}`,
                actor: currentActor,
                action: `updated checklist completion status`,
                createdAt: now,
              });
            }
          }
          if (updates.attachmentsList && Array.isArray(updates.attachmentsList)) {
            const oldLen = task.attachmentsList?.length || 0;
            if (updates.attachmentsList.length > oldLen) {
              const newestFile = updates.attachmentsList[0];
              logs.unshift({
                id: `al-${Date.now()}-${Math.random()}`,
                actor: currentActor,
                action: `attached file "${newestFile.name}"`,
                createdAt: now,
              });
            } else if (updates.attachmentsList.length < oldLen) {
              logs.unshift({
                id: `al-${Date.now()}-${Math.random()}`,
                actor: currentActor,
                action: `removed an attachment file`,
                createdAt: now,
              });
            }
          }
          if (updates.cycleId && updates.cycleId !== task.cycleId) {
            const cycleName = CYCLES.find((c) => c.id === updates.cycleId)?.name || updates.cycleId;
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `moved task to ${cycleName}`,
              createdAt: now,
            });
          }
          if (updates.lob && updates.lob !== task.lob) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `updated LOB Domain to ${updates.lob}`,
              createdAt: now,
            });
          }
          if (updates.pi && updates.pi !== task.pi) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `updated Program Increment to ${updates.pi}`,
              createdAt: now,
            });
          }
          if (updates.fixVersion && updates.fixVersion !== task.fixVersion) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `updated Fix Version to ${updates.fixVersion}`,
              createdAt: now,
            });
          }
          if (updates.dueDate && updates.dueDate !== task.dueDate) {
            logs.unshift({
              id: `al-${Date.now()}-${Math.random()}`,
              actor: currentActor,
              action: `updated due date to ${updates.dueDate}`,
              createdAt: now,
            });
          }

          const updatedTask = {
            ...task,
            ...updates,
            activityLog: logs,
            updatedAt: now,
          };

          return {
            tasks: s.tasks.map((t) => (t.id === id ? updatedTask : t)),
            selectedTask: s.selectedTask?.id === id ? updatedTask : s.selectedTask,
          };
        });
        updateTaskInSupabase(id, updates); // Cloud sync
      },

      deleteTask: (id) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          isModalOpen: s.selectedTask?.id === id ? false : s.isModalOpen,
          selectedTask: s.selectedTask?.id === id ? null : s.selectedTask,
        }));
        deleteTaskFromSupabase(id); // Cloud sync
      },

      moveTask: (taskId, newStatus, actorInfo) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;

          const currentActor = actorInfo || TEAM_MEMBERS[0];
          const oldCol = COLUMNS.find((c) => c.id === task.status)?.title || task.status;
          const newCol = COLUMNS.find((c) => c.id === newStatus)?.title || newStatus;

          const newLog = {
            id: `al-${Date.now()}`,
            actor: currentActor,
            action: `moved status from "${oldCol}" to "${newCol}"`,
            createdAt: now,
          };

          const updatedTask = {
            ...task,
            status: newStatus,
            activityLog: [newLog, ...(task.activityLog || [])],
            updatedAt: now,
          };

          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
            selectedTask: s.selectedTask?.id === taskId ? updatedTask : s.selectedTask,
          };
        });
        updateTaskInSupabase(taskId, { status: newStatus }); // Cloud sync
      },

      logWorkTime: (taskId, { hours, category, note, date, author }) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;

          const currentTempo = task.tempo || {
            estimatedHours: task.estimatedHours || 10,
            loggedHours: 0,
            remainingHours: task.estimatedHours || 10,
            worklogs: [],
          };

          const newLogged = currentTempo.loggedHours + hours;
          const newRemaining = Math.max(0, currentTempo.estimatedHours - newLogged);
          const newWorklog = {
            id: `wl-${Date.now()}`,
            author: author || { id: "u1", name: "You", avatar: "YO", color: "#2563EB" },
            hours,
            category: category || "Development",
            date: date || new Date().toISOString().split("T")[0],
            note: note || "",
          };

          const updatedTempo = {
            ...currentTempo,
            loggedHours: newLogged,
            remainingHours: newRemaining,
            worklogs: [newWorklog, ...currentTempo.worklogs],
          };

          const updatedLog = [
            {
              id: `al-${Date.now()}`,
              actor: author || { id: "u1", name: "You", avatar: "YO", color: "#2563EB" },
              action: `logged ${hours}h (${category})${note ? `: "${note}"` : ""}`,
              createdAt: now,
            },
            ...(task.activityLog || []),
          ];

          const updates = { tempo: updatedTempo, activityLog: updatedLog, updatedAt: now };

          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            selectedTask: s.selectedTask?.id === taskId ? { ...s.selectedTask, ...updates } : s.selectedTask,
          };
        });
      },

      addLinkedTask: (taskId, targetTask, relationship) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;

          const existingLinks = task.linkedTasks || [];
          if (existingLinks.some((l) => l.id === targetTask.id)) return s;

          const newLink = {
            id: targetTask.id,
            ticketKey: targetTask.ticketKey,
            title: targetTask.title,
            relationship,
            status: targetTask.status,
            assignee: targetTask.assignee,
          };

          const updatedLinks = [...existingLinks, newLink];
          const updatedLog = [
            {
              id: `al-${Date.now()}`,
              actor: TEAM_MEMBERS[0],
              action: `linked work item ${targetTask.ticketKey || targetTask.title} (${relationship})`,
              createdAt: now,
            },
            ...(task.activityLog || []),
          ];
          const updates = { linkedTasks: updatedLinks, activityLog: updatedLog, updatedAt: now };

          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            selectedTask: s.selectedTask?.id === taskId ? { ...s.selectedTask, ...updates } : s.selectedTask,
          };
        });
      },

      removeLinkedTask: (taskId, targetTaskId) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;

          const updatedLinks = (task.linkedTasks || []).filter((l) => l.id !== targetTaskId);
          const updatedLog = [
            {
              id: `al-${Date.now()}`,
              actor: TEAM_MEMBERS[0],
              action: `removed linked work item ${targetTaskId}`,
              createdAt: now,
            },
            ...(task.activityLog || []),
          ];
          const updates = { linkedTasks: updatedLinks, activityLog: updatedLog, updatedAt: now };

          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            selectedTask: s.selectedTask?.id === taskId ? { ...s.selectedTask, ...updates } : s.selectedTask,
          };
        });
      },

      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
      setViewMode: (mode) => set({ viewMode: mode }),

      clearAllTasks: async () => {
        set({ tasks: [], selectedTask: null, isModalOpen: false });
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
          } catch (err) {
            console.error("Failed to clear Supabase tasks:", err);
          }
        }
      },

      openTaskModal: (task) => set({ selectedTask: task, isModalOpen: true }),
      closeTaskModal: () => set({ isModalOpen: false, selectedTask: null }),
      openCreateModal: (status = "ba_requirements") => set({ isCreateModalOpen: true, createTaskStatus: status }),
      closeCreateModal: () => set({ isCreateModalOpen: false, createTaskStatus: null }),

      // ── Computed ──────────────────────────────────────
      getFilteredTasks: (status) => {
        const { tasks, filters } = get();
        let list = status ? tasks.filter((t) => t.status === status) : [...tasks];

        if (filters.cycleId && filters.cycleId !== "all") {
          list = list.filter((t) => t.cycleId === filters.cycleId);
        }

        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              t.labels.some((l) => l.toLowerCase().includes(q))
          );
        }
        if (filters.priorities.length) list = list.filter((t) => filters.priorities.includes(t.priority));
        if (filters.assignees.length)  list = list.filter((t) => filters.assignees.includes(t.assignee.id));
        if (filters.labels.length)     list = list.filter((t) => filters.labels.some((l) => t.labels.includes(l)));

        list.sort((a, b) => {
          switch (filters.sortBy) {
            case "dueDate":      return new Date(a.dueDate) - new Date(b.dueDate);
            case "priority":     return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
            case "updatedAt":    return new Date(b.updatedAt) - new Date(a.updatedAt);
            case "alphabetical": return a.title.localeCompare(b.title);
            default:             return 0;
          }
        });
        return list;
      },

      resetEpics: () => set({ epics: EPICS }),

      getAllTasks: () => {
        return get().getFilteredTasks(null);
      },
    }),
    {
      name: "buysell-board-v4",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ tasks: state.tasks, epics: state.epics }),
      merge: (persistedState, currentState) => {
        const storedEpics = persistedState?.epics || [];
        const mergedEpics = EPICS.map((defaultEpic) => {
          const found = storedEpics.find((e) => e.id === defaultEpic.id);
          return found ? { ...defaultEpic, ...found } : defaultEpic;
        });
        return {
          ...currentState,
          ...persistedState,
          epics: mergedEpics.length ? mergedEpics : EPICS,
        };
      },
    }
  )
);
