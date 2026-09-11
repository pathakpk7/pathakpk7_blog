import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { validateUsername } from "@/lib/validation/username";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username") || "";

    const validation = validateUsername(rawUsername);
    if (!validation.valid || !validation.cleanUsername) {
      return NextResponse.json({
        available: false,
        valid: false,
        error: validation.error,
      });
    }

    const cleanUsername = validation.cleanUsername;

    // Check if current user owns this username already
    const session = await auth();
    const currentUserId = session?.user?.id;

    const existing = await db.profile.findFirst({
      where: {
        username: cleanUsername,
        ...(currentUserId ? { NOT: { userId: currentUserId } } : {}),
      },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        valid: true,
        error: "This username is already taken by another account.",
      });
    }

    return NextResponse.json({
      available: true,
      valid: true,
      cleanUsername,
      message: "Username is available!",
    });
  } catch (error) {
    console.error("Check username API error:", error);
    return NextResponse.json({ error: "Failed to check username availability." }, { status: 500 });
  }
}
