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

    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify user credentials in db
    const user = db.verifyUser(email, password);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password. You can also use Instant Demo Access." },
        { status: 401 }
      );
    }

    const accessToken = db.generateAuthToken(user);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("API /api/v1/auth/login error:", err);
    return NextResponse.json(
      { message: "Authentication service error", error: err.message },
      { status: 500 }
    );
  }
}
