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

const SECTION_COLOR_MAP: Record<string, { label: string; hover: string; tagBg: string; borderHover: string }> = {
  technology: {
    label: "text-blue-600 dark:text-blue-400",
    hover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    tagBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    borderHover: "hover:border-blue-500/50 dark:hover:border-blue-400/50",
  },
  science: {
    label: "text-indigo-600 dark:text-indigo-400",
    hover: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
    tagBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    borderHover: "hover:border-indigo-500/50 dark:hover:border-indigo-400/50",
  },
  coding: {
    label: "text-emerald-600 dark:text-emerald-400",
    hover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    tagBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    borderHover: "hover:border-emerald-500/50 dark:hover:border-emerald-400/50",
  },
  ideas: {
    label: "text-amber-600 dark:text-amber-400",
    hover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    tagBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    borderHover: "hover:border-amber-500/50 dark:hover:border-amber-400/50",
  },
  creative: {
    label: "text-orange-600 dark:text-orange-400",
    hover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    tagBg: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    borderHover: "hover:border-orange-500/50 dark:hover:border-orange-400/50",
  },
  notes: {
    label: "text-cyan-600 dark:text-cyan-400",
    hover: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
    tagBg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
    borderHover: "hover:border-cyan-500/50 dark:hover:border-cyan-400/50",
  },
};

