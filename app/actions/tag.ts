"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getAllTags() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
    return { success: true, tags };
  } catch (error: any) {
    console.error("Failed to fetch tags:", error);
    return { success: false, error: error.message || "Failed to fetch tags" };
  }
}

export async function createTag(data: { name: string; slug?: string }) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user?.id || !isAdmin) {
    throw new Error("Unauthorized: Only author admin can manage tags.");
  }

  const cleanName = data.name.trim();
  if (!cleanName) {
    return { success: false, error: "Tag name cannot be empty." };
  }

  const targetSlug = data.slug?.trim() ? slugify(data.slug) : slugify(cleanName);
  if (!targetSlug) {
    return { success: false, error: "Invalid tag slug generated." };
  }

  try {
    // Check if tag with same name or slug exists
    const existing = await db.tag.findFirst({
      where: {
        OR: [
          { name: { equals: cleanName, mode: "insensitive" } },
          { slug: targetSlug },
        ],
      },
    });

    if (existing) {
      return { success: false, error: `Tag already exists with name "${existing.name}" or slug "${existing.slug}".` };
    }

    const tag = await db.tag.create({
      data: {
        name: cleanName,
        slug: targetSlug,
      },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/tags");
    revalidatePath("/studio/posts");
    return { success: true, tag };
  } catch (error: any) {
    console.error("Error creating tag:", error);
    return { success: false, error: error.message || "Failed to create tag." };
  }
}

export async function updateTag(data: { id: string; name: string; slug?: string }) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user?.id || !isAdmin) {
    throw new Error("Unauthorized: Only author admin can manage tags.");
  }

  const cleanName = data.name.trim();
  if (!cleanName) {
    return { success: false, error: "Tag name cannot be empty." };
  }

  const targetSlug = data.slug?.trim() ? slugify(data.slug) : slugify(cleanName);
  if (!targetSlug) {
    return { success: false, error: "Invalid tag slug." };
  }

  try {
    // Check for collision with other tags
    const collision = await db.tag.findFirst({
      where: {
        id: { not: data.id },
        OR: [
          { name: { equals: cleanName, mode: "insensitive" } },
          { slug: targetSlug },
        ],
      },
    });

    if (collision) {
      return { success: false, error: `Another tag already exists with name "${collision.name}" or slug "${collision.slug}".` };
    }

    const tag = await db.tag.update({
      where: { id: data.id },
      data: {
        name: cleanName,
        slug: targetSlug,
      },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/tags");
    revalidatePath("/studio/posts");
    return { success: true, tag };
  } catch (error: any) {
    console.error("Error updating tag:", error);
    return { success: false, error: error.message || "Failed to update tag." };
  }
}

export async function deleteTag(id: string) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user?.id || !isAdmin) {
    throw new Error("Unauthorized: Only author admin can manage tags.");
  }

  try {
    await db.tag.delete({
      where: { id },
    });

    revalidatePath("/studio");
    revalidatePath("/studio/tags");
    revalidatePath("/studio/posts");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting tag:", error);
    return { success: false, error: error.message || "Failed to delete tag." };
  }
}
