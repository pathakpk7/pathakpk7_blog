"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";

export async function updateReadingHistory(postId: string, progress: number) {
  const session = await auth();
  if (!session?.user?.id) return;

  const userId = session.user.id;
  const isCompleted = progress >= 0.9;

  await db.readingHistory.upsert({
    where: {
      userId_postId: { userId, postId },
    },
    update: {
      progress,
      lastReadAt: new Date(),
      completedAt: isCompleted ? new Date() : undefined,
    },
    create: {
      userId,
      postId,
      progress,
      completedAt: isCompleted ? new Date() : null,
    },
  });
}
