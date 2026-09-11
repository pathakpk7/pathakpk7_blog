import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input data." }, { status: 400 });
    }

    const { name, username, email, password } = parsed.data;

    // Check existing email
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // Check existing username
    const existingProfile = await db.profile.findUnique({ where: { username } });
    if (existingProfile) {
      return NextResponse.json({ error: "Username is already taken." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "USER",
        profile: {
          create: {
            username,
            displayName: name,
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
