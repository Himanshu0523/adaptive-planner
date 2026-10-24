import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request) {
  try {
    const goals = db.getGoals();
    const tasks = db.getTasks();

    const completedTasks = tasks.filter((t) => t.status === "done");
    const pendingTasks = tasks.filter((t) => t.status !== "done");
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress");

    if (tasks.length === 0) {
      return NextResponse.json({
        hasData: false,
        primaryPatternTitle: "Baseline diagnostics active",
        observationSummary: "No workload or completed task sessions recorded yet.",
        observations: [
          {
            label: "Completion Ratio",
            value: "0/0 tasks completed",
            context: "Awaiting your first task execution",
          },
          {
            label: "Average Task Size",
            value: "—",
            context: "Calibrates with completed sessions",
          },
          {
            label: "Active Goals",
            value: `${goals.length} registered goals`,
            context: goals.length === 0 ? "No active goals defined yet" : "Goals defined",
          },
        ],
        hypotheses: [
          {
            id: "hyp-1",
            title: "Begin by creating a goal or adding a task to today's schedule to activate continuous diagnostics.",
            confidence: "Informational",
            actionableRecommendation: "Use the Guided Goal Wizard to break your vision into bite-sized 30-minute focus blocks.",
          },
        ],
        analyzedAt: new Date().toISOString(),
      });
    }

    const totalMinutesEstimated = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
    const avgMinutes = tasks.length > 0 ? Math.round(totalMinutesEstimated / tasks.length) : 35;

    // Detect real patterns
    const multipleInProgress = inProgressTasks.length > 1;
    const lowCompletionRatio = tasks.length > 0 && completedTasks.length / tasks.length < 0.4;
    const highAvgDuration = avgMinutes >= 45;

    let primaryPatternTitle = "Estimate buffer recalibration recommended";
    let observationSummary = `Average task estimate across ${tasks.length} items is ${avgMinutes} minutes with ${pendingTasks.length} pending items.`;
    let primaryHypothesis = "Task estimates may benefit from an extra 15% buffer to accommodate research and unexpected transitions.";

    if (multipleInProgress) {
      primaryPatternTitle = "Frequent task context switching detected";
      observationSummary = `${inProgressTasks.length} tasks are currently active in progress simultaneously.`;
      primaryHypothesis = "Working on multiple items concurrently may increase cognitive friction. Consider focusing on one single task at a time.";
    } else if (lowCompletionRatio && tasks.length >= 3) {
      primaryPatternTitle = "Workload concentration in early phases";
      observationSummary = `${completedTasks.length} of ${tasks.length} tasks completed (${Math.round((completedTasks.length / tasks.length) * 100)}%).`;
      primaryHypothesis = "Milestone boundaries may be scoped too broadly. Splitting large tasks into 20-minute chunks can re-establish momentum.";
    }

    const observations = [
      {
        label: "Completion Ratio",
        value: `${completedTasks.length}/${tasks.length} tasks completed`,
        context: "Calculated from active task ledger",
      },
      {
        label: "Average Task Size",
        value: `${avgMinutes} minutes`,
        context: highAvgDuration ? "Above the 30m sweet spot" : "Well-sized focus chunks",
      },
      {
        label: "Active Goals",
        value: `${goals.length} registered goals`,
        context: goals.filter((g) => g.status === "in_progress").length + " in progress",
      },
    ];

    const hypotheses = [
      {
        id: "hyp-1",
        title: primaryHypothesis,
        confidence: "High Confidence",
        actionableRecommendation: "Recalibrate task time allocations and insert 10m pause intervals between deep-work sessions.",
      },
      {
        id: "hyp-2",
        title: "Upcoming milestones would benefit from explicit definition of done criteria.",
        confidence: "Moderate Confidence",
        actionableRecommendation: "Add measurable checklist items to active goals before scheduling next week.",
      },
    ];

    return NextResponse.json({
      primaryPatternTitle,
      observationSummary,
      observations,
      hypotheses,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to diagnose insights", message: err.message }, { status: 500 });
  }
}
