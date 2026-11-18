import { db } from "@/lib/db/prisma";
import { HomePageClient } from "@/components/home/HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featuredPosts: any[] = [];
  let techPosts: any[] = [];
  let sciencePosts: any[] = [];
  let codingPosts: any[] = [];
  let creativePosts: any[] = [];
  let notesPosts: any[] = [];

  try {
    const secMatch = (key: string, aliases: string[]) => ({
      OR: [
        { section: { equals: key, mode: "insensitive" as const } },
        { section: { contains: key, mode: "insensitive" as const } },
        { category: { slug: { equals: key, mode: "insensitive" as const } } },
        ...aliases.map((a) => ({ section: { equals: a, mode: "insensitive" as const } })),
        ...aliases.map((a) => ({ section: { contains: a, mode: "insensitive" as const } })),
      ],
    });

    const [latestPosts, tech, science, coding, creative, notes] = await Promise.all([
      db.post.findMany({
        where: { status: "PUBLISHED" },
        take: 1,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { include: { profile: true } },
          tags: { include: { tag: true } },
        },
      }),
      db.post.findMany({
        where: {
          status: "PUBLISHED",
          ...secMatch("technology", ["tech", "technology & ai", "ai"]),
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: {
          status: "PUBLISHED",
          ...secMatch("science", ["space", "science & space", "astrophysics"]),
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: {
          status: "PUBLISHED",
          ...secMatch("coding", ["code", "architecture", "coding & architecture", "coding & walkthroughs"]),
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: {
          status: "PUBLISHED",
          ...secMatch("creative", ["poems", "poetry", "creative & poems", "shayari", "quotes"]),
        },
        take: 2,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } }, tags: { include: { tag: true } } },
      }),
      db.post.findMany({
        where: {
          status: "PUBLISHED",
          ...secMatch("notes", ["musings", "notes & musings"]),
        },
        take: 4,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
    ]);

    featuredPosts = latestPosts;
    techPosts = tech;
    sciencePosts = science;
    codingPosts = coding;
    creativePosts = creative;
    notesPosts = notes;
  } catch (err) {
    console.warn("HomePage DB queries fallback:", err);
  }

  return (
    <HomePageClient
      featuredPosts={featuredPosts}
      techPosts={techPosts}
      sciencePosts={sciencePosts}
      codingPosts={codingPosts}
      creativePosts={creativePosts}
      notesPosts={notesPosts}
    />
  );
}
