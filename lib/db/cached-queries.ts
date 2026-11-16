import { unstable_cache } from "next/cache";
import { db } from "./prisma";

// Cached Homepage data - in-memory/disk cached for 120s
export const getCachedHomePageData = unstable_cache(
  async () => {
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

      return {
        featuredPosts: latestPosts,
        techPosts: tech,
        sciencePosts: science,
        codingPosts: coding,
        creativePosts: creative,
        notesPosts: notes,
      };
    } catch (err) {
      console.warn("Cached HomePage query fallback:", err);
      return {
        featuredPosts: [],
        techPosts: [],
        sciencePosts: [],
        codingPosts: [],
        creativePosts: [],
        notesPosts: [],
      };
    }
  },
  ["homepage-data-cache"],
  { revalidate: 120, tags: ["posts"] }
);

// Cached Section data - in-memory cached per section and filter
export const getCachedSectionData = (section: string, typeFilter?: string) => {
  const cacheKey = `section-${section}-${typeFilter || "all"}`;
  return unstable_cache(
    async () => {
      try {
        const whereClause: any = {
          status: "PUBLISHED",
          section: section,
        };

        if (typeFilter && typeFilter !== "ALL") {
          whereClause.contentType = typeFilter;
          const [filteredPosts, allPosts] = await Promise.all([
            db.post.findMany({
              where: whereClause,
              include: {
                author: { include: { profile: true } },
                tags: { include: { tag: true } },
              },
              orderBy: { publishedAt: "desc" },
            }),
            db.post.findMany({
              where: { status: "PUBLISHED", section },
              select: { contentType: true },
            }),
          ]);

          return {
            posts: filteredPosts,
            allSectionPostTypes: Array.from(new Set(allPosts.map((p) => p.contentType))),
          };
        } else {
          const posts = await db.post.findMany({
            where: whereClause,
            include: {
              author: { include: { profile: true } },
              tags: { include: { tag: true } },
            },
            orderBy: { publishedAt: "desc" },
          });

          return {
            posts,
            allSectionPostTypes: Array.from(new Set(posts.map((p) => p.contentType))),
          };
        }
      } catch (err) {
        console.warn("Cached Section query fallback:", err);
        return { posts: [], allSectionPostTypes: [] };
      }
    },
    [cacheKey],
    { revalidate: 120, tags: ["posts", `section-${section}`] }
  )();
};

// Cached Article data - in-memory cached per article slug
export const getCachedArticleData = (slug: string) => {
  return unstable_cache(
    async () => {
      try {
        return await db.post.findUnique({
          where: { slug },
          include: {
            author: {
              include: { profile: true },
            },
            category: true,
            tags: { include: { tag: true } },
            likes: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    profile: {
                      select: {
                        displayName: true,
                        username: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            bookmarks: true,
            comments: {
              where: { parentId: null, status: "APPROVED" },
              include: {
                user: { include: { profile: true } },
                likes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        profile: { select: { displayName: true, username: true, avatarUrl: true } },
                      },
                    },
                  },
                },
                replies: {
                  where: { status: "APPROVED" },
                  include: {
                    user: { include: { profile: true } },
                    likes: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                            image: true,
                            profile: { select: { displayName: true, username: true, avatarUrl: true } },
                          },
                        },
                      },
                    },
                  },
                  orderBy: { createdAt: "asc" },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
      } catch (err) {
        console.warn("Cached Article query fallback:", err);
        return null;
      }
    },
    [`article-${slug}`],
    { revalidate: 300, tags: ["posts", `post-${slug}`] }
  )();
};

// Cached Related Posts
export const getCachedRelatedPosts = (section: string, postId: string) => {
  return unstable_cache(
    async () => {
      try {
        return await db.post.findMany({
          where: {
            status: "PUBLISHED",
            section: section,
            NOT: { id: postId },
          },
          take: 3,
          orderBy: { publishedAt: "desc" },
          include: {
            author: { include: { profile: true } },
          },
        });
      } catch (err) {
        console.warn("Cached Related Posts fallback:", err);
        return [];
      }
    },
    [`related-${section}-${postId}`],
    { revalidate: 300, tags: ["posts"] }
  )();
};
