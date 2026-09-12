import { db } from "@/lib/db/prisma";
import { TagsManager } from "@/components/studio/TagsManager";

export const dynamic = "force-dynamic";

export default async function StudioTagsPage() {
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return <TagsManager initialTags={tags as any} />;
}
