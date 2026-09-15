"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";

export async function toggleBookmark(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required to bookmark articles.");
  }

  const userId = session.user.id;

  const existingBookmark = await db.bookmark.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
    select: { id: true },
  });

  if (existingBookmark) {
    await db.bookmark.delete({
      where: { id: existingBookmark.id },
    });
  } else {
    await db.bookmark.create({
      data: { userId, postId },
    });
  }

  return { bookmarked: !existingBookmark };
}
