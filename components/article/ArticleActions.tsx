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
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
    setBookmarked(initialBookmarked);
    setBookmarkCount(initialBookmarkCount);
    setLikedUsers(initialLikedUsers);
  }, [initialLiked, initialLikeCount, initialBookmarked, initialBookmarkCount, initialLikedUsers]);

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

    if (nextLiked) {
      setLikedUsers((prev) => [
        {
          id: currentUserId || "me",
          name: currentDisplayName,
          username: currentUsername,
          avatarUrl: currentAvatar,
        },
        ...prev.filter((u) => u.id !== currentUserId),
      ]);
    } else {
      setLikedUsers((prev) => prev.filter((u) => u.id !== currentUserId));
    }

    try {
      const result = await toggleLike(postId);
      if (result) {
        setLiked(result.liked);
        setLikeCount(result.count);
      } else {
        setLiked(!nextLiked);
        setLikeCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch {
      setLiked(!nextLiked);
      setLikeCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
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
      const result = await toggleBookmark(postId);
      if (result) {
        setBookmarked(result.bookmarked);
        setBookmarkCount(result.count);
      } else {
        setBookmarked(!nextBookmarked);
        setBookmarkCount((prev) => (nextBookmarked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch {
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
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center space-x-1 sm:space-x-1.5 bg-background/95 border border-border px-3 py-1.5 rounded-sm shadow-xl backdrop-blur-md max-w-[calc(100vw-24px)] transition-all">
        {/* Like and Appreciation */}
        <div className="flex items-center">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-sm transition-colors",
              liked
                ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
            title={liked ? "Unlike dispatch" : "Appreciate dispatch"}
            aria-label="Appreciate article"
          >
            <Heart className={cn("w-3.5 h-3.5", liked ? "fill-current text-rose-500" : "")} />
            <span className="font-medium text-foreground">{likeCount}</span>
          </button>

          {likeCount > 0 && (
            <button
              onClick={() => setShowLikedModal(true)}
              className="p-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-0.5"
              title="View reader appreciations"
              aria-label="View readers who appreciated this article"
            >
              <Users className="w-3 h-3" />
            </button>
          )}
        </div>

        <span className="w-px h-3.5 bg-border mx-1" />

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={cn(
            "flex items-center space-x-1 px-2.5 py-1 text-xs rounded-sm transition-colors",
            bookmarked
              ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          title={bookmarked ? "Saved in library" : "Save to library"}
          aria-label="Bookmark article"
        >
          <Bookmark className={cn("w-3.5 h-3.5", bookmarked ? "fill-current text-blue-500" : "")} />
          <span className="font-medium text-foreground">{bookmarkCount}</span>
        </button>

        <span className="w-px h-3.5 bg-border mx-1" />

        {/* Comment Navigation */}
        <a
          href="#comments"
          className="flex items-center space-x-1 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
          title="View conversation"
          aria-label="View comments"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">{commentCount}</span>
        </a>

        <span className="w-px h-3.5 bg-border mx-1" />

        {/* Share */}
        <button
          onClick={handleShare}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
          title="Share dispatch"
          aria-label="Share article link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>

        {/* Admin Quick Options */}
        {isAdmin && (
          <>
            <span className="w-px h-3.5 bg-border mx-1" />
            <Link
              href={`/studio/posts/${postId}/edit`}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
              title="Edit in Studio"
            >
              <Edit3 className="w-3.5 h-3.5" />
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

      {/* Reader Appreciations Modal */}
      <AnimatePresence>
        {showLikedModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-sm bg-background border border-border shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  Appreciated by ({likedUsers.length})
                </span>
                <button
                  onClick={() => setShowLikedModal(false)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-border/60 p-2">
                {likedUsers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No reader appreciations recorded yet.
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
                        className="flex items-center justify-between p-2 hover:bg-secondary rounded-sm transition-colors group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                            <Image
                              src={uAvatar}
                              alt={uName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">
                              {uName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              @{uHandle}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
