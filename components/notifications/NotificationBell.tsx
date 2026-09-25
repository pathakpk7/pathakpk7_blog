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
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  UserPersonalNotification,
  AggregatedPostNotification,
  Interactor,
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
  const [modalData, setModalData] = useState<{
    title: string;
    type: "likes" | "comments" | "bookmarks";
    items: Interactor[];
  } | null>(null);
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

  // Handle single notification delete
  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPersonalNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await deleteNotification(id);
    } catch (err) {}
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
          actionText: "liked your comment",
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "COMMENT_REPLY":
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-500" />,
          actionText: "commented back on your comment",
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "MENTION":
        return {
          icon: <AtSign className="w-3.5 h-3.5 text-emerald-500" />,
          actionText: "tagged you in a comment",
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "POST_LIKE":
        return {
          icon: <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />,
          actionText: "liked your article",
          snippet: null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}` : "#",
        };
      case "POST_BOOKMARK":
        return {
          icon: <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />,
          actionText: "saved your article in library",
          snippet: null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}` : "#",
        };
      case "POST_COMMENT":
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-500" />,
          actionText: "commented on your article",
          snippet: item.comment?.content ? `“${item.comment.content}”` : null,
          postTitle: item.post?.title,
          linkUrl: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      default:
        return {
          icon: <Bell className="w-3.5 h-3.5 text-zinc-500" />,
          actionText: "interacted with you",
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
                  <span>Mark read</span>
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center space-x-0.5 font-medium"
              >
                <span>Full view</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
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

          {/* Tab 1: Single-Line Personal Notifications */}
          {(!isAdmin || activeTab === "personal") && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loading && personalNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">Loading notifications...</div>
              ) : personalNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-600 stroke-1" />
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">No notifications yet</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                    When readers like your comment, reply to you, or mention @username, updates will appear here.
                  </p>
                </div>
              ) : (
                personalNotifications.map((item) => {
                  const content = renderNotificationContent(item);
                  return (
                    <div
                      key={item.id}
                      className={`group relative flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors gap-2 text-left ${
                        !item.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      {/* Actor Avatar with Type Badge */}
                      <div className="relative shrink-0">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
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

                      {/* Single-line details */}
                      <Link
                        href={content.linkUrl}
                        onClick={() => handleItemClick(item)}
                        className="flex-1 min-w-0 space-y-0.5 text-xs"
                      >
                        <p className="text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight">
                          <strong className="font-semibold text-zinc-950 dark:text-white">{item.actor.name}</strong>{" "}
                          <span className="text-zinc-500 dark:text-zinc-400">@{item.actor.username}</span>{" "}
                          <span>{content.actionText}</span>
                          {content.snippet && (
                            <span className="italic text-zinc-600 dark:text-zinc-300 ml-1">
                              {content.snippet}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
                          <span>{formatDate(item.createdAt)}</span>
                          {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        </div>
                      </Link>

                      {/* Delete item button */}
                      <button
                        onClick={(e) => handleDeleteItem(item.id, e)}
                        className="p-1 text-zinc-400 hover:text-rose-500 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Compact Admin Cards with Clickable Badges */}
          {isAdmin && activeTab === "admin" && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-2 space-y-2">
              {adminNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <Bell className="w-6 h-6 mx-auto text-zinc-300 dark:text-zinc-600 stroke-1" />
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">No publication interactions yet</p>
                </div>
              ) : (
                adminNotifications.map((batch) => {
                  return (
                    <div
                      key={batch.id}
                      className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 text-left"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/article/${batch.postSlug}`}
                          onClick={() => setOpen(false)}
                          className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 flex-1 flex items-center space-x-1"
                          title={batch.postTitle}
                        >
                          <span className="truncate">{batch.postTitle}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                        </Link>
                        <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                          {formatDate(batch.latestTimestamp)}
                        </span>
                      </div>

                      {/* Interactive Compact Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        {batch.likesCount > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setModalData({
                                title: `Likes on "${batch.postTitle}"`,
                                type: "likes",
                                items: batch.likedUsers,
                              })
                            }
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 font-semibold hover:scale-105 transition-all"
                            title="Click to view users who liked"
                          >
                            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                            <span>{batch.likesCount} {batch.likesCount === 1 ? "like" : "likes"}</span>
                          </button>
                        )}

                        {batch.commentsCount > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setModalData({
                                title: `Comments on "${batch.postTitle}"`,
                                type: "comments",
                                items: batch.commenters,
                              })
                            }
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 font-semibold hover:scale-105 transition-all"
                            title="Click to view comments"
                          >
                            <MessageSquare className="w-3 h-3 text-blue-500" />
                            <span>{batch.commentsCount} {batch.commentsCount === 1 ? "comment" : "comments"}</span>
                          </button>
                        )}

                        {batch.bookmarksCount > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setModalData({
                                title: `Saves on "${batch.postTitle}"`,
                                type: "bookmarks",
                                items: batch.bookmarkers,
                              })
                            }
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 font-semibold hover:scale-105 transition-all"
                            title="Click to view users who saved"
                          >
                            <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{batch.bookmarksCount} {batch.bookmarksCount === 1 ? "save" : "saves"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <Link
              href={isAdmin ? "/studio/notifications" : "/notifications"}
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
            >
              <span>View All Notifications & History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Interactors Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                {modalData.type === "likes" && <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />}
                {modalData.type === "comments" && <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />}
                {modalData.type === "bookmarks" && <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />}
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {modalData.title}
                </h4>
              </div>
              <button
                onClick={() => setModalData(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 p-2">
              {modalData.items.length === 0 ? (
                <p className="p-6 text-center text-xs text-zinc-400">No users found.</p>
              ) : (
                modalData.items.map((user, idx) => {
                  return (
                    <div
                      key={idx}
                      className="p-2 flex items-start justify-between gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-xl transition-colors"
                    >
                      <Link
                        href={`/${user.username}`}
                        onClick={() => {
                          setModalData(null);
                          setOpen(false);
                        }}
                        className="flex items-center space-x-2.5 min-w-0 flex-1 group"
                      >
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                          <Image
                            src={getSafeAvatarUrl(user.avatarUrl, user.username)}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {user.name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                            @{user.username}
                          </p>
                          {user.commentSnippet && (
                            <p className="text-[10px] text-zinc-700 dark:text-zinc-300 italic mt-0.5 line-clamp-2 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded border border-zinc-200 dark:border-zinc-700/60">
                              &ldquo;{user.commentSnippet}&rdquo;
                            </p>
                          )}
                        </div>
                      </Link>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0 mt-0.5">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <button
                onClick={() => setModalData(null)}
                className="w-full py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
