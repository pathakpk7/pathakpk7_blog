"use client";

import { useState } from "react";
import { Heart, Bookmark, Share2, MessageSquare, Check } from "lucide-react";
import { toggleLike } from "@/app/actions/like";
import { toggleBookmark } from "@/app/actions/bookmark";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ArticleActionsProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialBookmarked: boolean;
  commentCount: number;
  slug: string;
  title: string;
  isLoggedIn: boolean;
}

export function ArticleActions({
  postId,
  initialLiked,
  initialLikeCount,
  initialBookmarked,
  commentCount,
  slug,
  title,
  isLoggedIn,
}: ArticleActionsProps) {
  const router = useRouter();
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
    <div className="flex items-center space-x-1.5 sm:space-x-2 bg-card/95 dark:bg-zinc-900/95 border border-border px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-xl backdrop-blur-md max-w-[calc(100vw-32px)]">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={cn(
          "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
          liked
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        <Heart className={cn("w-4 h-4", liked && "fill-current text-rose-500")} />
        <span>{likeCount}</span>
      </button>

      {/* Bookmark Button */}
      <button
        onClick={handleBookmark}
        className={cn(
          "p-2 rounded-full text-xs font-semibold transition-all",
          bookmarked
            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
            : "text-muted-foreground hover:bg-muted"
        )}
        title={bookmarked ? "Bookmarked" : "Bookmark article"}
      >
        <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current text-blue-500")} />
      </button>

      {/* Comment Scroll Link */}
      <a
        href="#comments"
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-full transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        <span>{commentCount}</span>
      </a>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative"
        title="Share article"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
