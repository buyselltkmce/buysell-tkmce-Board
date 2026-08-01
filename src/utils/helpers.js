export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDueDate(dateStr) {
  const due = new Date(dateStr);
  const now = new Date();
  const days = Math.ceil((due - now) / 86400000);
  if (days < 0)  return { label: `${Math.abs(days)}d overdue`, color: "text-red-600", isOverdue: true };
  if (days === 0) return { label: "Due today",    color: "text-orange-600", isOverdue: false };
  if (days === 1) return { label: "Due tomorrow", color: "text-orange-500", isOverdue: false };
  if (days <= 3)  return { label: `Due in ${days}d`, color: "text-yellow-600", isOverdue: false };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    color: "text-slate-500",
    isOverdue: false,
  };
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
