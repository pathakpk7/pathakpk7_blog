import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { PostEditor } from "@/components/studio/PostEditor";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return <PostEditor initialPost={post as any} />;
}
