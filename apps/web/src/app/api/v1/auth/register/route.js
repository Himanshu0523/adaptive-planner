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

    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = db.findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Create user
    const newUser = db.createUser({ name, email, password });
    const accessToken = db.generateAuthToken(newUser);

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
        accessToken,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("API /api/v1/auth/register error:", err);
    return NextResponse.json(
      { message: "Registration service error", error: err.message },
      { status: 500 }
    );
  }
}
