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
      isLoadingTasks: false,

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

        set({ isLoadingTasks: true });
        // 1. Fetch remote tasks
        const remoteTasks = await fetchTasksFromSupabase();
        if (remoteTasks !== null) {
          set({ tasks: remoteTasks, isCloudSynced: true });
        }
        set({ isLoadingTasks: false });

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

          const mkLog = (field, action, before, after) => ({
            id: `al-${Date.now()}-${Math.random()}`,
            actor: currentActor,
            field,
            action,
            before: before ?? null,
            after: after ?? null,
            createdAt: now,
          });

          if (updates.status && updates.status !== task.status) {
            const oldLabel = COLUMNS.find((c) => c.id === task.status)?.title || task.status;
            const newLabel = COLUMNS.find((c) => c.id === updates.status)?.title || updates.status;
            logs.unshift(mkLog("Status", "changed status", oldLabel, newLabel));
          }
          if (updates.priority && updates.priority !== task.priority) {
            logs.unshift(mkLog("Priority", "changed priority", task.priority?.toUpperCase(), updates.priority.toUpperCase()));
          }
          if (updates.assignee && updates.assignee.id !== task.assignee?.id) {
            logs.unshift(mkLog("Assignee", "reassigned task", task.assignee?.name || "Unassigned", updates.assignee.name));
          }
          if (updates.reporter && updates.reporter.id !== task.reporter?.id) {
            logs.unshift(mkLog("Reporter", "changed reporter", task.reporter?.name || "None", updates.reporter.name));
          }
          if (updates.title && updates.title !== task.title) {
            logs.unshift(mkLog("Title", "updated title", task.title, updates.title));
          }
          if (updates.description !== undefined && updates.description !== task.description) {
            logs.unshift(mkLog("Description", "updated description", task.description || "(empty)", updates.description || "(empty)"));
          }
          if (updates.commentList && updates.commentList.length > (task.commentList?.length || 0)) {
            const lastComment = updates.commentList[updates.commentList.length - 1];
            logs.unshift(mkLog("Comment", "posted a comment", null, lastComment.content));
          }
          if (updates.checklist && Array.isArray(updates.checklist)) {
            const oldLen = task.checklist?.length || 0;
            if (updates.checklist.length > oldLen) {
              const newestItem = updates.checklist[updates.checklist.length - 1];
              logs.unshift(mkLog("Checklist", "added checklist item", null, `"${newestItem.title}"`));
            } else if (updates.checklist.length === oldLen) {
              const changed = updates.checklist.find((ni, i) => ni.completed !== (task.checklist[i]?.completed));
              if (changed) {
                logs.unshift(mkLog("Checklist", `marked item ${changed.completed ? "complete" : "incomplete"}`, changed.completed ? "☐ Open" : "☑ Done", changed.completed ? "☑ Done" : "☐ Open"));
              }
            } else {
              logs.unshift(mkLog("Checklist", "removed checklist item", `${oldLen} items`, `${updates.checklist.length} items`));
            }
          }
          if (updates.attachmentsList && Array.isArray(updates.attachmentsList)) {
            const oldLen = task.attachmentsList?.length || 0;
            if (updates.attachmentsList.length > oldLen) {
              const f = updates.attachmentsList[0];
              logs.unshift(mkLog("Attachment", "attached file", null, f.name));
            } else if (updates.attachmentsList.length < oldLen) {
              logs.unshift(mkLog("Attachment", "removed attachment", `${oldLen} files`, `${updates.attachmentsList.length} files`));
            }
          }
          if (updates.cycleId && updates.cycleId !== task.cycleId) {
            const oldC = CYCLES.find((c) => c.id === task.cycleId)?.name || task.cycleId || "None";
            const newC = CYCLES.find((c) => c.id === updates.cycleId)?.name || updates.cycleId;
            logs.unshift(mkLog("Cycle", "changed sprint cycle", oldC, newC));
          }
          if (updates.epicId && updates.epicId !== task.epicId) {
            logs.unshift(mkLog("Epic", "changed epic", task.epicId || "None", updates.epicId));
          }
          if (updates.lob && updates.lob !== task.lob) {
            logs.unshift(mkLog("LOB Domain", "changed LOB domain", task.lob || "None", updates.lob));
          }
          if (updates.pi && updates.pi !== task.pi) {
            logs.unshift(mkLog("PI", "changed program increment", task.pi || "None", updates.pi));
          }
          if (updates.fixVersion && updates.fixVersion !== task.fixVersion) {
            logs.unshift(mkLog("Fix Version", "changed fix version", task.fixVersion || "None", updates.fixVersion));
          }
          if (updates.dueDate && updates.dueDate !== task.dueDate) {
            logs.unshift(mkLog("Due Date", "changed due date", task.dueDate || "None", updates.dueDate));
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

      duplicateTask: (id) => {
        const now = new Date().toISOString();
        const tasks = get().tasks;
        const taskToDuplicate = tasks.find((t) => t.id === id);
        if (!taskToDuplicate) return null;

        const count = tasks.length + 1;
        const newId = `task-${Date.now()}`;
        const duplicatedTask = {
          ...taskToDuplicate,
          id: newId,
          ticketKey: `BSL-${100 + count}`,
          title: `${taskToDuplicate.title} (Copy)`,
          createdAt: now,
          updatedAt: now,
          commentList: [],
          comments: 0,
          checklist: (taskToDuplicate.checklist || []).map((item) => ({
            ...item,
            id: `item-${Date.now()}-${Math.random()}`,
            completed: false,
          })),
          activityLog: [
            {
              id: `al-${Date.now()}`,
              actor: TEAM_MEMBERS[0],
              action: `duplicated this task from ${taskToDuplicate.ticketKey || taskToDuplicate.title}`,
              createdAt: now,
            },
          ],
        };

        set((s) => ({ tasks: [...s.tasks, duplicatedTask] }));
        saveTaskToSupabase(duplicatedTask); // Cloud sync
        return newId;
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

      deleteWorklog: (taskId, worklogId) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;
          const wl = task.tempo?.worklogs?.find((w) => w.id === worklogId);
          const removedHours = wl?.hours || 0;
          const updatedWorklogs = (task.tempo?.worklogs || []).filter((w) => w.id !== worklogId);
          const newLogged = Math.max(0, (task.tempo?.loggedHours || 0) - removedHours);
          const newRemaining = Math.max(0, (task.tempo?.estimatedHours || 0) - newLogged);
          const updatedTempo = { ...task.tempo, loggedHours: newLogged, remainingHours: newRemaining, worklogs: updatedWorklogs };
          const updatedLog = [
            { id: `al-${Date.now()}`, actor: TEAM_MEMBERS[0], field: "Worklog", action: "deleted worklog entry", before: `${removedHours}h`, after: null, createdAt: now },
            ...(task.activityLog || []),
          ];
          const updates = { tempo: updatedTempo, activityLog: updatedLog, updatedAt: now };
          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            selectedTask: s.selectedTask?.id === taskId ? { ...s.selectedTask, ...updates } : s.selectedTask,
          };
        });
      },

      editWorklog: (taskId, worklogId, patch) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;
          const oldWl = task.tempo?.worklogs?.find((w) => w.id === worklogId);
          const updatedWorklogs = (task.tempo?.worklogs || []).map((w) =>
            w.id === worklogId ? { ...w, ...patch } : w
          );
          const totalLogged = updatedWorklogs.reduce((sum, w) => sum + (w.hours || 0), 0);
          const newRemaining = Math.max(0, (task.tempo?.estimatedHours || 0) - totalLogged);
          const updatedTempo = { ...task.tempo, loggedHours: totalLogged, remainingHours: newRemaining, worklogs: updatedWorklogs };
          const updatedLog = [
            { id: `al-${Date.now()}`, actor: TEAM_MEMBERS[0], field: "Worklog", action: "edited worklog entry", before: `${oldWl?.hours}h – ${oldWl?.note || oldWl?.category}`, after: `${patch.hours ?? oldWl?.hours}h – ${patch.note ?? oldWl?.note ?? patch.category ?? oldWl?.category}`, createdAt: now },
            ...(task.activityLog || []),
          ];
          const updates = { tempo: updatedTempo, activityLog: updatedLog, updatedAt: now };
          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            selectedTask: s.selectedTask?.id === taskId ? { ...s.selectedTask, ...updates } : s.selectedTask,
          };
        });
      },

      deleteComment: (taskId, commentId) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;
          const comment = task.commentList?.find((c) => c.id === commentId);
          const updatedList = (task.commentList || []).filter((c) => c.id !== commentId);
          const updatedLog = [
            { id: `al-${Date.now()}`, actor: TEAM_MEMBERS[0], field: "Comment", action: "deleted a comment", before: comment?.content || null, after: null, createdAt: now },
            ...(task.activityLog || []),
          ];
          const updates = { commentList: updatedList, comments: updatedList.length, activityLog: updatedLog, updatedAt: now };
          return {
            tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            selectedTask: s.selectedTask?.id === taskId ? { ...s.selectedTask, ...updates } : s.selectedTask,
          };
        });
      },

      editComment: (taskId, commentId, newContent) => {
        const now = new Date().toISOString();
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;
          const oldComment = task.commentList?.find((c) => c.id === commentId);
          const updatedList = (task.commentList || []).map((c) =>
            c.id === commentId ? { ...c, content: newContent, editedAt: now } : c
          );
          const updatedLog = [
            { id: `al-${Date.now()}`, actor: TEAM_MEMBERS[0], field: "Comment", action: "edited a comment", before: oldComment?.content || null, after: newContent, createdAt: now },
            ...(task.activityLog || []),
          ];
          const updates = { commentList: updatedList, activityLog: updatedLog, updatedAt: now };
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
