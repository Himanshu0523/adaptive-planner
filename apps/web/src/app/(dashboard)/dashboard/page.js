"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "@/components/ui";
import { useGoals } from "@/features/goals";
import { useTodayTasks } from "@/features/tasks";
import { Skeleton } from "@/components/feedback";
import { PlanningOverheadCard } from "@/features/dashboard/components/PlanningOverheadCard";

export default function DashboardPage() {
  const todayDate = new Date();
  const todayFormatted = format(todayDate, "EEEE, MMMM do").toUpperCase();
  const todayStr = format(todayDate, "yyyy-MM-dd");

  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: tasks, isLoading: tasksLoading } = useTodayTasks(todayStr);

  const activeGoals = (goals || []).filter((g) => g.status === "in_progress");
  const primaryGoal = activeGoals[0] || (goals && goals[0]);

  const plannedTasks = tasks || [];
  const completedTasks = plannedTasks.filter((t) => t.status === "done");
  const inProgressTasks = plannedTasks.filter((t) => t.status === "in_progress");
  const pendingTasks = plannedTasks.filter((t) => t.status !== "done");

  // Recommended single next action
  const focusTask = inProgressTasks[0] || pendingTasks[0] || null;

  const primaryGoalProgress =
    primaryGoal && primaryGoal.totalTasks > 0
      ? Math.round(((primaryGoal.completedTasks || 0) / primaryGoal.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Human-Centered Greeting Header */}
      <div className="space-y-1">
        <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
          {todayFormatted}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Welcome back.
        </h1>
        <p className="text-base text-stone-600 font-normal">
          Let&apos;s make a little progress today.
        </p>
      </div>

      {/* Gentle Advisory Notice (Non-judgmental, Supportive) */}
      <div className="rounded-2xl border border-[#C6DDD1] bg-[#F2F7F4] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-900">
              Adaptive Coach Perspective
            </p>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              {plannedTasks.length > 0
                ? `${pendingTasks.length} task${pendingTasks.length === 1 ? "" : "s"} planned today. Take regular breaks between deep work sessions.`
                : "Your schedule is currently open. Define a goal or add a quick task to build momentum."}
            </p>
          </div>
        </div>
        <Link href="/planner" className="shrink-0 self-start sm:self-auto">
          <Button variant="outline" size="sm" className="text-xs bg-white text-[#2D5A43] border-[#C6DDD1] hover:bg-[#E2EDE7]">
            View Schedule
          </Button>
        </Link>
      </div>

      {/* Hero Focus Card: "Your focus for today" */}
      <Card className="border-[#2D5A43]/20 bg-gradient-to-br from-white via-white to-[#F2F7F4] shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D5A43]/5 rounded-bl-full pointer-events-none" />
        <CardBody className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2EDE7] px-3 py-1 text-xs font-semibold text-[#2D5A43]">
              <Target className="h-3.5 w-3.5" />
              <span>Your focus for today</span>
            </span>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{focusTask ? `Estimated: ${focusTask.estimatedMinutes || 30} minutes` : "Open Schedule"}</span>
            </span>
          </div>

          {focusTask ? (
            <>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  {focusTask.title}
                </h2>
                <p className="text-xs text-stone-500">
                  Part of goal: <span className="font-semibold text-stone-700">{focusTask.goalTitle || primaryGoal?.title || "Daily Priority"}</span>
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/today">
                  <Button className="flex items-center gap-2 px-5 text-xs font-semibold">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Session</span>
                  </Button>
                </Link>
                <Link href="/planner">
                  <Button variant="secondary" className="text-xs">
                    Reschedule gently
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  {plannedTasks.length > 0 && completedTasks.length === plannedTasks.length
                    ? "All tasks completed for today! Great work."
                    : "No focus tasks scheduled for today."}
                </h2>
                <p className="text-xs text-stone-500">
                  {plannedTasks.length > 0 && completedTasks.length === plannedTasks.length
                    ? "You have completed all planned tasks. Relax or prepare for tomorrow."
                    : "Use the Guided Goal Wizard to create a roadmap or add tasks to your schedule."}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link href="/goals">
                  <Button className="flex items-center gap-2 px-5 text-xs font-semibold">
                    <Target className="h-3.5 w-3.5" />
                    <span>Create a Goal</span>
                  </Button>
                </Link>
                <Link href="/today">
                  <Button variant="secondary" className="text-xs">
                    Add Task to Today
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* 3 Core Metric Blocks */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Today's Tasks */}
        <Card>
          <CardBody className="p-5 space-y-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Today&apos;s tasks
            </span>
            {tasksLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-stone-900">
                  {plannedTasks.length}
                </span>
                <span className="text-xs font-medium text-stone-500">
                  Planned ({completedTasks.length} completed)
                </span>
              </div>
            )}
            <p className="text-xs text-stone-500 leading-normal">
              {completedTasks.length === plannedTasks.length && plannedTasks.length > 0
                ? "All tasks completed for today. Enjoy your evening!"
                : `${pendingTasks.length} task${pendingTasks.length === 1 ? "" : "s"} remaining for today.`}
            </p>
          </CardBody>
        </Card>

        {/* Time Available */}
        <Card>
          <CardBody className="p-5 space-y-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Time available
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-stone-900">2h 30m</span>
              <span className="text-xs font-medium text-stone-500">
                Focus window
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-normal">
              Based on your availability preferences & working hours.
            </p>
          </CardBody>
        </Card>

        {/* Your Goals Milestone */}
        <Card>
          <CardBody className="p-5 space-y-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Your primary goal
            </span>
            {goalsLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              primaryGoal ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900 truncate">
                      {primaryGoal.title}
                    </span>
                    <span className="font-semibold text-[#2D5A43]">{primaryGoalProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#E7E5E0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2D5A43] rounded-full transition-all duration-500"
                      style={{ width: `${primaryGoalProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500">
                    Target: <span className="font-medium text-stone-700">{primaryGoal.targetDate || "Ongoing"}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-600">No active goals</span>
                    <span className="text-stone-400">0%</span>
                  </div>
                  <div className="h-2 w-full bg-[#E7E5E0] rounded-full overflow-hidden">
                    <div className="h-full bg-stone-300 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <Link href="/goals" className="text-xs text-[#2D5A43] hover:underline font-semibold block">
                    Define what you want to achieve →
                  </Link>
                </div>
              )
            )}
          </CardBody>
        </Card>
      </div>

      {/* Two Column Section: Today's Action List + Flexible Plan Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Action List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-stone-900">
                  Today&apos;s Action Plan
                </CardTitle>
                <p className="text-xs text-stone-500 mt-0.5">
                  Clear, manageable steps for today without overwhelming lists
                </p>
              </div>
              <Link
                href="/today"
                className="text-xs font-semibold text-[#2D5A43] hover:underline flex items-center gap-1"
              >
                <span>Full execution screen</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardBody className="space-y-3 pt-3">
              {tasksLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : plannedTasks.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-[#2D5A43] mx-auto opacity-70" />
                  <p className="text-xs font-semibold text-stone-800">
                    No tasks planned for today
                  </p>
                  <p className="text-xs text-stone-500">
                    Take a well-deserved breather, or pull a task from your goals.
                  </p>
                </div>
              ) : (
                plannedTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[#E7E5E0] bg-[#FAF9F5] hover:bg-white transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          task.status === "done"
                            ? "bg-[#2D5A43] border-[#2D5A43] text-white"
                            : "border-stone-300"
                        }`}
                      >
                        {task.status === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            task.status === "done"
                              ? "text-stone-400 line-through"
                              : "text-stone-900"
                          }`}
                        >
                          {task.title}
                        </p>
                        <span className="text-[11px] text-stone-500">
                          {task.estimatedMinutes ? `~${task.estimatedMinutes} mins` : "Flexible time"}
                        </span>
                      </div>
                    </div>
                    <Link href="/today">
                      <Button variant="ghost" size="sm" className="text-xs text-[#2D5A43]">
                        {task.status === "done" ? "View" : "Open"}
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>

        {/* Supportive Coaching & Quick Recovery Link */}
        <div className="space-y-5">
          <Card className="bg-[#FAF9F5] border-[#E7E5E0]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-[#2D5A43]" />
                <CardTitle className="text-sm font-semibold text-stone-900">
                  Plan Recovery
                </CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 pt-2">
              <p className="text-xs text-stone-600 leading-relaxed">
                If life gets in the way or meetings run over, you can simulate recovery options anytime without resetting your progress.
              </p>
              <Link href="/recovery">
                <Button variant="outline" size="sm" className="w-full text-xs text-[#2D5A43] border-[#C6DDD1] bg-white">
                  Open Recovery Simulator
                </Button>
              </Link>
            </CardBody>
          </Card>

          <Card className="bg-white border-[#E7E5E0]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-stone-600" />
                <CardTitle className="text-sm font-semibold text-stone-900">
                  Weekly Rhythm
                </CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 pt-2">
              <p className="text-xs text-stone-600 leading-relaxed">
                {plannedTasks.length > 0
                  ? `You have ${plannedTasks.length} task${plannedTasks.length === 1 ? "" : "s"} scheduled today with built-in transition buffers.`
                  : "No scheduled focus sessions yet. Add tasks to see your personalized weekly rhythm."}
              </p>
              <Link href="/planner">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Review Available Slots
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Differentiator 2: Planning Overhead Meter ("Planning Tax") */}
      <PlanningOverheadCard planningMinutes={12} executionMinutes={150} />
    </div>
  );
}