"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Bookmark, Share2, MessageSquare, Check, Edit3, X, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toggleLike } from "@/app/actions/like";
import { toggleBookmark } from "@/app/actions/bookmark";
import { cn, getSafeAvatarUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "./DeletePostButton";

export interface LikedUserItem {
  id: string;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

interface ArticleActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialBookmarked: boolean;
  initialBookmarkCount?: number;
  commentCount: number;
  likedUsers?: LikedUserItem[];
  slug: string;
  title: string;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  section?: string;
}

export function ArticleActions({
  postId,
  initialLiked,
  initialLikeCount,
  initialBookmarked,
  initialBookmarkCount = 0,
  commentCount,
  likedUsers: initialLikedUsers = [],
  slug,
  title,
  isLoggedIn: initialIsLoggedIn = false,
  isAdmin: initialIsAdmin = false,
  section = "technology",
}: ArticleActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user || initialIsLoggedIn;
  const userEmail = session?.user?.email?.toLowerCase();
  const currentUserId = session?.user?.id;
  const currentUsername = (session?.user as any)?.username || (session?.user?.name ? session.user.name.toLowerCase().replace(/\s+/g, "_") : "reader");
  const currentDisplayName = session?.user?.name || "You";
  const currentAvatar = getSafeAvatarUrl(session?.user?.image, currentUsername);
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com" || initialIsAdmin;

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [likedUsers, setLikedUsers] = useState<LikedUserItem[]>(initialLikedUsers);
  const [showLikedModal, setShowLikedModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync props if SSR updates
  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
    setBookmarked(initialBookmarked);
    setBookmarkCount(initialBookmarkCount);
    setLikedUsers(initialLikedUsers);
  }, [initialLiked, initialLikeCount, initialBookmarked, initialBookmarkCount, initialLikedUsers]);

  // Close modal on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLikedModal) {
        setShowLikedModal(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowLikedModal(false);
      }
    };
    if (showLikedModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLikedModal]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/article/${slug}`);
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    // Optimistically update likedUsers list
    if (nextLiked) {
      const exists = likedUsers.some((u) => u.id === currentUserId || u.username === currentUsername);
      if (!exists) {
        setLikedUsers((prev) => [
          {
            id: currentUserId || "me",
            name: currentDisplayName,
            username: currentUsername,
            avatarUrl: currentAvatar,
          },
          ...prev,
        ]);
      }
    } else {
      setLikedUsers((prev) => prev.filter((u) => u.id !== currentUserId && u.username !== currentUsername));
    }

    try {
      await toggleLike(postId);
    } catch (e) {
      setLiked(!nextLiked);
      setLikeCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
      setLikedUsers(initialLikedUsers);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/article/${slug}`);
      return;
    }
    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked);
    setBookmarkCount((prev) => (nextBookmarked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      const res = await toggleBookmark(postId);
      if (res && typeof res.count === "number") {
        setBookmarkCount(res.count);
      }
    } catch (e) {
      setBookmarked(!nextBookmarked);
      setBookmarkCount((prev) => (nextBookmarked ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch (err) {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center space-x-1 sm:space-x-2 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl backdrop-blur-md max-w-[calc(100vw-24px)]">
        {/* Like Button & Liked-By Trigger */}
        <div className="flex items-center">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-l-full text-xs font-semibold transition-all active:scale-95",
              liked
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                : "text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
            title={liked ? "Unlike article" : "Like article"}
            aria-label="Like article"
          >
            <Heart className={cn("w-4 h-4", liked ? "fill-current text-rose-500" : "text-zinc-600 dark:text-zinc-300")} />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{likeCount}</span>
          </button>

          {likeCount > 0 && (
            <button
              onClick={() => setShowLikedModal(true)}
              className={cn(
                "px-1.5 py-1.5 text-[11px] rounded-r-full hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors border-l border-zinc-200 dark:border-zinc-800",
                liked && "bg-rose-50/80 dark:bg-rose-950/30"
              )}
              title="See who liked this article"
              aria-label="View users who liked this article"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Bookmark Button with Count */}
        <button
          onClick={handleBookmark}
          className={cn(
            "flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95",
            bookmarked
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60"
              : "text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title={bookmarked ? "Saved in library" : "Save to library"}
          aria-label="Bookmark article"
        >
          <Bookmark className={cn("w-4 h-4", bookmarked ? "fill-current text-blue-500" : "text-zinc-600 dark:text-zinc-300")} />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{bookmarkCount}</span>
        </button>

        {/* Comment Scroll Link with Count */}
        <a
          href="#comments"
          className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
          title="View discussion"
          aria-label="View comments"
        >
          <MessageSquare className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          <span className="text-zinc-900 dark:text-zinc-100">{commentCount}</span>
        </a>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative active:scale-95"
          title="Share article link"
          aria-label="Share article link"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />}
        </button>

        {/* Admin-Only Quick Actions */}
        {isAdmin && (
          <>
            <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-0.5 sm:mx-1" />
            <Link
              href={`/studio/posts/${postId}/edit`}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-full transition-colors"
              title="Edit article in Studio"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <DeletePostButton
              postId={postId}
              postTitle={title}
              redirectTo={`/${section}`}
              variant="icon"
            />
          </>
        )}
      </div>

      {/* Liked By Modal / Popover */}
      {showLikedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            ref={modalRef}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="px-4 py-3.5 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <h4 className="text-sm font-bold font-serif-editorial text-zinc-900 dark:text-zinc-100">
                  Liked by ({likedUsers.length})
                </h4>
              </div>
              <button
                onClick={() => setShowLikedModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Users List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1">
              {likedUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  No likes recorded yet.
                </div>
              ) : (
                likedUsers.map((user, idx) => {
                  const uName = user.name || "Reader";
                  const uHandle = user.username || uName.toLowerCase().replace(/\s+/g, "_");
                  const uAvatar = getSafeAvatarUrl(user.avatarUrl, uHandle);

                  return (
                    <Link
                      key={user.id || idx}
                      href={`/${uHandle}`}
                      onClick={() => setShowLikedModal(false)}
                      className="flex items-center justify-between p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                          <Image
                            src={uAvatar}
                            alt={uName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {uName}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
                            @{uHandle}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 text-center">
              <button
                onClick={() => setShowLikedModal(false)}
                className="w-full py-1.5 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
