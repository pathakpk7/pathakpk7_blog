import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { validateUsername } from "@/lib/validation/username";
import { getSafeAvatarUrl } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z.string(),
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input data." }, { status: 400 });
    }

    const { name, username: rawUsername, email, password } = parsed.data;

    // Validate username with strict constraint rules
    const usernameValidation = validateUsername(rawUsername);
    if (!usernameValidation.valid || !usernameValidation.cleanUsername) {
      return NextResponse.json({ error: usernameValidation.error || "Invalid username." }, { status: 400 });
    }

    const cleanUsername = usernameValidation.cleanUsername;
    const cleanEmail = email.toLowerCase().trim();

    // Check existing email
    const existingUser = await db.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
    });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // Check existing username (case-insensitive handle uniqueness)
    const existingProfile = await db.profile.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: "insensitive",
        },
      },
    });
    if (existingProfile) {
      return NextResponse.json({ error: "Username is already taken by another account." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const defaultAvatarUrl = getSafeAvatarUrl(null, cleanUsername);

    const user = await db.user.create({
      data: {
        email: cleanEmail,
        name: name.trim(),
        passwordHash,
        role: "USER",
        profile: {
          create: {
            username: cleanUsername,
            displayName: name.trim(),
            avatarUrl: defaultAvatarUrl,
          },
        },
      },
      include: { profile: true },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}

