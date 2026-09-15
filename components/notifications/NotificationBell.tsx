"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Heart, MessageSquare, Bookmark, ChevronRight, ExternalLink, CheckCheck } from "lucide-react";
import { getAggregatedNotifications, AggregatedPostNotification } from "@/app/actions/notification";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";

interface NotificationBellProps {
  variant?: "header" | "studio";
}

export function NotificationBell({ variant = "header" }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<AggregatedPostNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications non-blockingly
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAggregatedNotifications();
      setNotifications(data.notifications);

      const lastRead = localStorage.getItem("admin_notifications_last_read");
      if (lastRead) {
        const lastReadTime = new Date(lastRead).getTime();
        const unread = data.notifications.filter(
          (n) => new Date(n.latestTimestamp).getTime() > lastReadTime
        ).length;
        setUnreadCount(unread);
      } else {
        setUnreadCount(data.notifications.length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Slight deferral on mount to prioritize initial page load
    const timer = setTimeout(() => {
      loadNotifications();
    }, 600);

    const interval = setInterval(loadNotifications, 120000); // refresh every 2 mins
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAllRead = () => {
    localStorage.setItem("admin_notifications_last_read", new Date().toISOString());
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) {
            loadNotifications();
          }
        }}
        className={`relative p-2 rounded-full transition-all active:scale-95 ${
          variant === "studio"
            ? "text-zinc-300 hover:text-white hover:bg-zinc-800"
            : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
        title="Admin Notifications & Interaction Digest"
        aria-label="Admin Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-serif-editorial text-zinc-900 dark:text-zinc-100 tracking-tight">
                Post Interactions
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800/60">
                  {unreadCount} new
                </span>
              ) : (
                <span className="text-[10px] text-zinc-400">All caught up</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
              <Link
                href="/studio/notifications"
                onClick={() => setOpen(false)}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center space-x-0.5"
              >
                <span>Full View</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* List of aggregated notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">Loading interactions...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <Bell className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-600 stroke-1" />
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">No recent interactions yet</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  When readers like, comment, or bookmark your posts, you will see clean aggregated summaries here.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isExpanded = expandedId === item.id;
                const recentUsersText =
                  item.interactors.length === 1
                    ? `@${item.interactors[0].username}`
                    : item.interactors.length === 2
                    ? `@${item.interactors[0].username} and @${item.interactors[1].username}`
                    : `@${item.interactors[0].username} and ${item.interactors.length - 1} others`;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-left space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/article/${item.postSlug}`}
                        onClick={() => setOpen(false)}
                        className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 flex-1 flex items-center space-x-1"
                      >
                        <span>{item.postTitle}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                      </Link>
                      <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                        {formatDate(item.latestTimestamp)}
                      </span>
                    </div>

                    {/* Interaction Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      {item.likesCount > 0 && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40 font-medium">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>{item.likesCount} {item.likesCount === 1 ? "like" : "likes"}</span>
                        </span>
                      )}
                      {item.commentsCount > 0 && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40 font-medium">
                          <MessageSquare className="w-3 h-3 text-blue-500" />
                          <span>{item.commentsCount} {item.commentsCount === 1 ? "comment" : "comments"}</span>
                        </span>
                      )}
                      {item.bookmarksCount > 0 && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 font-medium">
                          <Bookmark className="w-3 h-3 text-amber-500" />
                          <span>{item.bookmarksCount} {item.bookmarksCount === 1 ? "save" : "saves"}</span>
                        </span>
                      )}
                    </div>

                    {/* Interactor Avatars & summary */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {item.interactors.slice(0, 3).map((user, idx) => (
                            <div
                              key={idx}
                              className="relative w-5 h-5 rounded-full ring-2 ring-white dark:ring-zinc-900 overflow-hidden bg-zinc-800 shrink-0"
                            >
                              <Image
                                src={getSafeAvatarUrl(user.avatarUrl, user.username)}
                                alt={user.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {recentUsersText}
                        </span>
                      </div>

                      {item.sampleComments.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {isExpanded ? "Hide replies" : "View comments"}
                        </button>
                      )}
                    </div>

                    {/* Expandable comments preview */}
                    {isExpanded && item.sampleComments.length > 0 && (
                      <div className="mt-2 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-in fade-in duration-100">
                        {item.sampleComments.map((c) => (
                          <div key={c.id} className="text-[11px] space-y-0.5">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{c.author}: </span>
                            <span className="text-zinc-600 dark:text-zinc-400 italic">"{c.content}"</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <Link
              href="/studio/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>Go to Notifications Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
