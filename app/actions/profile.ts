"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
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
  const username = data.username.trim().toLowerCase();

  // Check username uniqueness
  const existing = await db.profile.findFirst({
    where: {
      username,
      NOT: { userId },
    },
  });

  if (existing) {
    throw new Error("Username is already taken by another user.");
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
  revalidatePath("/");

  return { success: true, profile: updatedProfile };
}
