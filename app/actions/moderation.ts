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

  if (status === "DELETED") {
    await db.comment.delete({ where: { id: commentId } });
  } else {
    await db.comment.update({
      where: { id: commentId },
      data: { status },
    });
  }

  revalidatePath("/studio/comments");
}
