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
          id: true,
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

  return { success: true, comment };
}

export async function editComment(commentId: string, newContent: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required to edit comments.");
  }

  if (!newContent.trim() || newContent.length > 2000) {
    throw new Error("Comment must be between 1 and 2000 characters.");
  }

  const existingComment = await db.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });

  if (!existingComment) {
    throw new Error("Comment not found.");
  }

  const userEmail = session.user.email?.toLowerCase();
  const isAdmin = (session.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";
  const isAuthor = existingComment.userId === session.user.id;

  if (!isAuthor && !isAdmin) {
    throw new Error("You do not have permission to edit this comment.");
  }

  const updatedComment = await db.comment.update({
    where: { id: commentId },
    data: {
      content: newContent.trim(),
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: { select: { displayName: true, avatarUrl: true, username: true } },
        },
      },
    },
  });

  if (existingComment.post?.slug) {
    revalidatePath(`/article/${existingComment.post.slug}`);
  }

  return { success: true, comment: updatedComment };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Authentication required to delete comments.");
  }

  const existingComment = await db.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });

  if (!existingComment) {
    throw new Error("Comment not found.");
  }

  const userEmail = session.user.email?.toLowerCase();
  const isAdmin = (session.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";
  const isAuthor = existingComment.userId === session.user.id;

  if (!isAuthor && !isAdmin) {
    throw new Error("You do not have permission to delete this comment.");
  }

  await db.comment.delete({
    where: { id: commentId },
  });

  if (existingComment.post?.slug) {
    revalidatePath(`/article/${existingComment.post.slug}`);
  }

  return { success: true };
}
