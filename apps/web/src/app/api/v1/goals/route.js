import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const goals = db.getGoals({ status });
    return NextResponse.json(goals);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch goals", message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Goal title is required" }, { status: 400 });
    }
    const newGoal = db.createGoal(body);
    return NextResponse.json(newGoal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create goal", message: err.message }, { status: 500 });
  }
}
