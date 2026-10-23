import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { addDays, format, parseISO } from "date-fns";

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is okay, will use default strategy
    }

    const { strategyId = "keep_deadline" } = body;
    const goals = db.getGoals();
    const tasks = db.getTasks();
    const activeGoal = goals.find((g) => g.status === "in_progress") || goals[0];
    const pendingTasks = tasks.filter((t) => t.status !== "done");

    let message = "";
    let affectedTasksCount = 0;

    if (strategyId === "keep_deadline") {
      // Prioritize critical path: keep top priority task on schedule, mark secondary tasks deferred to Phase 2
      pendingTasks.forEach((t, idx) => {
        if (idx > 0) {
          db.updateTask(t.id, {
            notes: t.notes ? `${t.notes} [Deferred to Phase 2 to preserve deadline]` : "[Deferred to Phase 2]",
            status: "todo",
          });
          affectedTasksCount++;
        }
      });
      message = "Critical path prioritized. Non-essential items deferred to Phase 2; target deadline preserved.";
    } else if (strategyId === "extend_deadline") {
      // Gently extend the goal target date by 4 days, and space out pending tasks
      const extensionDays = 4;
      if (activeGoal && activeGoal.targetDate) {
        try {
          const parsed = parseISO(activeGoal.targetDate);
          const newTarget = format(addDays(parsed, extensionDays), "yyyy-MM-dd");
          db.updateGoal(activeGoal.id, { targetDate: newTarget });
        } catch {
          // ignore date parse fallback
        }
      }

      pendingTasks.forEach((t, idx) => {
        const shiftDays = Math.min((idx + 1) * 2, extensionDays);
        const newDueDate = format(addDays(new Date(), shiftDays), "yyyy-MM-dd");
        db.updateTask(t.id, {
          dueDate: newDueDate,
          notes: t.notes ? `${t.notes} [Recalibrated schedule +${shiftDays}d]` : `[Recalibrated schedule +${shiftDays}d]`,
        });
        affectedTasksCount++;
      });
      message = `Target deadline extended by ${extensionDays} days. All ${pendingTasks.length} tasks preserved without crunching.`;
    } else if (strategyId === "reallocate_time") {
      // Move pending task to upcoming weekend buffer slot (Saturday 10:00 AM)
      const now = new Date();
      const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
      const saturdayDate = format(addDays(now, daysUntilSaturday), "yyyy-MM-dd");

      if (pendingTasks[0]) {
        db.updateTask(pendingTasks[0].id, {
          dueDate: saturdayDate,
          notes: `${pendingTasks[0].notes || ""} [Reallocated to Saturday 10:00 AM focus buffer block]`,
        });
        affectedTasksCount = 1;
      }
      message = `Weekend focus block reallocated for ${saturdayDate}. Weekday schedule protected.`;
    }

    return NextResponse.json({
      success: true,
      strategyId,
      message,
      affectedTasksCount,
      activeGoal: activeGoal ? db.getGoalById(activeGoal.id) : null,
      appliedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("API /api/v1/recovery/apply error:", err);
    return NextResponse.json(
      { error: "Failed to apply recovery strategy", message: err.message },
      { status: 500 }
    );
  }
}
