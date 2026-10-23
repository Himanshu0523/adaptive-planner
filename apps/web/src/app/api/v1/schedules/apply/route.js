import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { addDays, format } from "date-fns";

export async function POST(request) {
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const activeTasks = db.getTasks({ date: today }).filter((t) => t.status !== "done");

    if (activeTasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active tasks require compression or shifting.",
        updatedTasksCount: 0,
      });
    }

    let updatedCount = 0;
    activeTasks.forEach((task, idx) => {
      const originalEst = task.estimatedMinutes || 30;
      const bufferedEst = Math.max(Math.round(originalEst * 0.85), 20); // 15% focus compression buffer
      const shouldShift = idx >= 3; // Shift tasks beyond daily capacity limit to avoid cognitive overload

      const patch = {
        estimatedMinutes: bufferedEst,
      };

      if (shouldShift) {
        patch.dueDate = tomorrow;
        patch.notes = task.notes
          ? `${task.notes} [Shifted to tomorrow to maintain calm daily capacity]`
          : "[Shifted to tomorrow to maintain calm daily capacity]";
      }

      db.updateTask(task.id, patch);
      updatedCount++;
    });

    return NextResponse.json({
      success: true,
      message: `Applied 15% focus compression buffer across ${updatedCount} tasks.${
        activeTasks.length > 3 ? " 1 task shifted to tomorrow to prevent end-of-day fatigue." : ""
      }`,
      updatedTasksCount: updatedCount,
      appliedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("API /api/v1/schedules/apply error:", err);
    return NextResponse.json(
      { error: "Failed to apply schedule optimization", message: err.message },
      { status: 500 }
    );
  }
}
