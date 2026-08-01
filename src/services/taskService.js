import { supabase, isSupabaseConfigured } from "./supabase";

// Convert Supabase DB column names to App task object schema
function formatTaskFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    status: row.status,
    priority: row.priority,
    cycleId: row.cycle_id || "cycle-2",
    labels: row.labels || [],
    assignee: row.assignee,
    dueDate: row.due_date,
    estimatedHours: Number(row.estimated_hours || 0),
    attachments: Number(row.attachments || 0),
    comments: Number(row.comments || 0),
    progress: Number(row.progress || 0),
    checklist: row.checklist || [],
    commentList: row.comment_list || [],
    activityLog: row.activity_log || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert App task object schema to Supabase DB column names
function formatTaskToDb(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    cycle_id: task.cycleId || "cycle-2",
    labels: task.labels,
    assignee: task.assignee,
    due_date: task.dueDate,
    estimated_hours: task.estimatedHours,
    attachments: task.attachments,
    comments: task.comments,
    progress: task.progress,
    checklist: task.checklist,
    comment_list: task.commentList,
    activity_log: task.activityLog,
    updated_at: new Date().toISOString(),
  };
}

// ── CRUD Operations ───────────────────────────────────

export async function fetchTasksFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) {
      console.warn("Supabase fetch warning:", error.message);
      return null;
    }
    return data.map(formatTaskFromDb);
  } catch (err) {
    console.error("Supabase fetch failed:", err);
    return null;
  }
}

export async function saveTaskToSupabase(task) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const dbTask = formatTaskToDb(task);
    const { error } = await supabase.from("tasks").upsert([dbTask]);
    if (error) console.error("Supabase save error:", error.message);
  } catch (err) {
    console.error("Supabase save failed:", err);
  }
}

export async function updateTaskInSupabase(id, updates) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const payload = {};
    if (updates.title !== undefined)          payload.title = updates.title;
    if (updates.description !== undefined)    payload.description = updates.description;
    if (updates.status !== undefined)         payload.status = updates.status;
    if (updates.priority !== undefined)       payload.priority = updates.priority;
    if (updates.cycleId !== undefined)        payload.cycle_id = updates.cycleId;
    if (updates.labels !== undefined)         payload.labels = updates.labels;
    if (updates.assignee !== undefined)       payload.assignee = updates.assignee;
    if (updates.dueDate !== undefined)        payload.due_date = updates.dueDate;
    if (updates.estimatedHours !== undefined) payload.estimated_hours = updates.estimatedHours;
    if (updates.checklist !== undefined)      payload.checklist = updates.checklist;
    if (updates.commentList !== undefined)    payload.comment_list = updates.commentList;
    if (updates.comments !== undefined)       payload.comments = updates.comments;
    if (updates.progress !== undefined)       payload.progress = updates.progress;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from("tasks").update(payload).eq("id", id);
    if (error) console.error("Supabase update error:", error.message);
  } catch (err) {
    console.error("Supabase update failed:", err);
  }
}

export async function deleteTaskFromSupabase(id) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) console.error("Supabase delete error:", error.message);
  } catch (err) {
    console.error("Supabase delete failed:", err);
  }
}

// ── Realtime WebSocket Subscription ───────────────────
export function subscribeToSupabaseRealtime(onTaskChange) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel(`tasks-realtime-${Date.now()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          onTaskChange("UPSERT", formatTaskFromDb(payload.new));
        } else if (payload.eventType === "DELETE") {
          onTaskChange("DELETE", { id: payload.old.id });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
