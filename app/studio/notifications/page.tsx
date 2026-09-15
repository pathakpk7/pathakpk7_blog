import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Heart,
  MessageSquare,
  Bookmark,
  TrendingUp,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { getAggregatedNotifications } from "@/app/actions/notification";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";

export const metadata = {
  title: "Notifications & Interaction Feed | Writer Studio",
};

export default async function StudioNotificationsPage() {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user || !isAdmin) {
    redirect("/");
  }

  const { notifications, totalInteractionsCount } = await getAggregatedNotifications();

  // Aggregate stats across all batches
  const totalLikes = notifications.reduce((acc, curr) => acc + curr.likesCount, 0);
  const totalComments = notifications.reduce((acc, curr) => acc + curr.commentsCount, 0);
  const totalBookmarks = notifications.reduce((acc, curr) => acc + curr.bookmarksCount, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Post Interaction Feed
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 pl-1">
            Aggregated notifications for reader engagement across all your articles and essays.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/studio/comments"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Moderate Comments</span>
          </Link>
          <Link
            href="/studio/analytics"
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Interactions</p>
          <p className="text-2xl font-bold text-white font-mono">{totalInteractionsCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-rose-400">Total Likes</p>
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
          </div>
          <p className="text-2xl font-bold text-rose-300 font-mono">{totalLikes}</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-blue-400">Total Comments</p>
            <MessageSquare className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-300 font-mono">{totalComments}</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Bookmarks Saved</p>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 font-mono">{totalBookmarks}</p>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-300 uppercase font-mono tracking-wider">
            Recent Post Activity Batches ({notifications.length})
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Auto-grouped per post</span>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-zinc-600" />
            <h3 className="text-sm font-semibold text-zinc-300">No reader interactions yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Once visitors engage with your published content by reacting, bookmarking, or commenting, smart summaries will populate here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((batch) => {
              return (
                <div
                  key={batch.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-zinc-500 font-semibold tracking-wider">
                        Target Article
                      </span>
                      <Link
                        href={`/article/${batch.postSlug}`}
                        className="group flex items-center space-x-1.5 text-base font-bold text-white hover:text-blue-400 transition-colors"
                      >
                        <span>{batch.postTitle}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                      <span>Latest activity:</span>
                      <span className="text-zinc-200 font-semibold">{formatDate(batch.latestTimestamp)}</span>
                    </div>
                  </div>

                  {/* Summary Counts Bar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-zinc-400 text-xs font-medium">Batch breakdown:</span>
                    {batch.likesCount > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{batch.likesCount} {batch.likesCount === 1 ? "Like" : "Likes"}</span>
                      </span>
                    )}
                    {batch.commentsCount > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>{batch.commentsCount} {batch.commentsCount === 1 ? "Comment" : "Comments"}</span>
                      </span>
                    )}
                    {batch.bookmarksCount > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        <span>{batch.bookmarksCount} {batch.bookmarksCount === 1 ? "Save" : "Saves"}</span>
                      </span>
                    )}
                  </div>

                  {/* Engaged Readers List */}
                  <div className="pt-1">
                    <p className="text-[11px] font-mono text-zinc-400 mb-2 uppercase tracking-wider">
                      Interacting Readers ({batch.interactors.length}):
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {batch.interactors.map((user, idx) => (
                        <Link
                          key={idx}
                          href={`/${user.username}`}
                          className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 transition-colors text-xs text-zinc-200"
                        >
                          <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-950 border border-zinc-700 shrink-0">
                            <Image
                              src={getSafeAvatarUrl(user.avatarUrl, user.username)}
                              alt={user.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{user.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">@{user.username}</span>
                          <span className="text-[10px] font-mono px-1 rounded bg-zinc-900 text-zinc-400 uppercase">
                            {user.type}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Sample comments if any */}
                  {batch.sampleComments.length > 0 && (
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                      <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        <span>Recent Comments Preview</span>
                      </p>
                      <div className="space-y-2 divide-y divide-zinc-800/60">
                        {batch.sampleComments.map((comment) => (
                          <div key={comment.id} className="pt-1.5 text-xs text-zinc-300">
                            <span className="font-semibold text-white">{comment.author}: </span>
                            <span className="italic text-zinc-300">"{comment.content}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/article/${batch.postSlug}#comments`}
                      className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-medium group"
                    >
                      <span>Jump to article discussion</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
