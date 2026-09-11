"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { validateUsername } from "@/lib/validation/username";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required to update profile.");
  }

  const userId = session.user.id;
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.valid || !usernameValidation.cleanUsername) {
    throw new Error(usernameValidation.error || "Invalid username format.");
  }

  const username = usernameValidation.cleanUsername;

  // Check username uniqueness (case-insensitive handle collision check)
  const existing = await db.profile.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
      NOT: { userId },
    },
  });

  if (existing) {
    throw new Error("Username is already taken by another account.");
  }

  const updatedProfile = await db.profile.upsert({
    where: { userId },
    update: {
      username,
      displayName: data.displayName.trim(),
      bio: data.bio?.trim() || null,
      avatarUrl: data.avatarUrl || null,
    },
    create: {
      userId,
      username,
      displayName: data.displayName.trim(),
      bio: data.bio?.trim() || null,
      avatarUrl: data.avatarUrl || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/library");
  revalidatePath(`/${username}`);
  revalidatePath("/");

  return { success: true, profile: updatedProfile };
}

