"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required to like articles.");
  }

  const userId = session.user.id;

  const existingLike = await db.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
    select: { id: true, post: { select: { slug: true } } },
  });

  if (existingLike) {
    await db.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await db.like.create({
      data: { userId, postId },
    });

    try {
      const post = await db.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      });
      if (post && post.authorId !== userId) {
        const { dispatchNotification } = await import("@/app/actions/notification");
        await dispatchNotification({
          userId: post.authorId,
          actorId: userId,
          type: "POST_LIKE",
          postId,
        });
      }
    } catch (e) {}
  }

  const count = await db.like.count({ where: { postId } });
  return { liked: !existingLike, count };
}
