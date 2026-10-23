import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const tasks = db.getTasks({ date });
    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch today tasks", message: err.message }, { status: 500 });
  }
}
