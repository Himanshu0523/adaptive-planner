import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { generatePlanWithLLM } from "@/lib/llm/planner-llm";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tasks = db.getTasks();
    const goals = db.getGoals();

    const pendingTasks = tasks.filter((t) => t.status !== "done");
    const overdueTasks = tasks.filter((t) => t.status !== "done" && t.dueDate && new Date(t.dueDate) < new Date());

    const estimatedMinutes = body.estimatedMinutes || (tasks.length > 0 ? tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0) / tasks.length : 30);
    const actualMinutesLogged = body.actualMinutesLogged || (body.overdueMinutes || (overdueTasks.length * 45));
    const rescheduleCount = body.rescheduleCount || (overdueTasks.length > 0 ? 3 : 0);
    const hasBlocker = Boolean(body.hasBlocker || pendingTasks.some((t) => t.notes?.toLowerCase().includes("blocked")));
    const dailyScheduledMinutes = body.dailyScheduledMinutes || pendingTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0);
    const maxCapacity = 240; // 4 hours focus capacity default

    let primaryCause = "ESTIMATE_MISS";
    let causeLabel = "Underestimated Task Complexity";
    let confidence = 0.88;
    const evidence = {
      estimatedMinutes: Math.round(estimatedMinutes),
      actualMinutesLogged: Math.round(actualMinutesLogged),
      rescheduleCount,
      hasBlocker,
      dailyScheduledMinutes,
      maxCapacity,
    };

    if (body.hasAgentFailure) {
      primaryCause = "AGENT_FAILURE";
      causeLabel = "Agent Execution Bottleneck";
      confidence = 0.95;
      evidence.reason = "Autonomous agent encountered an unhandled exception or rejected tool call.";
    } else if (hasBlocker) {
      primaryCause = "BLOCKER";
      causeLabel = "External Dependency or Blocker";
      confidence = 0.92;
      evidence.reason = "Unresolved dependency halted progress before deep work could commence.";
    } else if (actualMinutesLogged > 1.4 * estimatedMinutes && estimatedMinutes > 0) {
      primaryCause = "ESTIMATE_MISS";
      causeLabel = "Underestimated Task Complexity";
      confidence = 0.88;
      const overrunPct = Math.round(((actualMinutesLogged - estimatedMinutes) / estimatedMinutes) * 100);
      evidence.overrunPercentage = `${overrunPct}%`;
      evidence.reason = `Task required ${actualMinutesLogged}m vs planned ${estimatedMinutes}m.`;
    } else if (dailyScheduledMinutes > maxCapacity) {
      primaryCause = "CAPACITY_CLASH";
      causeLabel = "Daily Cognitive Capacity Saturated";
      confidence = 0.85;
      evidence.reason = `Planned workload (${dailyScheduledMinutes}m) exceeded healthy daily focus limit (${maxCapacity}m).`;
    } else if (rescheduleCount >= 3) {
      primaryCause = "AVOIDANCE";
      causeLabel = "Starting Friction / Ambiguity";
      confidence = 0.82;
      evidence.reason = `Rescheduled ${rescheduleCount} times, suggesting high cognitive resistance or ambiguous scope.`;
    } else if (body.isScopeChanged) {
      primaryCause = "CHANGED_ASSUMPTION";
      causeLabel = "Scope & Requirement Evolution";
      confidence = 0.80;
      evidence.reason = "Requirements or acceptance criteria evolved after the initial plan was locked in.";
    }

    // Rank Recovery Options deterministically
    let rankedRecoveryOptions = [];
    if (primaryCause === "CAPACITY_CLASH") {
      rankedRecoveryOptions = [
        {
          id: "reallocate_time",
          title: "Option 3 — Reallocate Available Time",
          rank: 1,
          rationale: "Redistributes congested tasks across open afternoon buffers to prevent burnout.",
        },
        {
          id: "extend_deadline",
          title: "Option 2 — Extend the Deadline Gently",
          rank: 2,
          rationale: "Adds calendar days to keep daily workloads under 45m.",
        },
        {
          id: "keep_deadline",
          title: "Option 1 — Keep the Target Deadline",
          rank: 3,
          rationale: "Prunes secondary scope to protect the milestone.",
        },
      ];
    } else if (primaryCause === "BLOCKER") {
      rankedRecoveryOptions = [
        {
          id: "extend_deadline",
          title: "Option 2 — Extend the Deadline Gently",
          rank: 1,
          rationale: "Pauses active time targets safely until the external prerequisite is resolved.",
        },
        {
          id: "keep_deadline",
          title: "Option 1 — Keep the Target Deadline",
          rank: 2,
          rationale: "Swaps in parallel unblocked tasks to keep momentum.",
        },
        {
          id: "reallocate_time",
          title: "Option 3 — Reallocate Available Time",
          rank: 3,
          rationale: "Defers blocked task to next week's schedule.",
        },
      ];
    } else if (primaryCause === "AVOIDANCE") {
      rankedRecoveryOptions = [
        {
          id: "keep_deadline",
          title: "Option 1 — Keep the Target Deadline",
          rank: 1,
          rationale: "Deconstructs the intimidating task into a tiny 10-minute starter chunk.",
        },
        {
          id: "reallocate_time",
          title: "Option 3 — Reallocate Available Time",
          rank: 2,
          rationale: "Moves work to high-energy morning slots.",
        },
        {
          id: "extend_deadline",
          title: "Option 2 — Extend the Deadline Gently",
          rank: 3,
          rationale: "Provides space before re-engaging.",
        },
      ];
    } else {
      // ESTIMATE_MISS, CHANGED_ASSUMPTION, AGENT_FAILURE
      rankedRecoveryOptions = [
        {
          id: "extend_deadline",
          title: "Option 2 — Extend the Deadline Gently",
          rank: 1,
          rationale: "Absorbs real execution depth without sacrificing quality.",
        },
        {
          id: "keep_deadline",
          title: "Option 1 — Keep the Target Deadline",
          rank: 2,
          rationale: "Cuts secondary polish to protect target launch date.",
        },
        {
          id: "reallocate_time",
          title: "Option 3 — Reallocate Available Time",
          rank: 3,
          rationale: "Leverages upcoming buffer intervals.",
        },
      ];
    }

    // Default explanations
    const explanations = {
      ESTIMATE_MISS: "This task took longer than initially planned due to discovery and depth during execution. That is completely normal; we will recalibrate future buffers accordingly.",
      CAPACITY_CLASH: "Today's schedule exceeded your healthy daily focus ceiling, making an overrun inevitable. Protecting cognitive stamina is the priority, so let's redistribute the remaining items comfortably.",
      BLOCKER: "An external dependency or prerequisite held up this task before deep work could begin. Since you cannot control third-party timelines, we will hold the milestone safely until unblocked.",
      AVOIDANCE: "This task has been rescheduled multiple times, which usually signals unclear next steps or cognitive resistance rather than lack of discipline. Breaking it into a 10-minute micro-action will restore momentum.",
      CHANGED_ASSUMPTION: "The scope and requirements evolved naturally as you learned more about the problem. A plan must bend to reality rather than enforce obsolete assumptions.",
      AGENT_FAILURE: "An automated agent step encountered an execution error and halted to preserve safety. You can review the step or complete it directly without penalty.",
    };

    return NextResponse.json({
      primaryCause,
      causeLabel,
      confidence,
      evidencePacket: evidence,
      explanation: explanations[primaryCause] || "Real-world interruptions shifted your planned hours today. Adaptive Planner is designed to recalibrate with zero guilt.",
      rankedRecoveryOptions,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Plan autopsy error:", err);
    return NextResponse.json(
      { error: "Failed to perform plan autopsy", details: err?.message },
      { status: 500 }
    );
  }
}
