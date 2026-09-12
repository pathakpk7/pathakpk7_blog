import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { PostEditor } from "@/components/studio/PostEditor";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post, availableTags] = await Promise.all([
    db.post.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    }),
    db.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!post) {
    notFound();
  }

  return <PostEditor initialPost={post as any} availableTags={availableTags} />;
}
