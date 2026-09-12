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
      post: { select: { slug: true } },
      user: {
        select: {
          name: true,
          image: true,
          profile: { select: { displayName: true, avatarUrl: true, username: true } },
        },
      },
    },
  });

  if (comment.post?.slug) {
    revalidatePath(`/article/${comment.post.slug}`);
  }
  if (comment.user?.profile?.username) {
    revalidatePath(`/${comment.user.profile.username}`);
  }
  revalidatePath("/studio/comments");
  revalidatePath("/(public)/[section]", "page");
  return { success: true, comment };
}
