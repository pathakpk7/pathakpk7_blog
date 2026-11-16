import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawUrl = process.env.DATABASE_URL || "";
    // Mask password
    const maskedUrl = rawUrl.replace(/:([^@]+)@/, ":****@");

    const [totalPosts, codingPosts, ideasPosts, samplePosts] = await Promise.all([
      db.post.count(),
      db.post.findMany({
        where: { section: "coding", status: "PUBLISHED" },
        select: { id: true, title: true, section: true, status: true },
      }),
      db.post.findMany({
        where: { section: "ideas", status: "PUBLISHED" },
        select: { id: true, title: true, section: true, status: true },
      }),
      db.post.findMany({
        take: 5,
        select: { id: true, title: true, section: true, status: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      maskedUrl,
      totalPosts,
      codingPostsCount: codingPosts.length,
      ideasPostsCount: ideasPosts.length,
      codingPosts,
      ideasPosts,
      samplePosts,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
