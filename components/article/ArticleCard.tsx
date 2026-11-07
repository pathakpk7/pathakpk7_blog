"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Clock, Quote, Edit3, MoreVertical } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "./DeletePostButton";

export interface ArticleCardProps {
  post: {
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
  };
  variant?: "featured" | "standard" | "compact" | "horizontal" | "creative" | "quote";
  className?: string;
}

export function ArticleCard({ post, variant = "standard", className }: ArticleCardProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  const authorName = post.author?.profile?.displayName || post.author?.name || "The Pathak";
  const sectionLabel = post.section ? post.section.charAt(0).toUpperCase() + post.section.slice(1) : "General";
  const typeLabel = post.contentType ? post.contentType.replace(/_/g, " ").toLowerCase() : "article";
  const isHindi = post.tags?.some((t: any) => (t.tag?.slug || t.slug) === "hindi");
  const hasValidCoverImage = typeof post.coverImageUrl === "string" && post.coverImageUrl.trim().length > 5;
  const isQuote = post.contentType?.toUpperCase() === "QUOTE" || variant === "quote";

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const AdminOverlay = isAdmin ? (
    <div
      ref={menuRef}
      className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Post administration options"
        className="p-1.5 rounded-sm bg-background/90 text-foreground border border-border shadow-xs hover:bg-secondary transition-colors"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          aria-label="Administrative actions"
          className="absolute right-0 mt-1 w-36 py-1 bg-background border border-border rounded-sm shadow-lg z-40 text-xs animate-in fade-in duration-100"
        >
          <Link
            href={`/studio/posts/${post.id}/edit`}
            role="menuitem"
            className="flex items-center space-x-2 px-3 py-1.5 text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>
          <div className="border-t border-border my-1" />
          <div role="menuitem" className="w-full">
            <DeletePostButton
              postId={post.id}
              postTitle={post.title}
              variant="minimal"
              className="w-full px-3 py-1.5 justify-start text-destructive hover:bg-destructive/10 rounded-none"
              onSuccess={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  ) : null;

  // Quote or Poetic Broadsheet
  if (isQuote) {
    return (
      <article className={cn("group relative p-8 sm:p-10 bg-secondary/40 hover:bg-secondary/70 transition-colors duration-200 flex flex-col justify-between space-y-6 rounded-sm", className)}>
        {AdminOverlay}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] font-medium tracking-wide text-foreground/80">
              {sectionLabel} / {typeLabel}
            </span>
            <span className="text-[11px]">{formatDate(post.publishedAt)}</span>
          </div>

          <div className="relative pl-4 border-l border-foreground/30 py-1">
            <h3 className={cn(
              "text-xl sm:text-2xl font-serif-editorial font-normal tracking-tight text-foreground transition-colors leading-relaxed",
              isHindi && "font-devanagari text-2xl"
            )}>
              <Link href={`/article/${post.slug}`} prefetch={true}>
                <span className="absolute inset-0" aria-hidden="true" />
                &ldquo;{post.title}&rdquo;
              </Link>
            </h3>
          </div>

          {post.subtitle && (
            <p className="text-sm font-normal text-muted-foreground pl-4 font-serif">
              — {post.subtitle}
            </p>
          )}

          {post.excerpt && (
            <p className={cn(
              "text-xs sm:text-sm text-muted-foreground leading-relaxed pl-4 line-clamp-3",
              isHindi && "font-devanagari"
            )}>
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <span>{post.readingTime} min read</span>
        </div>
      </article>
    );
  }

  // Featured Lead Story
  if (variant === "featured") {
    return (
      <article className={cn("group relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6", className)}>
        {AdminOverlay}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="text-[11px] font-medium tracking-wide text-blue-600 dark:text-blue-400">
              {sectionLabel}
            </span>
            <span>/</span>
            <span className="text-[11px] capitalize">{typeLabel}</span>
          </div>

          <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-[1.15]">
            <Link href={`/article/${post.slug}`} prefetch={true} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>

          {post.subtitle && (
            <p className="text-base sm:text-lg text-muted-foreground font-normal line-clamp-2 leading-relaxed">
              {post.subtitle}
            </p>
          )}

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed hidden sm:block">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center space-x-3 pt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{authorName}</span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime} min read</span>
            </span>
          </div>
        </div>

        {hasValidCoverImage && (
          <div className="lg:col-span-5 relative aspect-[16/10] w-full rounded-sm overflow-hidden bg-muted flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl!}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        )}
      </article>
    );
  }

  // Creative / Poetry variant
  if (variant === "creative") {
    return (
      <article className={cn("group relative p-6 sm:p-8 bg-secondary/30 hover:bg-secondary/60 rounded-sm transition-colors duration-200 flex flex-col justify-between space-y-6", className)}>
        {AdminOverlay}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] font-medium tracking-wide text-foreground/80 capitalize">
              {typeLabel}
            </span>
            <span className="text-[11px]">{formatDate(post.publishedAt)}</span>
          </div>

          <h3 className={cn(
            "text-xl sm:text-2xl font-serif-editorial font-medium tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug",
            isHindi && "font-devanagari text-2xl"
          )}>
            <Link href={`/article/${post.slug}`} prefetch={true}>
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h3>

          {post.subtitle && (
            <p className="text-sm text-muted-foreground font-serif">{post.subtitle}</p>
          )}

          {post.excerpt && (
            <p className={cn(
              "text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3",
              isHindi && "font-devanagari"
            )}>
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <span>{post.readingTime} min read</span>
        </div>
      </article>
    );
  }

  // Compact List Item variant
  if (variant === "compact") {
    return (
      <article className={cn(
        "group relative flex items-start justify-between py-4 border-b border-border transition-colors hover:bg-secondary/30 px-2 rounded-sm",
        className
      )}>
        <div className="space-y-1 pr-6">
          <div className="text-[11px] font-medium text-muted-foreground">
            <span>{sectionLabel}</span>
          </div>
          <h4 className="font-serif-editorial text-base font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            <Link href={`/article/${post.slug}`} prefetch={true}>
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h4>
          <div className="text-xs text-muted-foreground flex items-center space-x-2 pt-1">
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
        {AdminOverlay}
      </article>
    );
  }

  // Horizontal variant
  if (variant === "horizontal") {
    return (
      <article className={cn("group relative flex flex-col sm:flex-row gap-6 py-6 border-b border-border transition-colors", className)}>
        {AdminOverlay}
        {hasValidCoverImage && (
          <div className="relative aspect-[16/10] w-full sm:w-52 shrink-0 rounded-sm overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl!}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                {sectionLabel}
              </span>
              <span>/</span>
              <span className="text-[11px] capitalize">{typeLabel}</span>
            </div>
            <h3 className="font-serif-editorial text-xl font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <Link href={`/article/${post.slug}`} prefetch={true}>
                <span className="absolute inset-0" aria-hidden="true" />
                {post.title}
              </Link>
            </h3>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3 text-xs text-muted-foreground pt-1">
            <span className="font-medium text-foreground">{authorName}</span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard vertical card (Magazine Column entry)
  return (
    <article className={cn("group relative flex flex-col space-y-4 py-4", className)}>
      {AdminOverlay}
      {hasValidCoverImage && (
        <div className="relative aspect-[16/10] w-full rounded-sm overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl!}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      )}
      <div className="space-y-2 flex-1">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
            {sectionLabel}
          </span>
          <span>/</span>
          <span className="text-[11px] capitalize">{typeLabel}</span>
        </div>
        <h3 className="font-serif-editorial text-xl sm:text-2xl font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          <Link href={`/article/${post.slug}`} prefetch={true}>
            <span className="absolute inset-0" aria-hidden="true" />
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
        <span className="font-medium text-foreground">{authorName}</span>
        <span>{post.readingTime} min read</span>
      </div>
    </article>
  );
}
