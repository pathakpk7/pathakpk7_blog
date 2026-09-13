import { db } from "@/lib/db/prisma";
import { Eye, Heart, Bookmark, MessageSquare, TrendingUp, AlertCircle, ArrowUpRight, Edit3 } from "lucide-react";
import Link from "next/link";
import { DeletePostButton } from "@/components/article/DeletePostButton";

export default async function StudioAnalyticsPage() {
  const [
    totalViews,
    totalLikes,
    totalBookmarks,
    totalApprovedComments,
    totalPendingComments,
    postsWithViews,
  ] = await Promise.all([
    db.postView.count({ where: { post: { status: "PUBLISHED" } } }),
    db.like.count({ where: { post: { status: "PUBLISHED" } } }),
    db.bookmark.count({ where: { post: { status: "PUBLISHED" } } }),
    db.comment.count({ where: { status: "APPROVED", post: { status: "PUBLISHED" } } }),
    db.comment.count({ where: { status: "PENDING" } }),
    db.post.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        section: true,
        publishedAt: true,
        _count: {
          select: {
            views: true,
            likes: true,
            bookmarks: true,
            comments: { where: { status: "APPROVED" } },
          },
        },
      },
      orderBy: { views: { _count: "desc" } },
      take: 15,
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold font-serif-editorial text-white">First-Party Publishing Analytics</h1>
        <p className="text-xs text-zinc-400">Track verified article views, reader likes, saved library bookmarks, and discussion discourse.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold font-mono">Total Pageviews</span>
            <Eye className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-white font-mono">{totalViews}</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold font-mono">Total Likes</span>
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-white font-mono">{totalLikes}</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold font-mono">Saved in Library</span>
            <Bookmark className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-white font-mono">{totalBookmarks}</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold font-mono">Approved Comments</span>
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl sm:text-4xl font-bold text-white font-mono">{totalApprovedComments}</p>
            {totalPendingComments > 0 && (
              <Link
                href="/studio/comments"
                className="text-[11px] font-mono font-semibold text-amber-400 hover:underline flex items-center space-x-1"
                title={`${totalPendingComments} pending review`}
              >
                <span>+{totalPendingComments} pending</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Top Articles Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold font-serif-editorial text-white">Top Performing Articles</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {postsWithViews.length} publications tracked
          </span>
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Article Title</th>
                  <th className="px-4 py-4">Section</th>
                  <th className="px-4 py-4 text-center">Views</th>
                  <th className="px-4 py-4 text-center">Likes</th>
                  <th className="px-4 py-4 text-center">Bookmarks</th>
                  <th className="px-4 py-4 text-center">Approved Comments</th>
                  <th className="px-6 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {postsWithViews.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white max-w-xs sm:max-w-md truncate">
                      <Link href={`/article/${post.slug}`} target="_blank" className="font-serif-editorial text-sm font-semibold hover:text-blue-400">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4 uppercase font-mono text-[10px] text-zinc-400">{post.section}</td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-purple-400">{post._count.views}</td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-rose-400">{post._count.likes}</td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-blue-400">{post._count.bookmarks}</td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-emerald-400">{post._count.comments}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/studio/posts/${post.id}/edit`}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 inline-flex items-center space-x-1"
                          title="Edit in Studio"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/article/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 inline-flex items-center space-x-1"
                          title="Open live article"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
                          variant="icon"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
