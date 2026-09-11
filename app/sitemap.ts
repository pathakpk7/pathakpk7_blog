import { MetadataRoute } from "next";
import { db } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thepathak.tech";

  let postUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    postUrls = posts.map((post) => ({
      url: `${baseUrl}/article/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.warn("Sitemap DB query skipped (database offline or placeholder credentials):", error);
  }

  const sections = ["technology", "science", "coding", "ideas", "creative", "notes"];
  const sectionUrls = sections.map((sec) => ({
    url: `${baseUrl}/${sec}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...sectionUrls,
    ...postUrls,
  ];
}
