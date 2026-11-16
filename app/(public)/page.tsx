import { db } from "@/lib/db/prisma";
import { HomePageClient } from "@/components/home/HomePageClient";

export const revalidate = 60;

export default async function HomePage() {
  let featuredPosts: any[] = [];
  let techPosts: any[] = [];
  let sciencePosts: any[] = [];
  let codingPosts: any[] = [];
  let creativePosts: any[] = [];
  let notesPosts: any[] = [];

  try {
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
        where: { status: "PUBLISHED", section: "technology" },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "science" },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "coding" },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "creative" },
        take: 2,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } }, tags: { include: { tag: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "notes" },
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
