"use client";


import { Check , Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { 
    STATUS_LABELS, STATUS_STYLES, nextStatus, canTransition,
} from "../lib/task-status";
import { useChangeTaskStatus , useDeleteTask } from "../hooks/use-tasks";


export function TaskRow({ task }) {
    const changeStatus = useChangeTaskStatus();
    const deleteTask = useDeleteTask();

    const next = nextStatus(task.status);
    const canAdvance = canTransition(task.status, next);
    const isDone = task.status === "done";

    return (
        <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3">
        <button
            type="button"
            aria-label={isDone ? "Mark as to do" : "Mark as done"}
            disabled={!canAdvance || changeStatus.isPending}
            onClick={() => changeStatus.mutate({ id: task.id, status: next })}
            className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
            isDone
                ? "border-green-600 bg-green-600 text-white"
                : "border-slate-300 hover:border-brand-500"
            )}
        >
            {isDone && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
        <p
            className={cn(
                "truncate text-sm font-medium",
                isDone ? "text-slate-400 line-through" : "text-slate-900"
            )}
        >
            {task.title}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        <span
                className={cn(
                "rounded-full px-2 py-0.5 font-medium",
                STATUS_STYLES[task.status]
                )}
        >
                {STATUS_LABELS[task.status]}
        </span>
        {task.dueDate && (
                <span className="text-slate-500">Due {task.dueDate}</span>
            )}
        {task.estimatedMinutes != null && (
                <span className="text-slate-500">~{task.estimatedMinutes}m</span>
            )}
        </div>
        </div>

        <Button
            variant="ghost"
            size="sm"
            aria-label="Delete task"
            onClick={() => deleteTask.mutate(task.id)}
            disabled={deleteTask.isPending}
        >
        <Trash2 className="h-4 w-4" />
        </Button>
    </div>
    )
}