"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import {
  BookOpen,
  Heart,
  Bookmark as BookmarkIcon,
  History,
  MessageSquare,
  Search,
  ExternalLink,
  ArrowRight,
  Compass,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  section: string;
  contentType: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | string | null;
  readingTime: number;
  author?: {
    name?: string | null;
    profile?: {
      displayName?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
  tags?: Array<{ tag: { name: string; slug: string } }> | Array<{ name: string; slug: string }>;
}

export interface LibraryComment {
  id: string;
  content: string;
  status?: string;
  createdAt: Date | string;
  post: {
    id: string;
    title: string;
    slug: string;
    section: string;
  };
}

export interface HistoryItem {
  id: string;
  progress: number;
  lastReadAt: Date | string;
  post: LibraryItem;
}

interface LibraryViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
  };
  bookmarks: LibraryItem[];
  likes: LibraryItem[];
  history: HistoryItem[];
  comments: LibraryComment[];
}

type TabType = "all" | "bookmarks" | "likes" | "history" | "comments";

export function LibraryView({ user, bookmarks, likes, history, comments }: LibraryViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("bookmarks");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.section.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q)
    );
  }, [bookmarks, searchQuery]);

  const filteredLikes = useMemo(() => {
    if (!searchQuery.trim()) return likes;
    const q = searchQuery.toLowerCase();
    return likes.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.section.toLowerCase().includes(q) ||
        l.excerpt?.toLowerCase().includes(q)
    );
  }, [likes, searchQuery]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (h) =>
        h.post?.title.toLowerCase().includes(q) ||
        h.post?.section.toLowerCase().includes(q) ||
        h.post?.excerpt?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const filteredComments = useMemo(() => {
    if (!searchQuery.trim()) return comments;
    const q = searchQuery.toLowerCase();
    return comments.filter(
      (c) =>
        c.content.toLowerCase().includes(q) ||
        c.post?.title.toLowerCase().includes(q)
    );
  }, [comments, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("bookmarks")}
          className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
            activeTab === "bookmarks"
              ? "bg-blue-500/10 border-blue-500/50 shadow-xs"
              : "bg-card border-border hover:border-zinc-400 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <BookmarkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {bookmarks.length}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-2">
            Bookmarked
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("likes")}
          className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
            activeTab === "likes"
              ? "bg-rose-500/10 border-rose-500/50 shadow-xs"
              : "bg-card border-border hover:border-zinc-400 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <Heart className="w-5 h-5 text-rose-500" />
            <span className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {likes.length}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-2">
            Liked Posts
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
            activeTab === "history"
              ? "bg-purple-500/10 border-purple-500/50 shadow-xs"
              : "bg-card border-border hover:border-zinc-400 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xl sm:text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {history.length}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-2">
            Reading History
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("comments")}
          className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
            activeTab === "comments"
              ? "bg-emerald-500/10 border-emerald-500/50 shadow-xs"
              : "bg-card border-border hover:border-zinc-400 dark:hover:border-zinc-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {comments.length}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-2">
            Discussions
          </p>
        </button>
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "bookmarks"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>Bookmarked</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === "bookmarks" ? "bg-white/20 text-white" : "bg-card text-muted-foreground"
            }`}>
              {bookmarks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("likes")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "likes"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Liked</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === "likes" ? "bg-white/20 text-white" : "bg-card text-muted-foreground"
            }`}>
              {likes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "history"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === "history" ? "bg-white/20 text-white" : "bg-card text-muted-foreground"
            }`}>
              {history.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "comments"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === "comments" ? "bg-white/20 text-white" : "bg-card text-muted-foreground"
            }`}>
              {comments.length}
            </span>
          </button>
        </div>

        {/* Search inside Library */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted/60 border border-border rounded-xl focus:outline-none focus:border-blue-500 text-foreground"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {/* 1. BOOKMARKS TAB */}
        {activeTab === "bookmarks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Bookmarked Publications
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Saved technical essays, tutorials, and research to read anytime
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {filteredBookmarks.length} {filteredBookmarks.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-4 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
                  <BookmarkIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {searchQuery ? "No bookmarks match your search" : "Your bookmark library is empty"}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                      ? `Try clearing your search query "${searchQuery}" or search for different terms.`
                      : "Bookmark articles while reading by tapping the bookmark ribbon icon at the bottom of any article."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore Featured Articles</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredBookmarks.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. LIKES TAB */}
        {activeTab === "likes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Liked Publications
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Articles and breakdowns favorited by your account
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {filteredLikes.length} {filteredLikes.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {filteredLikes.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-4 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {searchQuery ? "No liked articles match your search" : "No liked articles yet"}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                      ? `Try clearing your search query "${searchQuery}".`
                      : "Tap the heart icon under articles you enjoy to curate your personalized favorites."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Discover Publications</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredLikes.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. READING HISTORY TAB */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Reading History
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Publications and essays you have recently read on ThePathak.tech
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {filteredHistory.length} {filteredHistory.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-4 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                  <History className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {searchQuery ? "No history entries match your search" : "No reading history recorded yet"}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                      ? `Try clearing your search query "${searchQuery}".`
                      : "Articles you open and read while logged in will automatically be recorded here."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Start Reading</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHistory.map((h) => (
                  <div key={h.id} className="relative">
                    <ArticleCard post={h.post as any} variant="horizontal" />
                    <div className="absolute top-3 right-3 text-[10px] font-mono bg-zinc-950/80 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-800">
                      Read {formatDate(h.lastReadAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. COMMENTS TAB */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Discussion Comments
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comments and questions you have shared across articles
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {filteredComments.length} {filteredComments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            {filteredComments.length === 0 ? (
              <div className="py-16 px-4 text-center space-y-4 rounded-2xl bg-card border border-border">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {searchQuery ? "No comments match your search" : "No discussion comments posted yet"}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                      ? `Try clearing your search query "${searchQuery}".`
                      : "Participate in technical discussions by sharing your insights under any article."}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore Discourse</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <article
                    key={comment.id}
                    className="p-5 sm:p-6 rounded-2xl bg-card border border-border space-y-3 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-muted-foreground">Commented on</span>
                        <Link
                          href={`/article/${comment.post?.slug}#comments`}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{comment.post?.title}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {comment.status && (
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase tracking-wider ${
                              comment.status === "APPROVED"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : comment.status === "PENDING"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {comment.status === "APPROVED"
                              ? "Live"
                              : comment.status === "PENDING"
                              ? "Pending Review"
                              : "Rejected"}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-muted font-mono uppercase text-[10px]">
                          {comment.post?.section}
                        </span>
                        <span>•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-sm leading-relaxed pl-3 border-l-2 border-emerald-500/50 italic py-2 pr-3 bg-muted/20 rounded-r-xl text-foreground">
                      &ldquo;{comment.content}&rdquo;
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/article/${comment.post?.slug}#comments`}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>View thread in article</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
