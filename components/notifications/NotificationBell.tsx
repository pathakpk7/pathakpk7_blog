"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Heart,
  MessageSquare,
  Bookmark,
  ChevronRight,
  ExternalLink,
  CheckCheck,
  AtSign,
  UserCheck,
  Sparkles,
} from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  UserPersonalNotification,
  AggregatedPostNotification,
} from "@/app/actions/notification";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";

interface NotificationBellProps {
  variant?: "header" | "studio";
}

export function NotificationBell({ variant = "header" }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [personalNotifications, setPersonalNotifications] = useState<UserPersonalNotification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AggregatedPostNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"personal" | "admin">("personal");
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications non-blockingly
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications();
      setPersonalNotifications(data.personalNotifications);
      setAdminNotifications(data.adminAggregatedNotifications);
      setIsAdmin(data.isAdmin);

      const unreadPersonal = data.personalNotifications.filter((n) => !n.read).length;
      let unreadTotal = unreadPersonal;

      if (data.isAdmin) {
        const lastRead = localStorage.getItem("admin_notifications_last_read");
        if (lastRead) {
          const lastReadTime = new Date(lastRead).getTime();
          const unreadAdmin = data.adminAggregatedNotifications.filter(
            (n) => new Date(n.latestTimestamp).getTime() > lastReadTime
          ).length;
          unreadTotal += unreadAdmin;
        } else {
          unreadTotal += data.adminAggregatedNotifications.length;
        }
      }

      setUnreadCount(unreadTotal);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotifications();
    }, 400);

    const interval = setInterval(loadNotifications, 90000); // refresh every 90s
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

  // Handle Mark All Read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      localStorage.setItem("admin_notifications_last_read", new Date().toISOString());
      setPersonalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };

  // Handle single notification click
  const handleItemClick = async (notification: UserPersonalNotification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setPersonalNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {
        console.error("Error marking notification read:", e);
      }
    }
    setOpen(false);
  };

  // Helper for personal notification icon & text
  const renderNotificationContent = (item: UserPersonalNotification) => {
    switch (item.type) {
      case "COMMENT_LIKE":
        return {
          icon: <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />,
          title: (
            <span>
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">{item.actor.name}</strong>{" "}
              liked your comment
            </span>
          ),
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "COMMENT_REPLY":
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-500" />,
          title: (
            <span>
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">{item.actor.name}</strong>{" "}
              replied to your comment
            </span>
          ),
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "MENTION":
        return {
          icon: <AtSign className="w-3.5 h-3.5 text-emerald-500" />,
          title: (
            <span>
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">{item.actor.name}</strong>{" "}
              mentioned you in a comment
            </span>
          ),
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "POST_LIKE":
        return {
          icon: <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />,
          title: (
            <span>
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">{item.actor.name}</strong>{" "}
              liked your article
            </span>
          ),
          snippet: null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}` : "#",
        };
      case "POST_BOOKMARK":
        return {
          icon: <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />,
          title: (
            <span>
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">{item.actor.name}</strong>{" "}
              saved your article to their library
            </span>
          ),
          snippet: null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}` : "#",
        };
      case "POST_COMMENT":
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-500" />,
          title: (
            <span>
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">{item.actor.name}</strong>{" "}
              commented on your article
            </span>
          ),
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      default:
        return {
          icon: <Bell className="w-3.5 h-3.5 text-zinc-500" />,
          title: <span>New interaction from {item.actor.name}</span>,
          snippet: null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}` : "#",
        };
    }
  };

  const hasPersonalUnread = personalNotifications.some((n) => !n.read);

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
        title="Notifications & Activity"
        aria-label="Notifications"
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
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-800/60">
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
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 font-medium"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
              {isAdmin && (
                <Link
                  href="/studio/notifications"
                  onClick={() => setOpen(false)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center space-x-0.5"
                >
                  <span>Studio</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Admin vs Personal Tabs (Only if Admin) */}
          {isAdmin && (
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-xs">
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex-1 py-2 font-medium text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                  activeTab === "personal"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <span>Activity & Mentions</span>
                {hasPersonalUnread && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 py-2 font-medium text-center border-b-2 transition-colors flex items-center justify-center space-x-1.5 ${
                  activeTab === "admin"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <span>Publication Digest</span>
              </button>
            </div>
          )}

          {/* Tab 1: Personal Notifications for All Users */}
          {(!isAdmin || activeTab === "personal") && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading && personalNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">Loading notifications...</div>
              ) : personalNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-600 stroke-1" />
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">No notifications yet</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                    When someone likes your comments, replies to you, or mentions you with @username, they will appear here.
                  </p>
                </div>
              ) : (
                personalNotifications.map((item) => {
                  const content = renderNotificationContent(item);
                  return (
                    <Link
                      key={item.id}
                      href={content.linkUrl}
                      onClick={() => handleItemClick(item)}
                      className={`block p-3.5 transition-colors text-left space-y-1.5 ${
                        !item.read
                          ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Actor Avatar with Type Badge */}
                        <div className="relative shrink-0 mt-0.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                            <Image
                              src={getSafeAvatarUrl(item.actor.avatarUrl, item.actor.username)}
                              alt={item.actor.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-zinc-900 shadow-xs border border-zinc-200 dark:border-zinc-800">
                            {content.icon}
                          </div>
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug line-clamp-2">
                              {content.title}
                            </p>
                            {!item.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>

                          {content.snippet && (
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic line-clamp-2 bg-zinc-100/80 dark:bg-zinc-800/60 p-1.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60">
                              {content.snippet}
                            </p>
                          )}

                          {content.postTitle && (
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 font-medium flex items-center space-x-1">
                              <span>on &ldquo;{content.postTitle}&rdquo;</span>
                            </p>
                          )}

                          <span className="text-[10px] text-zinc-400 font-mono block">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Admin Aggregated Post Digest */}
          {isAdmin && activeTab === "admin" && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading && adminNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">Loading publication interactions...</div>
              ) : adminNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <Bell className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-600 stroke-1" />
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">No publication interactions yet</p>
                </div>
              ) : (
                adminNotifications.map((item) => {
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
                              <span className="text-zinc-600 dark:text-zinc-400 italic">&ldquo;{c.content}&rdquo;</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer */}
          {isAdmin && (
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
          )}
        </div>
      )}
    </div>
  );
}
