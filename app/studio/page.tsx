import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { FileText, Eye, Heart, Bookmark, MessageSquare, Clock, PlusCircle, Edit3 } from "lucide-react";

export default async function StudioDashboardPage() {
  const [
    draftsCount,
    publishedCount,
    scheduledCount,
    totalViews,
    totalLikes,
    totalBookmarks,
    pendingCommentsCount,
    recentDrafts,
  ] = await Promise.all([
    db.post.count({ where: { status: "DRAFT" } }),
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.post.count({ where: { status: "SCHEDULED" } }),
    db.postView.count(),
    db.like.count(),
    db.bookmark.count(),
    db.comment.count({ where: { status: "PENDING" } }),
    db.post.findMany({
      where: { status: { in: ["DRAFT", "REVIEW", "SCHEDULED"] } },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif-editorial text-white">Writer Studio Overview</h1>
          <p className="text-xs text-zinc-400">Manage publications, review drafts, and track reader engagement.</p>
        </div>
        <Link
          href="/studio/posts/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Publication</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Drafts</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{draftsCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Published</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{publishedCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Scheduled</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{scheduledCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Total Views</span>
            <Eye className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{totalViews}</p>
        </div>
      </div>

      {/* Engagement Summary & Recent Drafts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Drafts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif-editorial text-white">Recent Drafts & Queue</h2>
            <Link href="/studio/posts" className="text-xs text-blue-400 hover:underline">
              View all posts
            </Link>
          </div>

          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
            {recentDrafts.length === 0 ? (
              <p className="p-6 text-sm text-zinc-400 italic text-center">No active drafts. Ready to start a new article!</p>
            ) : (
              recentDrafts.map((post) => (
                <div key={post.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-semibold uppercase">{post.status}</span>
                      <span className="text-zinc-400 uppercase">{post.section}</span>
                    </div>
                    <h4 className="text-base font-bold text-white font-serif-editorial">{post.title}</h4>
                    <p className="text-xs text-zinc-400">Last saved {formatDate(post.updatedAt)}</p>
                  </div>
                  <Link
                    href={`/studio/posts/${post.id}/edit`}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center space-x-1 shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engagement Quick Stats */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-serif-editorial text-white">Reader Activity</h2>
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-zinc-300">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Total Likes</span>
              </div>
              <span className="font-mono text-lg font-bold text-white">{totalLikes}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-zinc-300">
                <Bookmark className="w-4 h-4 text-blue-400" />
                <span>Bookmarked</span>
              </div>
              <span className="font-mono text-lg font-bold text-white">{totalBookmarks}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-sm text-zinc-300">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Pending Comments</span>
              </div>
              <span className="font-mono text-lg font-bold text-white">{pendingCommentsCount}</span>
            </div>

            {pendingCommentsCount > 0 && (
              <div className="pt-2 border-t border-zinc-800">
                <Link
                  href="/studio/comments"
                  className="block text-center py-2 px-4 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition-colors"
                >
                  Review Pending Comments
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
