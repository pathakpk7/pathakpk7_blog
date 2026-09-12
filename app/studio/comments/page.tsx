import { db } from "@/lib/db/prisma";
import { CommentModerationList } from "@/components/studio/CommentModerationList";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudioCommentsPage() {
  const comments = await db.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { title: true, slug: true } },
      user: { include: { profile: true } },
    },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center space-x-2 text-blue-400 mb-1">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider">Discourse & Community</span>
        </div>
        <h1 className="text-3xl font-bold font-serif-editorial text-white">Comment Moderation</h1>
        <p className="text-xs text-zinc-400">
          Review reader discussions, approve pending comments, toggle statuses, and revert moderation decisions anytime.
        </p>
      </div>

      <CommentModerationList initialComments={comments as any} />
    </div>
  );
}
