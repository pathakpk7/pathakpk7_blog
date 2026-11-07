"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import {
  Heart,
  Bookmark as BookmarkIcon,
  History,
  MessageSquare,
  Search,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

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

type TabType = "bookmarks" | "likes" | "history" | "comments";

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

  const tabs: Array<{ id: TabType; label: string; count: number; icon: any }> = [
    { id: "bookmarks", label: "Bookmarks", count: bookmarks.length, icon: BookmarkIcon },
    { id: "likes", label: "Appreciations", count: likes.length, icon: Heart },
    { id: "history", label: "Reading History", count: history.length, icon: History },
    { id: "comments", label: "Discussion", count: comments.length, icon: MessageSquare },
  ];

  return (
    <div className="space-y-12">
      {/* Overview Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Saved Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Personal archive for @{user.username || "reader"}
          </p>
        </div>

        {/* Search inside Library */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search saved dispatches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/50 border border-border rounded-sm focus:outline-none focus:border-foreground text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-px overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative px-3 py-2 text-xs sm:text-sm font-medium transition-colors flex items-center space-x-2 rounded-sm"
            >
              <span className={isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>
                {tab.label}
              </span>
              <span className="text-xs text-muted-foreground">
                ({tab.count})
              </span>
              {isActive && (
                <motion.div
                  layoutId="libraryActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div>
        {/* Bookmarks */}
        {activeTab === "bookmarks" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span>{filteredBookmarks.length} {filteredBookmarks.length === 1 ? "article" : "articles"}</span>
            </div>

            {filteredBookmarks.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">
                  {searchQuery ? "No bookmarks match your search" : "Your bookmark library is empty"}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? `Try clearing your search query "${searchQuery}".`
                    : "Bookmark articles while reading to build your reference collection."}
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-foreground text-background text-xs font-medium rounded-sm hover:opacity-90 transition-opacity"
                  >
                    <span>Browse publications</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredBookmarks.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Likes */}
        {activeTab === "likes" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span>{filteredLikes.length} {filteredLikes.length === 1 ? "article" : "articles"}</span>
            </div>

            {filteredLikes.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">
                  {searchQuery ? "No appreciated articles match your search" : "No appreciated articles yet"}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Tap the heart icon under articles you find insightful to curate your favorites.
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-foreground text-background text-xs font-medium rounded-sm hover:opacity-90 transition-opacity"
                  >
                    <span>Browse publications</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredLikes.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span>{filteredHistory.length} {filteredHistory.length === 1 ? "entry" : "entries"}</span>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">
                  {searchQuery ? "No history entries match your search" : "No reading history recorded yet"}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Dispatches you open while signed in will automatically be recorded here.
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-foreground text-background text-xs font-medium rounded-sm hover:opacity-90 transition-opacity"
                  >
                    <span>Start reading</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredHistory.map((h) => (
                  <div key={h.id} className="relative">
                    <ArticleCard post={h.post as any} variant="horizontal" />
                    <div className="text-[11px] text-muted-foreground pt-1">
                      Read {formatDate(h.lastReadAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comments */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span>{filteredComments.length} {filteredComments.length === 1 ? "comment" : "comments"}</span>
            </div>

            {filteredComments.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">
                  {searchQuery ? "No comments match your search" : "No discussion comments posted yet"}
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Participate in technical discussions by sharing your insights under any dispatch.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComments.map((comment) => (
                  <article
                    key={comment.id}
                    className="p-5 sm:p-6 bg-secondary/30 rounded-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Commented on</span>
                        <Link
                          href={`/article/${comment.post?.slug}#comments`}
                          className="font-medium text-foreground hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{comment.post?.title}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <span className="capitalize">{comment.post?.section}</span>
                        <span>•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-foreground leading-relaxed pl-3 border-l border-foreground/30 py-1 font-serif">
                      &ldquo;{comment.content}&rdquo;
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/article/${comment.post?.slug}#comments`}
                        className="inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>View thread</span>
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
