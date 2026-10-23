import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const tasks = db.getTasks({ date: today });
    const goals = db.getGoals();

    // Dynamically calculate schedule optimization based on actual active tasks
    const activeTasks = tasks.filter((t) => t.status !== "done");

    let proposedSchedule = [];

    if (activeTasks.length === 0) {
      proposedSchedule = [
        {
          taskId: "none",
          title: "All current tasks are completed! Enjoy your buffer time.",
          originalSlot: "Free Slot",
          proposedSlot: "Protected Rest Block",
          durationChange: "0m",
          feasibility: "Fully Clear",
          scope: "No pending conflicts",
        },
      ];
    } else {
      let currentHour = 10;
      let currentMinute = 0;

      proposedSchedule = activeTasks.map((t, idx) => {
        const est = t.estimatedMinutes || 30;
        const bufferedEst = Math.max(Math.round(est * 0.85), 20); // 15% focus compression buffer
        const diff = est - bufferedEst;

        const startHourStr = currentHour > 12 ? `${currentHour - 12}` : `${currentHour}`;
        const startAmpm = currentHour >= 12 ? "PM" : "AM";
        const startMinStr = currentMinute < 10 ? `0${currentMinute}` : `${currentMinute}`;
        const origSlot = `${startHourStr}:${startMinStr} ${startAmpm}`;

        // Shift last task if more than 3 tasks to avoid cognitive overload
        const shouldShift = idx >= 3;
        let propSlot = "";
        let feasibility = "On Schedule";
        let scope = "Unchanged";

        if (shouldShift) {
          propSlot = "Tomorrow, 09:30 AM";
          feasibility = "Conflict Resolved";
          scope = "Deferred to avoid end-of-day overload";
        } else {
          const endMin = (currentMinute + bufferedEst) % 60;
          const endHour = currentHour + Math.floor((currentMinute + bufferedEst) / 60);
          const endHourStr = endHour > 12 ? `${endHour - 12}` : `${endHour}`;
          const endAmpm = endHour >= 12 ? "PM" : "AM";
          propSlot = `${startHourStr}:${startMinStr} – ${endHourStr}:${endMin < 10 ? `0${endMin}` : endMin} ${endAmpm}`;
          feasibility = idx === 0 ? "Protected Focus Block" : "On Schedule";

          currentMinute = endMin + 15; // 15 min rest transition
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
          }
        }

        return {
          taskId: t.id,
          title: t.title,
          originalSlot: `${origSlot} (${est}m)`,
          proposedSlot: propSlot,
          durationChange: shouldShift ? "Shifted to tomorrow" : `${est}m → ${bufferedEst}m (-${diff}m)`,
          feasibility,
          scope,
        };
      });
    }

    return NextResponse.json({
      proposedSchedule,
      totalActiveTasks: activeTasks.length,
      totalGoals: goals.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate schedule preview", message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  // Can accept custom task list or preferences to re-schedule
  return GET(request);
}
