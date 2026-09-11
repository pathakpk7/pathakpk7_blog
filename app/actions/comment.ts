"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function addComment(postId: string, content: string, parentId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required to post comments.");
  }

  if (!content.trim() || content.length > 2000) {
    throw new Error("Comment must be between 1 and 2000 characters.");
  }

  const userId = session.user.id;

  const comment = await db.comment.create({
    data: {
      postId,
      userId,
      parentId: parentId || null,
      content: content.trim(),
      status: "APPROVED", // Auto-approved for authenticated users in initial setup
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          profile: { select: { displayName: true, avatarUrl: true, username: true } },
        },
      },
    },
  });

  revalidatePath(`/article/[slug]`, "page");
  return { success: true, comment };
}
