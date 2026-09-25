import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Heart,
  MessageSquare,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { getUserNotifications } from "@/app/actions/notification";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

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

  const { personalNotifications, adminAggregatedNotifications } = await getUserNotifications();

  // Aggregate stats across all batches
  const totalLikes = adminAggregatedNotifications.reduce((acc, curr) => acc + curr.likesCount, 0);
  const totalComments = adminAggregatedNotifications.reduce((acc, curr) => acc + curr.commentsCount, 0);
  const totalBookmarks = adminAggregatedNotifications.reduce((acc, curr) => acc + curr.bookmarksCount, 0);
  const totalInteractionsCount = adminAggregatedNotifications.reduce((acc, curr) => acc + curr.totalInteractions, 0);

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

      {/* Main Notification Center */}
      <NotificationCenter
        initialPersonalNotifications={personalNotifications}
        initialAdminNotifications={adminAggregatedNotifications}
        isAdmin={isAdmin}
        viewMode="full"
      />
    </div>
  );
}
