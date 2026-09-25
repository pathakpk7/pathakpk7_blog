"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  Bookmark,
  ExternalLink,
  Trash2,
  CheckCheck,
  AtSign,
  Users,
  X,
  Bell,
  CheckSquare,
  Square,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  UserPersonalNotification,
  AggregatedPostNotification,
  Interactor,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteSelectedNotifications,
  deleteAllNotifications,
} from "@/app/actions/notification";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";

interface NotificationCenterProps {
  initialPersonalNotifications: UserPersonalNotification[];
  initialAdminNotifications: AggregatedPostNotification[];
  isAdmin: boolean;
  viewMode?: "full" | "dropdown";
  onCloseDropdown?: () => void;
}

export function NotificationCenter({
  initialPersonalNotifications,
  initialAdminNotifications,
  isAdmin,
  viewMode = "full",
  onCloseDropdown,
}: NotificationCenterProps) {
  const [personalNotifications, setPersonalNotifications] = useState<UserPersonalNotification[]>(initialPersonalNotifications);
  const [adminNotifications, setAdminNotifications] = useState<AggregatedPostNotification[]>(initialAdminNotifications);
  const [activeTab, setActiveTab] = useState<"personal" | "admin">("personal");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    type: "likes" | "comments" | "bookmarks";
    items: Interactor[];
  } | null>(null);

  // Swipe-to-delete state for mobile
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);

  useEffect(() => {
    setPersonalNotifications(initialPersonalNotifications);
    setAdminNotifications(initialAdminNotifications);
  }, [initialPersonalNotifications, initialAdminNotifications]);

  const unreadCount = personalNotifications.filter((n) => !n.read).length;

  // Toggle selection for bulk delete
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === personalNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(personalNotifications.map((n) => n.id)));
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setPersonalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  // Delete single notification
  const handleDeleteSingle = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prev = [...personalNotifications];
    setPersonalNotifications((current) => current.filter((n) => n.id !== id));
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    try {
      await deleteNotification(id);
    } catch (err) {
      setPersonalNotifications(prev);
    }
  };

  // Delete selected notifications
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const idsToDelete = Array.from(selectedIds);
    const prev = [...personalNotifications];
    setPersonalNotifications((current) => current.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
    setSelectionMode(false);
    try {
      await deleteSelectedNotifications(idsToDelete);
    } catch (err) {
      setPersonalNotifications(prev);
    }
  };

  // Delete all notifications
  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    const prev = [...personalNotifications];
    setPersonalNotifications([]);
    setSelectedIds(new Set());
    setSelectionMode(false);
    try {
      await deleteAllNotifications();
    } catch (err) {
      setPersonalNotifications(prev);
    }
  };

  // Mark single as read on click
  const handleItemClick = async (item: UserPersonalNotification) => {
    if (!item.read) {
      try {
        await markNotificationAsRead(item.id);
        setPersonalNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
        );
      } catch (e) {}
    }
    if (onCloseDropdown) onCloseDropdown();
  };

  // Touch handlers for mobile right-swipe delete
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setSwipingId(id);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (swipingId !== id) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 120));
    }
  };

  const handleTouchEnd = (id: string) => {
    if (swipingId === id && swipeOffset > 85) {
      handleDeleteSingle(id);
    }
    setSwipingId(null);
    setSwipeOffset(0);
  };

  // Personal notification helper
  const getPersonalDetails = (item: UserPersonalNotification) => {
    switch (item.type) {
      case "COMMENT_LIKE":
        return {
          icon: <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />,
          actionText: "liked your comment",
          url: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "COMMENT_REPLY":
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-500" />,
          actionText: "commented back on your comment",
          url: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "MENTION":
        return {
          icon: <AtSign className="w-3.5 h-3.5 text-emerald-500" />,
          actionText: "tagged you in a comment",
          url: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      case "POST_LIKE":
        return {
          icon: <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />,
          actionText: "liked your publication",
          url: item.post ? `/article/${item.post.slug}` : "#",
        };
      case "POST_BOOKMARK":
        return {
          icon: <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />,
          actionText: "saved your article in library",
          url: item.post ? `/article/${item.post.slug}` : "#",
        };
      case "POST_COMMENT":
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-blue-500" />,
          actionText: "commented on your publication",
          url: item.post ? `/article/${item.post.slug}#comments` : "#",
        };
      default:
        return {
          icon: <Bell className="w-3.5 h-3.5 text-zinc-500" />,
          actionText: "interacted with you",
          url: item.post ? `/article/${item.post.slug}` : "#",
        };
    }
  };

  const isDropdown = viewMode === "dropdown";

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-editorial text-lg sm:text-xl font-bold text-foreground">
              Notification Center
            </h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground text-xs font-semibold transition-colors active:scale-95"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Mark all read</span>
            </button>
          )}

          {personalNotifications.length > 0 && (
            <>
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedIds(new Set());
                }}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors active:scale-95 ${
                  selectionMode
                    ? "bg-blue-600 text-white"
                    : "bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground"
                }`}
              >
                {selectionMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                <span>{selectionMode ? "Cancel Select" : "Select"}</span>
              </button>

              {selectionMode && selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors active:scale-95 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedIds.size})</span>
                </button>
              )}

              <button
                onClick={handleDeleteAll}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 transition-colors active:scale-95"
                title="Delete all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs (If Admin / Author) */}
      {isAdmin && (
        <div className="flex border-b border-border text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 sm:flex-none px-6 py-3 font-semibold text-center border-b-2 transition-colors flex items-center justify-center space-x-2 ${
              activeTab === "personal"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Activity & Mentions</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
              {personalNotifications.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 sm:flex-none px-6 py-3 font-semibold text-center border-b-2 transition-colors flex items-center justify-center space-x-2 ${
              activeTab === "admin"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-xl"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Publication Interactions</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-muted text-muted-foreground">
              {adminNotifications.length}
            </span>
          </button>
        </div>
      )}

      {/* TAB 1: User Single-Line Personal Notifications */}
      {(!isAdmin || activeTab === "personal") && (
        <div className="space-y-3">
          {selectionMode && personalNotifications.length > 0 && (
            <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
              <button
                onClick={selectAll}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {selectedIds.size === personalNotifications.length ? "Deselect All" : "Select All"}
              </button>
              <span>{selectedIds.size} selected</span>
            </div>
          )}

          {personalNotifications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/60 stroke-1" />
              <h3 className="text-sm font-semibold text-foreground">No notifications</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When readers like your comment, reply to you, or tag you with @username, they will appear here.
              </p>
            </div>
          ) : (
            personalNotifications.map((item) => {
              const details = getPersonalDetails(item);
              const isSelected = selectedIds.has(item.id);
              const isBeingSwiped = swipingId === item.id;

              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-xl border border-border group bg-card transition-all"
                >
                  {/* Swipe reveal background for mobile */}
                  <div className="absolute inset-0 bg-rose-600 flex items-center px-4 text-white font-semibold text-xs space-x-2 pointer-events-none">
                    <Trash2 className="w-4 h-4" />
                    <span>Swipe to Delete</span>
                  </div>

                  <div
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchMove={(e) => handleTouchMove(e, item.id)}
                    onTouchEnd={() => handleTouchEnd(item.id)}
                    style={{
                      transform: isBeingSwiped && swipeOffset > 0 ? `translateX(${swipeOffset}px)` : "none",
                      transition: isBeingSwiped ? "none" : "transform 0.15s ease-out",
                    }}
                    className={`relative z-10 flex items-center justify-between p-3.5 sm:p-4 bg-card hover:bg-muted/40 transition-colors gap-3 ${
                      !item.read ? "bg-blue-500/5 dark:bg-blue-950/20 border-l-4 border-l-blue-600" : ""
                    }`}
                  >
                    {/* Checkbox (if in selection mode) */}
                    {selectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(item.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Actor Avatar with Icon */}
                    <div className="relative shrink-0">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-border">
                        <Image
                          src={getSafeAvatarUrl(item.actor.avatarUrl, item.actor.username)}
                          alt={item.actor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-card shadow-xs border border-border">
                        {details.icon}
                      </div>
                    </div>

                    {/* Single-line text representation */}
                    <Link
                      href={details.url}
                      onClick={() => handleItemClick(item)}
                      className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-1 leading-snug">
                        <span className="font-bold text-foreground">{item.actor.name}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">(@{item.actor.username})</span>
                        <span className="text-muted-foreground font-normal">{details.actionText}</span>
                        {item.comment?.content && (
                          <span className="text-foreground italic font-medium truncate max-w-[200px] sm:max-w-xs">
                            &ldquo;{item.comment.content}&rdquo;
                          </span>
                        )}
                        {item.post?.title && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium truncate max-w-[180px]">
                            on &ldquo;{item.post.title}&rdquo;
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-muted-foreground font-mono shrink-0 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </span>
                    </Link>

                    {/* Right action delete icon */}
                    <button
                      onClick={(e) => handleDeleteSingle(item.id, e)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Compact Admin Cards with Clickable Interactors */}
      {isAdmin && activeTab === "admin" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground font-mono">
            Click any badge (Likes, Comments, Saves) to see the full list of readers who interacted.
          </p>

          {adminNotifications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <h3 className="text-sm font-semibold text-foreground">No publication interactions recorded</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminNotifications.map((batch) => {
                return (
                  <div
                    key={batch.id}
                    className="p-4 rounded-2xl bg-card border border-border hover:border-border/80 transition-all flex flex-col justify-between space-y-3 shadow-xs"
                  >
                    {/* Card Title & Link */}
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/article/${batch.postSlug}`}
                        className="group flex items-center space-x-1.5 text-sm font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 flex-1"
                        title={batch.postTitle}
                      >
                        <span className="truncate">{batch.postTitle}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 whitespace-nowrap">
                        {formatDate(batch.latestTimestamp)}
                      </span>
                    </div>

                    {/* Compact Interactive Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {/* Likes Badge Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setModalData({
                            title: `Likes on "${batch.postTitle}"`,
                            type: "likes",
                            items: batch.likedUsers,
                          })
                        }
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg font-semibold transition-all active:scale-95 ${
                          batch.likesCount > 0
                            ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                        title="Click to view all readers who liked"
                      >
                        <Heart className={`w-3.5 h-3.5 ${batch.likesCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span>{batch.likesCount} {batch.likesCount === 1 ? "Like" : "Likes"}</span>
                      </button>

                      {/* Comments Badge Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setModalData({
                            title: `Comments on "${batch.postTitle}"`,
                            type: "comments",
                            items: batch.commenters,
                          })
                        }
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg font-semibold transition-all active:scale-95 ${
                          batch.commentsCount > 0
                            ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                        title="Click to view all readers who commented"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        <span>{batch.commentsCount} {batch.commentsCount === 1 ? "Comment" : "Comments"}</span>
                      </button>

                      {/* Bookmarks Badge Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setModalData({
                            title: `Saves on "${batch.postTitle}"`,
                            type: "bookmarks",
                            items: batch.bookmarkers,
                          })
                        }
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg font-semibold transition-all active:scale-95 ${
                          batch.bookmarksCount > 0
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                        title="Click to view all readers who saved"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${batch.bookmarksCount > 0 ? "fill-amber-500 text-amber-500" : ""}`} />
                        <span>{batch.bookmarksCount} {batch.bookmarksCount === 1 ? "Save" : "Saves"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interactive Interactors Modal for Admin */}
      {modalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3.5 bg-muted/40 border-b border-border flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                {modalData.type === "likes" && <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />}
                {modalData.type === "comments" && <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />}
                {modalData.type === "bookmarks" && <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />}
                <h4 className="text-sm font-bold text-foreground truncate">
                  {modalData.title}
                </h4>
              </div>
              <button
                onClick={() => setModalData(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border p-2">
              {modalData.items.length === 0 ? (
                <p className="p-6 text-center text-xs text-muted-foreground">No interactors found.</p>
              ) : (
                modalData.items.map((user, idx) => {
                  return (
                    <div
                      key={idx}
                      className="p-2.5 flex items-start justify-between gap-3 hover:bg-muted/50 rounded-xl transition-colors"
                    >
                      <Link
                        href={`/${user.username}`}
                        onClick={() => setModalData(null)}
                        className="flex items-center space-x-3 min-w-0 flex-1 group"
                      >
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-border">
                          <Image
                            src={getSafeAvatarUrl(user.avatarUrl, user.username)}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {user.name}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground truncate">
                            @{user.username}
                          </p>
                          {user.commentSnippet && (
                            <p className="text-[11px] text-foreground/80 italic mt-0.5 line-clamp-2 bg-muted/40 p-1.5 rounded border border-border/40">
                              &ldquo;{user.commentSnippet}&rdquo;
                            </p>
                          )}
                        </div>
                      </Link>
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-1">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-muted/40 border-t border-border text-center">
              <button
                onClick={() => setModalData(null)}
                className="w-full py-1.5 px-3 text-xs font-semibold text-foreground bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
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
