import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request) {
  try {
    const goals = db.getGoals();
    const tasks = db.getTasks();

    const pendingTasks = tasks.filter((t) => t.status !== "done");

    if (pendingTasks.length === 0) {
      return NextResponse.json({
        hasDeficit: false,
        recoveryStrategies: [],
        activeGoal: goals[0] || null,
        pendingTasksCount: 0,
        deficitHours: 0,
        recommendedExtensionDays: 0,
        message: "No schedule deficits detected. All tasks are completed or your schedule is clear.",
        calculatedAt: new Date().toISOString(),
      });
    }

    const activeGoal = goals.find((g) => g.status === "in_progress") || goals[0] || {
      title: "Current Goal",
      targetDate: "Target Date",
    };

    const totalPendingMinutes = pendingTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
    const deficitHours = Math.round((totalPendingMinutes / 60) * 10) / 10;
    const recommendedExtensionDays = Math.max(Math.ceil(totalPendingMinutes / 90), 2);

    const task1 = pendingTasks[0];
    const task2 = pendingTasks[1] || pendingTasks[0];

    const recoveryStrategies = [
      {
        id: "keep_deadline",
        title: "Option 1 — Keep the Target Deadline",
        tagline: `Prioritize critical path for "${activeGoal.title}" and defer secondary tasks`,
        feasibility: "Highly Feasible",
        feasibilityColor: "text-[#2D5A43] bg-[#EAF4EE] border-[#C6DDD1]",
        whatChanges: [
          `Non-critical task items deferred to the next iteration`,
          `Focus condensed to top high-impact deliverables (${Math.max(pendingTasks.length - 1, 1)} tasks)`,
          `Workload reduced by ${Math.round(deficitHours * 0.4 * 10) / 10} hours`,
        ],
        whatRemainsUnchanged: [
          `Target deadline (${activeGoal.targetDate || "Original target"}) strictly preserved`,
          `Core criteria for "${activeGoal.title}" intact`,
          `Upcoming external commitments protected`,
        ],
        tradeoffs: "Secondary polish and non-essential documentation deferred to post-release.",
        affectedTasks: [
          {
            title: task2.title,
            action: "Deferred to Phase 2",
            date: "Next Sprint",
          },
          {
            title: task1.title,
            action: "Retained on Priority Schedule",
            date: "This Week",
          },
        ],
      },
      {
        id: "extend_deadline",
        title: "Option 2 — Extend the Deadline Gently",
        tagline: "Preserve 100% of original scope while shifting target date calmly",
        feasibility: `Feasible (+${recommendedExtensionDays} Days)`,
        feasibilityColor: "text-blue-800 bg-blue-50 border-blue-200",
        whatChanges: [
          `Deadline moved forward by ${recommendedExtensionDays} days to ensure quality`,
          `Workload distributed comfortably at ~45m/day instead of crunch sessions`,
          `Zero tasks cut or de-scoped`,
        ],
        whatRemainsUnchanged: [
          `All ${pendingTasks.length} pending tasks remain in the plan`,
          `Complete original definition of done preserved`,
          `Daily focus sessions kept within healthy cognitive limits`,
        ],
        tradeoffs: `Goal milestone completes ${recommendedExtensionDays} days later than initially planned.`,
        affectedTasks: [
          {
            title: task1.title,
            action: `Shifted +${Math.floor(recommendedExtensionDays / 2)} Days`,
            date: "Recalibrated Slot",
          },
          {
            title: task2.title,
            action: `Shifted +${recommendedExtensionDays} Days`,
            date: "New Completion Slot",
          },
        ],
      },
      {
        id: "reallocate_time",
        title: "Option 3 — Reallocate Available Time",
        tagline: "Utilize upcoming open weekend or evening buffers to maintain schedule",
        feasibility: "Conditionally Feasible",
        feasibilityColor: "text-amber-800 bg-amber-50 border-amber-200",
        whatChanges: [
          `Adds one focused 90-minute weekend buffer session`,
          `Shifts administrative items to quick wrap-up blocks`,
          `Absorbs current ${deficitHours}h workload deficit without shifting deadlines`,
        ],
        whatRemainsUnchanged: [
          `Original target date preserved`,
          `Full scope and all deliverables retained`,
          `Weekday rest evenings remain protected`,
        ],
        tradeoffs: "Requires drawing from weekend or open personal buffer time.",
        affectedTasks: [
          {
            title: task1.title,
            action: "Scheduled for Dedicated Focus Block",
            date: "Saturday 10:00 AM",
          },
          {
            title: task2.title,
            action: "Retained on Schedule",
            date: "On Target",
          },
        ],
      },
    ];

    return NextResponse.json({
      recoveryStrategies,
      activeGoal,
      pendingTasksCount: pendingTasks.length,
      deficitHours,
      recommendedExtensionDays,
      calculatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate recovery options", message: err.message }, { status: 500 });
  }
}
