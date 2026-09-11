"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { calculateReadingTime } from "@/lib/utils";

interface PostInput {
  id?: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  content: string;
  section: string;
  contentType: string;
  status: "DRAFT" | "REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  coverImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  scheduledAt?: string | null;
}

export async function savePost(input: PostInput) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user?.id || !isAdmin) {
    throw new Error("Unauthorized: Only author admin can save posts.");
  }

  const readingTime = calculateReadingTime(input.content);
  const isPublishing = input.status === "PUBLISHED";
  const publishedAt = isPublishing ? new Date() : undefined;

  let post;
  if (input.id) {
    post = await db.post.update({
      where: { id: input.id },
      data: {
        title: input.title,
        slug: input.slug,
        subtitle: input.subtitle || null,
        excerpt: input.excerpt || null,
        content: input.content,
        section: input.section,
        contentType: input.contentType as any,
        status: input.status,
        coverImageUrl: input.coverImageUrl || null,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        featured: !!input.featured,
        readingTime,
        publishedAt: isPublishing ? publishedAt : undefined,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      },
    });

    // Save revision
    await db.postRevision.create({
      data: {
        postId: post.id,
        title: post.title,
        content: post.content,
        version: Math.floor(Date.now() / 1000),
      },
    });
  } else {
    post = await db.post.create({
      data: {
        authorId: session.user.id,
        title: input.title,
        slug: input.slug,
        subtitle: input.subtitle || null,
        excerpt: input.excerpt || null,
        content: input.content,
        section: input.section,
        contentType: input.contentType as any,
        status: input.status,
        coverImageUrl: input.coverImageUrl || null,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        featured: !!input.featured,
        readingTime,
        publishedAt: isPublishing ? new Date() : null,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/studio/posts");
  revalidatePath(`/article/${post.slug}`);

  return { success: true, post };
}

export async function deletePost(postId: string) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user?.id || !isAdmin) {
    throw new Error("Unauthorized");
  }

  await db.post.delete({ where: { id: postId } });
  revalidatePath("/studio/posts");
  return { success: true };
}
