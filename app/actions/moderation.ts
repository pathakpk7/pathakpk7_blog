"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function updateCommentStatus(commentId: string, status: "APPROVED" | "REJECTED" | "SPAM" | "DELETED"): Promise<void> {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user?.id || !isAdmin) {
    throw new Error("Unauthorized");
  }

  // Find target comment first to retrieve associated post slug and user profile handle
  const targetComment = await db.comment.findUnique({
    where: { id: commentId },
    include: {
      post: { select: { slug: true } },
      user: { include: { profile: { select: { username: true } } } },
    },
  });

  if (status === "DELETED") {
    await db.comment.delete({ where: { id: commentId } });
  } else {
    await db.comment.update({
      where: { id: commentId },
      data: { status },
    });
  }

  // Comprehensive path revalidation so changes reflect immediately across the entire site
  revalidatePath("/studio/comments");
  revalidatePath("/studio");
  revalidatePath("/studio/analytics");
  if (targetComment?.post?.slug) {
    revalidatePath(`/article/${targetComment.post.slug}`);
  }
  if (targetComment?.user?.profile?.username) {
    revalidatePath(`/${targetComment.user.profile.username}`);
  }
  revalidatePath("/(public)/[section]", "page");
}
