import { db } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { updateCommentStatus } from "@/app/actions/moderation";
import { Check, X, ShieldAlert, Trash2, MessageSquare } from "lucide-react";

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
        <h1 className="text-3xl font-bold font-serif-editorial text-white">Comment Moderation</h1>
        <p className="text-xs text-zinc-400">Review reader discussions, approve pending comments, and manage spam.</p>
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden divide-y divide-zinc-800">
        {comments.length === 0 ? (
          <p className="p-12 text-sm text-zinc-400 italic text-center">No comments submitted yet.</p>
        ) : (
          comments.map((comment) => {
            const authorName = comment.user.profile?.displayName || comment.user.name || "Reader";
            return (
              <div key={comment.id} className="p-6 space-y-4 hover:bg-zinc-800/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{authorName}</span>
                    <span className="text-zinc-500">on</span>
                    <span className="font-serif-editorial font-bold text-blue-400">{comment.post.title}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-zinc-400 font-mono text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-semibold uppercase ${
                      comment.status === "APPROVED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" :
                      comment.status === "PENDING" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                      "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}>
                      {comment.status}
                    </span>
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                  {comment.content}
                </p>

                {/* Moderation Controls */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <form action={updateCommentStatus.bind(null, comment.id, "APPROVED")}>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </form>

                  <form action={updateCommentStatus.bind(null, comment.id, "REJECTED")}>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </form>

                  <form action={updateCommentStatus.bind(null, comment.id, "SPAM")}>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 hover:bg-amber-900 text-xs font-semibold"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Spam</span>
                    </button>
                  </form>

                  <form action={updateCommentStatus.bind(null, comment.id, "DELETED")}>
                    <button
                      type="submit"
                      className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
