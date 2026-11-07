"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Heart, Bookmark as BookmarkIcon, MessageSquare, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

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
  status?: string;
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
  canViewBookmarks?: boolean;
  publishedPosts: PostItem[];
  likedPosts: PostItem[];
  bookmarkedPosts: PostItem[];
  comments: CommentItem[];
  defaultTab?: "publications" | "liked" | "bookmarks" | "comments";
}

export function ProfileTabs({
  displayName,
  username,
  isAdmin,
  canViewBookmarks = true,
  publishedPosts,
  likedPosts,
  bookmarkedPosts,
  comments,
  defaultTab,
}: ProfileTabsProps) {
  const hasPublished = publishedPosts.length > 0 || isAdmin;
  const initialTab: "publications" | "liked" | "bookmarks" | "comments" =
    defaultTab ||
    (hasPublished && publishedPosts.length > 0
      ? "publications"
      : likedPosts.length > 0
      ? "liked"
      : canViewBookmarks && bookmarkedPosts.length > 0
      ? "bookmarks"
      : comments.length > 0
      ? "comments"
      : hasPublished
      ? "publications"
      : "liked");

  const [activeTab, setActiveTab] = useState<"publications" | "liked" | "bookmarks" | "comments">(initialTab);

  const tabs = [
    { id: "liked" as const, label: "Appreciations", count: likedPosts.length, icon: Heart },
    ...(canViewBookmarks
      ? [{ id: "bookmarks" as const, label: "Saved Library", count: bookmarkedPosts.length, icon: BookmarkIcon }]
      : []),
    { id: "comments" as const, label: "Responses", count: comments.length, icon: MessageSquare },
    ...(hasPublished
      ? [{ id: "publications" as const, label: "Dispatches", count: publishedPosts.length, icon: BookOpen }]
      : []),
  ];

  return (
    <section className="space-y-8">
      {/* Editorial Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-border overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors flex items-center space-x-2 rounded-sm"
            >
              <span className={isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>
                {tab.label}
              </span>
              <span className="text-xs text-muted-foreground">
                ({tab.count})
              </span>
              {isActive && (
                <motion.div
                  layoutId="profileActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="space-y-6">
        {activeTab === "liked" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <h2 className="font-serif-editorial text-2xl font-semibold text-foreground">
                Appreciated Dispatches
              </h2>
              <span className="text-xs text-muted-foreground">
                {likedPosts.length} items
              </span>
            </div>

            {likedPosts.length === 0 ? (
              <div className="py-16 text-center space-y-2 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">No appreciated dispatches yet</p>
                <p className="text-xs text-muted-foreground">
                  Dispatches marked with appreciation will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {likedPosts.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {canViewBookmarks && activeTab === "bookmarks" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <h2 className="font-serif-editorial text-2xl font-semibold text-foreground">
                Saved in Library
              </h2>
              <span className="text-xs text-muted-foreground">
                {bookmarkedPosts.length} items
              </span>
            </div>

            {bookmarkedPosts.length === 0 ? (
              <div className="py-16 text-center space-y-2 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">No saved articles in your reading list</p>
                <p className="text-xs text-muted-foreground">
                  Bookmark dispatches while reading to revisit them anytime.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {bookmarkedPosts.map((post) => (
                  <ArticleCard key={post.id} post={post as any} variant="standard" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <h2 className="font-serif-editorial text-2xl font-semibold text-foreground">
                Responses & Discourse
              </h2>
              <span className="text-xs text-muted-foreground">
                {comments.length} notes
              </span>
            </div>

            {comments.length === 0 ? (
              <div className="py-16 text-center space-y-2 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">No responses recorded yet</p>
                <p className="text-xs text-muted-foreground">
                  Join the dialogue on any dispatch across the publication.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="p-5 sm:p-6 bg-secondary/30 rounded-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">On</span>
                        <Link
                          href={`/article/${comment.post.slug}#comments`}
                          className="font-medium text-foreground hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{comment.post.title}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <span className="capitalize">{comment.post.section}</span>
                        <span>•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>

                    <div className="text-sm text-foreground leading-relaxed pl-3 border-l border-foreground/30 py-1 font-serif">
                      &ldquo;{comment.content}&rdquo;
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/article/${comment.post.slug}#comments`}
                        className="inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span>View in context</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {hasPublished && activeTab === "publications" && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <h2 className="font-serif-editorial text-2xl font-semibold text-foreground">
                Authored Dispatches
              </h2>
              <span className="text-xs text-muted-foreground">
                {publishedPosts.length} items
              </span>
            </div>

            {publishedPosts.length === 0 ? (
              <div className="py-16 text-center space-y-2 bg-secondary/30 rounded-sm">
                <p className="text-sm font-medium text-foreground">No published dispatches yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
