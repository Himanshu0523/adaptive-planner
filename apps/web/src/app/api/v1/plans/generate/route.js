import { NextResponse } from "next/server";
import { generatePlanWithLLM } from "@/lib/llm/planner-llm";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { title, category, criteria, targetDate, hoursPerWeek, selectedDays } = body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Goal title is required for plan generation" },
        { status: 400 }
      );
    }

    const plan = await generatePlanWithLLM({
      title: title.trim(),
      category: typeof category === "string" ? category : "General",
      criteria: Array.isArray(criteria) ? criteria : [],
      targetDate: typeof targetDate === "string" ? targetDate : null,
      hoursPerWeek: Number(hoursPerWeek) > 0 ? Number(hoursPerWeek) : 8,
      selectedDays: Array.isArray(selectedDays) && selectedDays.length > 0
        ? selectedDays
        : ["Mon", "Tue", "Thu", "Sat"],
    });

    return NextResponse.json(plan, { status: 200 });
  } catch (err) {
    console.error("API /api/v1/plans/generate error:", err);
    return NextResponse.json(
      { error: "Plan generation failed", message: err.message },
      { status: 500 }
    );
  }
}
