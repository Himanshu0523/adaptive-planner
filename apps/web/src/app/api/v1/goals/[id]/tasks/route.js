import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const tasks = db.getTasks({ goalId: id });
    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tasks for goal", message: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }
    const newTask = db.createTask({ ...body, goalId: id });
    return NextResponse.json(newTask, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create task", message: err.message }, { status: 500 });
  }
}
