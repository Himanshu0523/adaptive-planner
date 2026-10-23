import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("goalId");
    const date = searchParams.get("date");
    const tasks = db.getTasks({ goalId, date });
    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json({ error: "Failed to list tasks", message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }
    const newTask = db.createTask(body);
    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create task", message: err.message }, { status: 500 });
  }
}
