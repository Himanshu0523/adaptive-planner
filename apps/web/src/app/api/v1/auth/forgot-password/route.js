import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON request" }, { status: 400 });
    }

    const { email } = body || {};
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = db.findUserByEmail(email);

    return NextResponse.json(
      {
        success: true,
        message: "If an account matches that email address, password reset instructions have been sent.",
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ message: "Error processing reset", error: err.message }, { status: 500 });
  }
}
