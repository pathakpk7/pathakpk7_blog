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
  });

  if (existingLike) {
    await db.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await db.like.create({
      data: { userId, postId },
    });
  }

  const count = await db.like.count({ where: { postId } });
  revalidatePath(`/article/[slug]`, "page");
  revalidatePath("/library");
  revalidatePath("/settings");
  revalidatePath("/(public)/[section]", "page");

  return { liked: !existingLike, count };
}
