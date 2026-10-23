import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const goal = db.getGoalById(id);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(goal);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch goal", message: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = db.updateGoal(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update goal", message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    db.deleteGoal(id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete goal", message: err.message }, { status: 500 });
  }
}
