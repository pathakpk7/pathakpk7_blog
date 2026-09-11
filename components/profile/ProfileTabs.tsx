"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Heart, Bookmark as BookmarkIcon, MessageSquare, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PostItem {
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

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date | string;
  post: {
    id: string;
    title: string;
    slug: string;
    section: string;
  };
}

interface ProfileTabsProps {
  displayName: string;
  username: string;
  isAdmin: boolean;
  publishedPosts: PostItem[];
  likedPosts: PostItem[];
  bookmarkedPosts: PostItem[];
  comments: CommentItem[];
}

export function ProfileTabs({
  displayName,
  username,
  isAdmin,
  publishedPosts,
  likedPosts,
  bookmarkedPosts,
  comments,
}: ProfileTabsProps) {
  // Determine initial active tab: if author has published articles, start there; otherwise start on Liked or Bookmarks
  const hasPublished = publishedPosts.length > 0 || isAdmin;
  const initialTab: "publications" | "liked" | "bookmarks" | "comments" =
    hasPublished && publishedPosts.length > 0
      ? "publications"
      : likedPosts.length > 0
      ? "liked"
      : bookmarkedPosts.length > 0
      ? "bookmarks"
      : comments.length > 0
      ? "comments"
      : hasPublished
      ? "publications"
      : "liked";

  const [activeTab, setActiveTab] = useState<"publications" | "liked" | "bookmarks" | "comments">(initialTab);

  return (
    <section className="space-y-8">
      {/* Activity Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-border overflow-x-auto pb-px scrollbar-none">
        {/* Liked Articles Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("liked")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-150 shrink-0 ${
            activeTab === "liked"
              ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5 rounded-t-xl"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === "liked" ? "fill-current" : ""}`} />
          <span>Liked Articles</span>
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === "liked"
              ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-muted text-muted-foreground"
          }`}>
            {likedPosts.length}
          </span>
        </button>

        {/* Saved in Library Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("bookmarks")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-150 shrink-0 ${
            activeTab === "bookmarks"
              ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5 rounded-t-xl"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <BookmarkIcon className={`w-4 h-4 ${activeTab === "bookmarks" ? "fill-current" : ""}`} />
          <span>Saved in Library</span>
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === "bookmarks"
              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          }`}>
            {bookmarkedPosts.length}
          </span>
        </button>

        {/* Comments & Discussions Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("comments")}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-150 shrink-0 ${
            activeTab === "comments"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 rounded-t-xl"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comments</span>
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === "comments"
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}>
            {comments.length}
          </span>
        </button>

        {/* Publications Tab (Only shown if author or has publications) */}
        {hasPublished && (
          <button
            type="button"
            onClick={() => setActiveTab("publications")}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-150 shrink-0 ${
              activeTab === "publications"
                ? "border-foreground text-foreground bg-muted/40 rounded-t-xl"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Publications</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === "publications"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            }`}>
              {publishedPosts.length}
            </span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* 1. LIKED ARTICLES PANEL */}
        {activeTab === "liked" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Liked Publications
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Articles appreciated and favorited by @{username}
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {likedPosts.length} {likedPosts.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {likedPosts.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-5 h-5" />
                </div>
                <p className="text-base font-semibold text-foreground">No liked articles yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Articles liked while reading on ThePathak.tech will be curated here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {likedPosts.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. SAVED IN LIBRARY / BOOKMARKS PANEL */}
        {activeTab === "bookmarks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Saved in Library
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Curated reading list and bookmarked long-reads
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {bookmarkedPosts.length} {bookmarkedPosts.length === 1 ? "item" : "items"}
              </span>
            </div>

            {bookmarkedPosts.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto">
                  <BookmarkIcon className="w-5 h-5" />
                </div>
                <p className="text-base font-semibold text-foreground">No saved articles yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Bookmark insightful essays and technical breakdowns to read them anytime.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bookmarkedPosts.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. COMMENTS & DISCUSSION PANEL */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Discussion History
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comments, questions, and insights contributed by @{username}
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {comments.length} {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

            {comments.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-base font-semibold text-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Join the technical discourse by sharing your perspective under any publication.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="p-5 sm:p-6 rounded-2xl bg-card border border-border space-y-3 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-muted-foreground">Commented on</span>
                        <Link
                          href={`/article/${comment.post.slug}#comments`}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{comment.post.title}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-md bg-muted font-mono uppercase text-[10px]">
                          {comment.post.section}
                        </span>
                        <span>•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-foreground leading-relaxed pl-3 border-l-2 border-emerald-500/50 italic bg-muted/20 py-2 pr-3 rounded-r-xl">
                      &ldquo;{comment.content}&rdquo;
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/article/${comment.post.slug}#comments`}
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

        {/* 4. PUBLICATIONS PANEL (IF AUTHOR) */}
        {hasPublished && activeTab === "publications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                  Published Articles
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Original long-form essays, architectural breakdowns, and research
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {publishedPosts.length} {publishedPosts.length === 1 ? "article" : "articles"}
              </span>
            </div>

            {publishedPosts.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-2xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-base font-semibold text-foreground">No public articles yet</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  This author hasn&apos;t published any public articles yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publishedPosts.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
