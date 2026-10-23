import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function GET(request) {
  try {
    let authHeader = null;
    try {
      authHeader = request.headers.get("authorization");
    } catch (headerErr) {
      if (headerErr?.digest === "NEXT_PRERENDER_INTERRUPTED") {
        throw headerErr;
      }
    }

    let user = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token.startsWith("jwt_")) {
        try {
          const payloadJson = Buffer.from(token.replace("jwt_", ""), "base64url").toString("utf8");
          const payload = JSON.parse(payloadJson);
          if (payload?.userId) {
            user = db.findUserById(payload.userId);
          }
        } catch {
          // fallback to demo user
        }
      }
    }

    // Default to active user or demo user
    if (!user) {
      user = db.findUserByEmail("demo@adaptiveplanner.io");
    }

    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    if (err?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw err;
    }
    console.error("API /api/v1/auth/me error:", err);
    return NextResponse.json(
      { message: "Identity service error", error: err.message },
      { status: 500 }
    );
  }
}