export function ArticleCard({ post, variant = "standard", className }: ArticleCardProps) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  const authorName = post.author?.profile?.displayName || post.author?.name || "The Pathak";
  const sectionKey = (post.section || "technology").toLowerCase();
  const colors = SECTION_COLOR_MAP[sectionKey] || SECTION_COLOR_MAP.technology;
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
        className="p-1.5 rounded-sm bg-background/95 text-foreground border border-border shadow-xs hover:bg-secondary transition-colors"
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

  // Quote Broadsheet
  if (isQuote) {
    return (
      <article className={cn("group relative p-8 sm:p-10 bg-amber-500/[0.04] dark:bg-amber-500/[0.07] border-l-2 border-amber-600/70 dark:border-amber-400/70 hover:bg-amber-500/[0.07] dark:hover:bg-amber-500/[0.11] transition-colors duration-200 flex flex-col justify-between space-y-6 rounded-sm shadow-xs", className)}>
        {AdminOverlay}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] font-semibold tracking-wide text-amber-700 dark:text-amber-400">
              {sectionLabel} / {typeLabel}
            </span>
            <span className="text-[11px]">{formatDate(post.publishedAt)}</span>
          </div>

          <div className="relative py-1">
            <h3 className={cn(
              "text-xl sm:text-2xl font-serif-editorial font-normal tracking-tight text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors leading-relaxed",
              isHindi && "font-devanagari text-2xl"
            )}>
              <Link href={`/article/${post.slug}`} prefetch={true}>
                <span className="absolute inset-0" aria-hidden="true" />
                &ldquo;{post.title}&rdquo;
              </Link>
            </h3>
          </div>

          {post.subtitle && (
            <p className="text-sm font-normal text-amber-800/80 dark:text-amber-300/80 font-serif">
              — {post.subtitle}
            </p>
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

        <div className="flex items-center justify-between pt-4 border-t border-border/70 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <span>{post.readingTime} min read</span>
        </div>
      </article>
    );
  }

  // Featured Lead Story
  if (variant === "featured") {
    return (
      <article className={cn("group relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-8 bg-card border border-border/80 hover:border-border rounded-sm shadow-xs transition-all duration-200", colors.borderHover, className)}>
        {AdminOverlay}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center space-x-2 text-xs">
            <span className={cn("text-[11px] font-semibold tracking-wide", colors.label)}>
              {sectionLabel}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-[11px] text-muted-foreground capitalize">{typeLabel}</span>
          </div>

          <h2 className={cn("font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground transition-colors leading-[1.14]", colors.hover)}>
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

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {post.tags.slice(0, 3).map((t: any) => {
                const tagName = t.tag?.name || t.name;
                const tagSlug = t.tag?.slug || t.slug;
                if (!tagName || tagSlug === "hindi") return null;
                return (
                  <span
                    key={tagSlug}
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-xs border transition-colors",
                      colors.tagBg
                    )}
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
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
          <div className="lg:col-span-5 relative aspect-[16/10] w-full rounded-sm overflow-hidden bg-secondary flex items-center justify-center border border-border/50">
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
      <article className={cn("group relative p-6 sm:p-8 bg-amber-500/[0.03] dark:bg-amber-500/[0.06] border border-amber-500/20 hover:border-amber-500/40 rounded-sm transition-all duration-200 flex flex-col justify-between space-y-6 shadow-xs", className)}>
        {AdminOverlay}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 capitalize">
              {typeLabel}
            </span>
            <span className="text-[11px]">{formatDate(post.publishedAt)}</span>
          </div>

          <h3 className={cn(
            "text-xl sm:text-2xl font-serif-editorial font-medium tracking-tight text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug",
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

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {post.tags.slice(0, 2).map((t: any) => {
                const tagName = t.tag?.name || t.name;
                const tagSlug = t.tag?.slug || t.slug;
                if (!tagName || tagSlug === "hindi") return null;
                return (
                  <span
                    key={tagSlug}
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded-xs border transition-colors",
                      colors.tagBg
                    )}
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/70 text-xs text-muted-foreground">
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
        "group relative flex items-start justify-between py-4 border-b border-border/80 transition-colors hover:bg-secondary/40 px-3 rounded-sm",
        className
      )}>
        <div className="space-y-1 pr-6">
          <div className="text-[11px] font-semibold">
            <span className={colors.label}>{sectionLabel}</span>
          </div>
          <h4 className={cn("font-serif-editorial text-base font-medium text-foreground transition-colors line-clamp-2", colors.hover)}>
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
      <article className={cn("group relative flex flex-col sm:flex-row gap-6 p-4 sm:p-5 bg-card border border-border/70 hover:border-border rounded-sm shadow-xs transition-all duration-200", colors.borderHover, className)}>
        {AdminOverlay}
        {hasValidCoverImage && (
          <div className="relative aspect-[16/10] w-full sm:w-52 shrink-0 rounded-sm overflow-hidden bg-secondary border border-border/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl!}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex flex-col justify-between space-y-3 flex-1">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className={cn("text-[11px] font-semibold", colors.label)}>
                {sectionLabel}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-[11px] text-muted-foreground capitalize">{typeLabel}</span>
            </div>
            <h3 className={cn("font-serif-editorial text-xl font-semibold text-foreground transition-colors", colors.hover)}>
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

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {post.tags.slice(0, 2).map((t: any) => {
                  const tagName = t.tag?.name || t.name;
                  const tagSlug = t.tag?.slug || t.slug;
                  if (!tagName || tagSlug === "hindi") return null;
                  return (
                    <span
                      key={tagSlug}
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded-xs border transition-colors",
                        colors.tagBg
                      )}
                    >
                      #{tagName}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
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

  // Standard vertical card
  return (
    <article className={cn("group relative flex flex-col space-y-4 p-5 sm:p-6 bg-card border border-border/70 hover:border-border rounded-sm shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", colors.borderHover, className)}>
      {AdminOverlay}
      {hasValidCoverImage && (
        <div className="relative aspect-[16/10] w-full rounded-sm overflow-hidden bg-secondary border border-border/40">
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
        <div className="flex items-center space-x-2 text-xs">
          <span className={cn("text-[11px] font-semibold", colors.label)}>
            {sectionLabel}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-[11px] text-muted-foreground capitalize">{typeLabel}</span>
        </div>
        <h3 className={cn("font-serif-editorial text-xl sm:text-2xl font-semibold text-foreground transition-colors leading-snug", colors.hover)}>
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

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {post.tags.slice(0, 2).map((t: any) => {
              const tagName = t.tag?.name || t.name;
              const tagSlug = t.tag?.slug || t.slug;
              if (!tagName || tagSlug === "hindi") return null;
              return (
                <span
                  key={tagSlug}
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded-xs border transition-colors",
                    colors.tagBg
                  )}
                >
                  #{tagName}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
        <span className="font-medium text-foreground">{authorName}</span>
        <span>{post.readingTime} min read</span>
      </div>
    </article>
  );
}
