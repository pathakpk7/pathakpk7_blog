import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { ContentType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q") || "";
    const q = rawQuery.trim();

    if (!q) {
      return NextResponse.json({
        posts: [],
        authors: [],
        tags: [],
        mode: "all",
      });
    }

    const isTagSearch = q.startsWith("#");
    const isAuthorSearch = q.startsWith("@");

    // 1. Tag-specific Search (#tag)
    if (isTagSearch) {
      const tagTerm = q.slice(1).trim();

      const [matchedTags, taggedPosts] = await Promise.all([
        db.tag.findMany({
          where: tagTerm
            ? {
                OR: [
                  { name: { contains: tagTerm, mode: "insensitive" } },
                  { slug: { contains: tagTerm, mode: "insensitive" } },
                ],
              }
            : undefined,
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { posts: true } },
          },
          take: 8,
          orderBy: { posts: { _count: "desc" } },
        }),
        db.post.findMany({
          where: {
            status: "PUBLISHED",
            ...(tagTerm
              ? {
                  tags: {
                    some: {
                      tag: {
                        OR: [
                          { name: { contains: tagTerm, mode: "insensitive" } },
                          { slug: { contains: tagTerm, mode: "insensitive" } },
                        ],
                      },
                    },
                  },
                }
              : {}),
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
            author: {
              select: {
                name: true,
                profile: {
                  select: { displayName: true, username: true, avatarUrl: true },
                },
              },
            },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
          },
          take: 15,
          orderBy: { publishedAt: "desc" },
        }),
      ]);

      const formattedTags = matchedTags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        postCount: t._count.posts,
      }));

      return NextResponse.json({
        posts: taggedPosts,
        authors: [],
        tags: formattedTags,
        mode: "tag",
      });
    }

    // 2. Author / User Search (@user)
    if (isAuthorSearch) {
      const authorTerm = q.slice(1).trim();

      const [matchedUsers, authorPosts] = await Promise.all([
        db.user.findMany({
          where: authorTerm
            ? {
                OR: [
                  { name: { contains: authorTerm, mode: "insensitive" } },
                  { profile: { username: { contains: authorTerm, mode: "insensitive" } } },
                  { profile: { displayName: { contains: authorTerm, mode: "insensitive" } } },
                ],
              }
            : undefined,
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            profile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
              },
            },
            _count: {
              select: {
                posts: { where: { status: "PUBLISHED" } },
              },
            },
          },
          take: 8,
          orderBy: { createdAt: "asc" },
        }),
        db.post.findMany({
          where: {
            status: "PUBLISHED",
            ...(authorTerm
              ? {
                  author: {
                    OR: [
                      { name: { contains: authorTerm, mode: "insensitive" } },
                      { profile: { username: { contains: authorTerm, mode: "insensitive" } } },
                      { profile: { displayName: { contains: authorTerm, mode: "insensitive" } } },
                    ],
                  },
                }
              : {}),
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
            author: {
              select: {
                name: true,
                profile: {
                  select: { displayName: true, username: true, avatarUrl: true },
                },
              },
            },
            tags: { select: { tag: { select: { name: true, slug: true } } } },
          },
          take: 15,
          orderBy: { publishedAt: "desc" },
        }),
      ]);

      const formattedAuthors = matchedUsers.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.profile?.username || (u.name ? u.name.toLowerCase().replace(/\s+/g, "_") : "user"),
        displayName: u.profile?.displayName || u.name || "Reader",
        avatarUrl: u.profile?.avatarUrl || u.image,
        role: u.role,
        bio: u.profile?.bio,
        postCount: u._count.posts,
      }));

      return NextResponse.json({
        posts: authorPosts,
        authors: formattedAuthors,
        tags: [],
        mode: "author",
      });
    }

    // 3. General Universal Search (Headings, Keywords, Tags, Content, Authors)
    const queryClean = q.toUpperCase().replace(/S$/, "");
    const matchedType = Object.values(ContentType).includes(queryClean as ContentType)
      ? (queryClean as ContentType)
      : Object.values(ContentType).find((ct) => ct.toLowerCase().includes(q.toLowerCase()));

    const orConditions: any[] = [
      { title: { contains: q, mode: "insensitive" } },
      { subtitle: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { section: { contains: q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      { author: { name: { contains: q, mode: "insensitive" } } },
      { author: { profile: { username: { contains: q, mode: "insensitive" } } } },
      { author: { profile: { displayName: { contains: q, mode: "insensitive" } } } },
    ];

    if (matchedType) {
      orConditions.push({ contentType: matchedType });
    }

    const [posts, matchingTags, matchingUsers] = await Promise.all([
      db.post.findMany({
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
          author: {
            select: {
              name: true,
              profile: {
                select: { displayName: true, username: true, avatarUrl: true },
              },
            },
          },
          tags: { select: { tag: { select: { name: true, slug: true } } } },
        },
        take: 15,
        orderBy: { publishedAt: "desc" },
      }),
      db.tag.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { posts: true } },
        },
        take: 4,
      }),
      db.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { profile: { username: { contains: q, mode: "insensitive" } } },
            { profile: { displayName: { contains: q, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          profile: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          _count: {
            select: {
              posts: { where: { status: "PUBLISHED" } },
            },
          },
        },
        take: 3,
      }),
    ]);

    const formattedTags = matchingTags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      postCount: t._count.posts,
    }));

    const formattedAuthors = matchingUsers.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.profile?.username || (u.name ? u.name.toLowerCase().replace(/\s+/g, "_") : "user"),
      displayName: u.profile?.displayName || u.name || "Reader",
      avatarUrl: u.profile?.avatarUrl || u.image,
      role: u.role,
      bio: u.profile?.bio,
      postCount: u._count.posts,
    }));

    return NextResponse.json({
      posts,
      authors: formattedAuthors,
      tags: formattedTags,
      mode: "all",
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { posts: [], authors: [], tags: [], mode: "all", error: "Search failed" },
      { status: 500 }
    );
  }
}
