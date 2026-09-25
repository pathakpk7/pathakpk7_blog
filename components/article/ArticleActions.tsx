"use client";

import { useState } from "react";
import { Heart, Bookmark, Share2, MessageSquare, Check, Edit3 } from "lucide-react";
import Link from "next/link";
import { toggleLike } from "@/app/actions/like";
import { toggleBookmark } from "@/app/actions/bookmark";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "./DeletePostButton";

interface ArticleActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialBookmarked: boolean;
  commentCount: number;
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
  commentCount,
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
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com" || initialIsAdmin;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/article/${slug}`);
      return;
    }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      await toggleLike(postId);
    } catch (e) {
      setLiked(!newLiked);
    }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/article/${slug}`);
      return;
    }
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    try {
      await toggleBookmark(postId);
    } catch (e) {
      setBookmarked(!newBookmarked);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-1.5 sm:space-x-2 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl backdrop-blur-md max-w-[calc(100vw-32px)]">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={cn(
          "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95",
          liked
            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60"
            : "text-zinc-700 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
        title={liked ? "Unlike article" : "Like article"}
      >
        <Heart className={cn("w-4 h-4", liked ? "fill-current text-rose-500" : "text-zinc-600 dark:text-zinc-300")} />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{likeCount}</span>
      </button>

      {/* Bookmark Button */}
      <button
        onClick={handleBookmark}
        className={cn(
          "p-2 rounded-full text-xs font-semibold transition-all active:scale-95",
          bookmarked
            ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60"
            : "text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        )}
        title={bookmarked ? "Bookmarked in library" : "Save to library"}
      >
        <Bookmark className={cn("w-4 h-4", bookmarked ? "fill-current text-blue-500" : "text-zinc-600 dark:text-zinc-300")} />
      </button>

      {/* Comment Scroll Link */}
      <a
        href="#comments"
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
        title="View discussion"
      >
        <MessageSquare className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        <span className="text-zinc-900 dark:text-zinc-100">{commentCount}</span>
      </a>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="p-2 text-zinc-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative active:scale-95"
        title="Share article link"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />}
      </button>

      {/* Admin-Only Quick Actions */}
      {isAdmin && (
        <>
          <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
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
            variant="floating"
          />
        </>
      )}
    </div>
  );
}
