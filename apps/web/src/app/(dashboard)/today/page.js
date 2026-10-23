"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  CalendarDays,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button, Input } from "@/components/ui";
import {
  useTodayTasks,
  useCreateTask,
  useChangeTaskStatus,
  useUpdateTask,
} from "@/features/tasks";
import { useGoals } from "@/features/goals";
import { ExecutionTaskCard } from "@/features/tasks/components/ExecutionTaskCard";
import { TaskSkipDialog } from "@/features/tasks/components/TaskSkipDialog";
import { TaskBlockerDialog } from "@/features/tasks/components/TaskBlockerDialog";
import { TaskReflectionDialog } from "@/features/tasks/components/TaskReflectionDialog";
import { Skeleton, EmptyState } from "@/components/feedback";

export default function TodayPage() {
  const todayDate = new Date();
  const todayFormatted = format(todayDate, "EEEE, MMMM do");
  const todayStr = format(todayDate, "yyyy-MM-dd");

  const { data: tasks, isLoading, isError, error } = useTodayTasks(todayStr);
  const { data: goals } = useGoals();
  const createTask = useCreateTask();
  const changeStatus = useChangeTaskStatus();
  const updateTask = useUpdateTask();

  // Dialog State
  const [skipTargetTask, setSkipTargetTask] = useState(null);
  const [blockTargetTask, setBlockTargetTask] = useState(null);
  const [completeTargetTask, setCompleteTargetTask] = useState(null);

  // Quick Task Add Input
  const [quickTitle, setQuickTitle] = useState("");
  const [quickMinutes, setQuickMinutes] = useState("30");
  const [isAdding, setIsAdding] = useState(false);

  // Running Active Timer for in_progress task
  const [activeSeconds, setActiveSeconds] = useState(0);
  const activeTask = (tasks || []).find((t) => t.status === "in_progress");

  useEffect(() => {
    if (!activeTask) return;
    const interval = setInterval(() => {
      setActiveSeconds((s) => s + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      setActiveSeconds(0);
    };
  }, [activeTask]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // State Machine Handlers
  const handleStart = (taskId) => {
    changeStatus.mutate({ id: taskId, status: "in_progress" });
  };

  const handlePause = (taskId) => {
    changeStatus.mutate({ id: taskId, status: "todo" });
  };

  const handleCompleteRequest = (taskId) => {
    const target = (tasks || []).find((t) => t.id === taskId);
    setCompleteTargetTask(target);
  };

  const handleConfirmComplete = (taskId, { actualMinutes, notes }) => {
    changeStatus.mutate(
      { id: taskId, status: "done" },
      {
        onSuccess: () => {
          if (actualMinutes || notes) {
            updateTask.mutate({ id: taskId, notes });
          }
          setCompleteTargetTask(null);
        },
      }
    );
  };

  const handlePartialProgress = (taskId) => {
    updateTask.mutate({
      id: taskId,
      notes: "Partial session logged. Remaining focus will resume later.",
    });
    changeStatus.mutate({ id: taskId, status: "todo" });
  };

  const handleSkipRequest = (task) => {
    setSkipTargetTask(task);
  };

  const handleConfirmSkip = (taskId, choice) => {
    if (choice === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updateTask.mutate({
        id: taskId,
        dueDate: format(tomorrow, "yyyy-MM-dd"),
      });
    } else if (choice === "unscheduled") {
      updateTask.mutate({
        id: taskId,
        dueDate: null,
      });
    }
    setSkipTargetTask(null);
  };

  const handleBlockRequest = (task) => {
    setBlockTargetTask(task);
  };

  const handleConfirmBlocker = (taskId, reason, resolution) => {
    updateTask.mutate({
      id: taskId,
      notes: `[Blocked]: ${reason}${resolution ? ` • Resolution: ${resolution}` : ""}`,
    });
    changeStatus.mutate({ id: taskId, status: "blocked" });
    setBlockTargetTask(null);
  };

  const handleReopen = (taskId) => {
    changeStatus.mutate({ id: taskId, status: "todo" });
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const fallbackGoalId = goals?.[0]?.id || "goal-1";
    createTask.mutate(
      {
        goalId: fallbackGoalId,
        title: quickTitle.trim(),
        estimatedMinutes: Number(quickMinutes) || 30,
        dueDate: todayStr,
      },
      {
        onSuccess: () => {
          setQuickTitle("");
          setIsAdding(false);
        },
      }
    );
  };

  // Human Non-judgmental Calculation
  const totalTasks = (tasks || []).length;
  const completedCount = (tasks || []).filter((t) => t.status === "done").length;
  const inProgressCount = (tasks || []).filter((t) => t.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Execution Mode
          </span>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Today — {todayFormatted}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            What should I do today? Take action in focused blocks without multitasking.
          </p>
        </div>

        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task for Today</span>
        </Button>
      </div>

      {/* Non-judgmental Progress Summary Bar */}
      <div className="rounded-xl border border-[#E7E5E0] bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {completedCount}/{totalTasks}
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-900">
              {totalTasks === 0
                ? "No tasks planned yet."
                : completedCount === totalTasks
                ? "You completed all planned tasks today!"
                : `You completed ${completedCount} of ${totalTasks} planned tasks today.`}
            </p>
            <p className="text-[11px] text-stone-500">
              {inProgressCount > 0
                ? "1 task session currently in progress."
                : "Remember: Steady pacing is better than rushing."}
            </p>
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="w-full sm:w-48 bg-[#F3F2EE] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2D5A43] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.round((completedCount / totalTasks) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Active Session Running Timer Banner */}
      {activeTask && (
        <div className="rounded-2xl border border-[#2D5A43] bg-gradient-to-r from-[#F2F7F4] via-white to-[#F2F7F4] p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#2D5A43] animate-ping" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2D5A43] tracking-wider block">
                  Active Focus Session
                </span>
                <h3 className="text-base font-bold text-stone-900">{activeTask.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 font-mono text-lg font-bold text-[#2D5A43] bg-white px-3 py-1 rounded-xl border border-[#C6DDD1]">
                <Clock className="h-4 w-4" />
                <span>{formatTimer(activeSeconds)}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePause(activeTask.id)}
                className="text-xs flex items-center gap-1"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </Button>
              <Button
                size="sm"
                onClick={() => handleCompleteRequest(activeTask.id)}
                className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Finish</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Inline Form */}
      {isAdding && (
        <Card className="border-[#C6DDD1] bg-[#F2F7F4]/60">
          <CardBody className="p-4">
            <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="What task would you like to accomplish today?"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1 bg-white"
                required
                autoFocus
              />
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1 text-xs text-stone-600 bg-white px-3 py-2 rounded-xl border border-[#E7E5E0]">
                  <span>~</span>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={quickMinutes}
                    onChange={(e) => setQuickMinutes(e.target.value)}
                    className="w-10 text-right font-medium focus:outline-none"
                  />
                  <span>m</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={createTask.isPending || !quickTitle.trim()} className="text-xs">
                  Add to Today
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={CalendarDays}
            title="Couldn't load today's schedule"
            description={error?.message || "There was an error retrieving tasks."}
          />
        ) : (tasks || []).length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing planned yet. Add a task or create a plan."
            description="Your Today list gives you a peaceful single point of execution. Add an action step above or select from your active goals."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button onClick={() => setIsAdding(true)} className="text-xs flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span>Add task for today</span>
                </Button>
                <Link href="/goals">
                  <Button variant="outline" className="text-xs flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#2D5A43]" />
                    <span>Create New Goal Plan</span>
                  </Button>
                </Link>
              </div>
            }
          />
        ) : (
          (tasks || []).map((task) => {
            const relatedGoal = (goals || []).find((g) => g.id === task.goalId);
            return (
              <ExecutionTaskCard
                key={task.id}
                task={task}
                goalTitle={relatedGoal?.title}
                onStart={handleStart}
                onPause={handlePause}
                onComplete={handleCompleteRequest}
                onPartialProgress={handlePartialProgress}
                onSkip={handleSkipRequest}
                onBlock={handleBlockRequest}
                onReopen={handleReopen}
              />
            );
          })
        )}
      </div>

      {/* Modals & Dialogs */}
      <TaskSkipDialog
        isOpen={Boolean(skipTargetTask)}
        task={skipTargetTask}
        onClose={() => setSkipTargetTask(null)}
        onConfirmSkip={handleConfirmSkip}
      />

      <TaskBlockerDialog
        isOpen={Boolean(blockTargetTask)}
        task={blockTargetTask}
        onClose={() => setBlockTargetTask(null)}
        onConfirmBlocker={handleConfirmBlocker}
      />

      <TaskReflectionDialog
        isOpen={Boolean(completeTargetTask)}
        task={completeTargetTask}
        onClose={() => setCompleteTargetTask(null)}
        onConfirmComplete={handleConfirmComplete}
      />
    </div>
  );
}