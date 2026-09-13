import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { ContentType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  const queryClean = q.trim().toUpperCase().replace(/S$/, "");
  const matchedType = Object.values(ContentType).includes(queryClean as ContentType)
    ? (queryClean as ContentType)
    : Object.values(ContentType).find((ct) => ct.toLowerCase().includes(q.toLowerCase().trim()));

  try {
    const orConditions: any[] = [
      { title: { contains: q, mode: "insensitive" } },
      { subtitle: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { section: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
    ];

    if (matchedType) {
      orConditions.push({ contentType: matchedType });
    }

    const posts = await db.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: orConditions,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        excerpt: true,
        section: true,
        contentType: true,
        readingTime: true,
        publishedAt: true,
      },
      take: 10,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ results: posts });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
