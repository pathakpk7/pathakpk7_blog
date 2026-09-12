"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { calculateReadingTime } from "@/lib/utils";

function slugifyTag(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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
  tags?: string[];
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

  // Handle Tags linking
  if (Array.isArray(input.tags)) {
    const tagIds: string[] = [];
    for (const rawTag of input.tags) {
      const cleanName = rawTag.trim();
      const tagSlug = slugifyTag(cleanName);
      if (!cleanName || !tagSlug) continue;

      const tagRecord = await db.tag.upsert({
        where: { slug: tagSlug },
        update: { name: cleanName },
        create: { name: cleanName, slug: tagSlug },
      });
      if (tagRecord?.id && !tagIds.includes(tagRecord.id)) {
        tagIds.push(tagRecord.id);
      }
    }

    // Replace post tags
    await db.postTag.deleteMany({
      where: { postId: post.id },
    });

    if (tagIds.length > 0) {
      await db.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
        skipDuplicates: true,
      });
    }
  }

  // Thoroughly revalidate all affected public and studio paths
  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath("/studio/posts");
  revalidatePath("/studio/tags");
  revalidatePath(`/${input.section}`);
  revalidatePath(`/${post.section}`);
  revalidatePath(`/article/${post.slug}`);
  if (input.slug && input.slug !== post.slug) {
    revalidatePath(`/article/${input.slug}`);
  }

  return { success: true, post };
}

export async function deletePost(postId: string) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user?.id || !isAdmin) {
    throw new Error("Unauthorized");
  }

  const existing = await db.post.findUnique({ where: { id: postId }, select: { slug: true, section: true } });
  await db.post.delete({ where: { id: postId } });

  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath("/studio/posts");
  if (existing) {
    revalidatePath(`/${existing.section}`);
    revalidatePath(`/article/${existing.slug}`);
  }
  return { success: true };
}
