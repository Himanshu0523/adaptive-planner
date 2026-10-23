export const TASK_STATUS = ["todo", "in_progress", "blocked", "done", "cancelled"];



export const TASK_TRANSITIONS = {
    todo: ["in_progress", "cancelled"],
    in_progress: ["blocked", "done", "cancelled"],
    blocked: ["in_progress", "cancelled"],
    done: ["in_progress"],
    cancelled: ["todo"],
};


export function canTransition(from, to) {
    return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}


export function nextStatus(current) {
    if (current === "todo") return "in_progress";
    if (current === "in_progress") return "done";
    if (current === "done") return "todo";
    return current;
}


export const STATUS_LABELS = {
    todo: "To do",
    in_progress: "In progress",
    blocked: "Blocked",
    done: "Done",
    cancelled: "Cancelled",
};


export const STATUS_STYLES = {
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    blocked: "bg-amber-100 text-amber-800",
    done: "bg-green-100 text-green-700",
    cancelled: "bg-slate-100 text-slate-500 line-through",
};