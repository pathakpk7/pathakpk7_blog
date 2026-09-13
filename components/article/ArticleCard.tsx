import Link from "next/link";
import Image from "next/image";
import { Clock, Tag as TagIcon, Quote } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

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
  const authorName = post.author?.profile?.displayName || post.author?.name || "The Pathak";
  const sectionUpper = (post.section || "technology").toUpperCase();
  const isHindi = post.tags?.some((t: any) => (t.tag?.slug || t.slug) === "hindi");
  const hasValidCoverImage = typeof post.coverImageUrl === "string" && post.coverImageUrl.trim().length > 5;
  const isQuote = post.contentType?.toUpperCase() === "QUOTE" || variant === "quote";

  if (isQuote) {
    return (
      <article className={cn("group relative bg-card rounded-2xl p-7 border border-amber-500/30 hover:border-amber-500/60 dark:bg-amber-950/10 dark:border-amber-500/30 dark:hover:border-amber-500/50 transition-all duration-200 active:scale-[0.995] flex flex-col justify-between space-y-5 shadow-xs", className)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-mono">
            <span className="inline-flex items-center space-x-1.5 uppercase tracking-widest font-semibold">
              <Quote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>QUOTE</span>
            </span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          <div className="relative pl-4 border-l-2 border-amber-500/60 dark:border-amber-400/60 py-1 my-1">
            <h3 className={cn(
              "text-xl sm:text-2xl font-serif-editorial italic font-medium tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-150 leading-snug",
              isHindi && "font-devanagari text-2xl not-italic"
            )}>
              <Link href={`/article/${post.slug}`}>
                <span className="absolute inset-0" aria-hidden="true" />
                &ldquo;{post.title}&rdquo;
              </Link>
            </h3>
          </div>

          {post.subtitle && (
            <p className="text-sm font-medium text-amber-800/80 dark:text-amber-300/80 pl-4 font-serif">
              — {post.subtitle}
            </p>
          )}

          {post.excerpt && (
            <p className={cn(
              "text-xs sm:text-sm text-muted-foreground leading-relaxed pl-4 line-clamp-3 pt-1",
              isHindi && "font-devanagari"
            )}>
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-amber-500/20 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          <span className="font-mono text-[11px] uppercase tracking-wider">{post.section}</span>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className={cn("group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 active:scale-[0.995]", className)}>
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-3 text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            <span>{sectionUpper}</span>
            <span>•</span>
            <span className="text-zinc-500 font-normal">{post.contentType}</span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 leading-tight">
            <Link href={`/article/${post.slug}`} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>
          {post.subtitle && (
            <p className="text-lg text-muted-foreground font-medium line-clamp-2 leading-relaxed">
              {post.subtitle}
            </p>
          )}
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed hidden sm:block">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center space-x-4 pt-2 text-xs text-muted-foreground">
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
          <div className="lg:col-span-5 relative h-64 sm:h-80 w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={post.coverImageUrl!}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-200"
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
        )}
      </article>
    );
  }

  if (variant === "creative") {
    return (
      <article className={cn("group relative bg-card rounded-2xl p-8 border border-border/70 hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-200 active:scale-[0.995] flex flex-col justify-between space-y-6", className)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-mono">
            <span className="uppercase tracking-widest">{post.contentType}</span>
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <h3 className={cn(
            "text-2xl font-bold tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-150",
            isHindi ? "font-devanagari text-3xl" : "font-serif-editorial"
          )}>
            <Link href={`/article/${post.slug}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h3>
          {post.subtitle && (
            <p className="text-sm italic text-muted-foreground">{post.subtitle}</p>
          )}
          {post.excerpt && (
            <p className={cn(
              "text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-4",
              isHindi && "font-devanagari"
            )}>
              {post.excerpt}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <span>{authorName}</span>
          <span>{post.readingTime} min read</span>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group relative flex items-start justify-between space-x-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted/30 px-2 rounded-lg transition-colors duration-150 active:scale-[0.995]", className)}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
            {sectionUpper}
          </span>
          <h4 className="font-serif-editorial text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 line-clamp-2">
            <Link href={`/article/${post.slug}`}>
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h4>
          <div className="text-[11px] text-muted-foreground flex items-center space-x-2">
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{post.readingTime} min</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className={cn("group relative flex flex-col sm:flex-row gap-6 bg-card rounded-xl p-5 border border-border hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 active:scale-[0.995]", className)}>
        {hasValidCoverImage && (
          <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={post.coverImageUrl!}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-102 transition-transform duration-200"
              sizes="(max-width: 640px) 100vw, 200px"
            />
          </div>
        )}
        <div className="flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>{sectionUpper}</span>
              <span>•</span>
              <span className="text-zinc-500 font-normal">{post.contentType}</span>
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
              <Link href={`/article/${post.slug}`}>
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
    <article className={cn("group relative flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 shadow-xs active:scale-[0.995]", className)}>
      {hasValidCoverImage && (
        <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <Image
            src={post.coverImageUrl!}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <span>{sectionUpper}</span>
            <span>•</span>
            <span className="text-zinc-500 font-normal">{post.contentType}</span>
          </div>
          <h3 className="font-serif-editorial text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 leading-snug">
            <Link href={`/article/${post.slug}`}>
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
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
          <span>{authorName}</span>
          <span>{post.readingTime} min read</span>
        </div>
      </div>
    </article>
  );
}

