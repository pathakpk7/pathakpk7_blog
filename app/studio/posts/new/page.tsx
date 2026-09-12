import { db } from "@/lib/db/prisma";
import { PostEditor } from "@/components/studio/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const availableTags = await db.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return <PostEditor availableTags={availableTags} />;
}
