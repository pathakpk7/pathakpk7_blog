"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function toggleCommentLike(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required");
  }

  const userId = session.user.id;

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true, section: true } } },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  const existingLike = await db.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });

  let isLiked = false;

  if (existingLike) {
    await db.commentLike.delete({
      where: { id: existingLike.id },
    });
    isLiked = false;
  } else {
    await db.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });
    isLiked = true;

    // Create notification if someone else liked the comment
    if (comment.userId !== userId) {
      try {
        await db.notification.create({
          data: {
            userId: comment.userId,
            actorId: userId,
            type: "COMMENT_LIKE",
            commentId,
            postId: comment.postId,
          },
        });
      } catch (e) {
        console.warn("Notification creation failed:", e);
      }
    }
  }

  const likeCount = await db.commentLike.count({
    where: { commentId },
  });

  if (comment.post?.slug) {
    revalidatePath(`/article/${comment.post.slug}`);
  }
  if (comment.post?.section) {
    revalidatePath(`/${comment.post.section}`);
  }

  return { isLiked, likeCount };
}
