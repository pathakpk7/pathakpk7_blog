import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { formatDate, calculateReadingTime, getSafeAvatarUrl } from "@/lib/utils";
import { ArticleActions } from "@/components/article/ArticleActions";
import { CommentSection } from "@/components/article/CommentSection";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Clock, Calendar, Tag as TagIcon, ArrowLeft } from "lucide-react";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MdxComponents";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function renderArticleContent(content: string, isCreative: boolean) {
  if (!content) return null;

  const containerClass = isCreative
    ? "max-w-2xl mx-auto space-y-6 text-lg leading-relaxed font-serif whitespace-pre-line py-4"
    : "prose prose-zinc dark:prose-invert prose-editorial mx-auto max-w-3xl";

  // Check if content is HTML from the Tiptap editor or rich HTML
  const isHtml =
    /^\s*<[a-z][\s\S]*>/i.test(content) ||
    /<\/(p|h[1-6]|ul|ol|li|blockquote|div|pre|table|figure|section)>/i.test(content) ||
    /<(p|h[1-6]|ul|ol|li|blockquote|div|pre|img|table|figure|br)\b[^>]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={containerClass}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Attempt to compile Markdown / MDX
  try {
    const { content: compiledContent } = await compileMDX({
      source: content,
      components: mdxComponents,
    });

    return <div className={containerClass}>{compiledContent}</div>;
  } catch (err) {
    console.warn("MDX compilation fallback triggered:", err);
    return (
      <div className={containerClass}>
        <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
      </div>
    );
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await db.post.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        coverImageUrl: true,
        publishedAt: true,
      },
    });

    if (!post) return { title: "Article Not Found | ThePathak.tech" };

    let publishedTime: string | undefined = undefined;
    if (post.publishedAt instanceof Date && !isNaN(post.publishedAt.getTime())) {
      publishedTime = post.publishedAt.toISOString();
    }

    return {
      title: post.seoTitle || `${post.title} | ThePathak.tech`,
      description: post.seoDescription || post.excerpt || "",
      openGraph: {
        title: post.title,
        description: post.excerpt || "",
        type: "article",
        publishedTime,
        images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
      },
    };
  } catch (err) {
    return { title: "Article | ThePathak.tech" };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  let post: any = null;
  let relatedPosts: any[] = [];

  try {
    post = await db.post.findUnique({
      where: { slug },
      include: {
        author: {
          include: { profile: true },
        },
        category: true,
        tags: { include: { tag: true } },
        likes: true,
        bookmarks: userId ? { where: { userId } } : false,
        comments: {
          where: { parentId: null, status: "APPROVED" },
          include: {
            user: { include: { profile: true } },
            replies: {
              where: { status: "APPROVED" },
              include: { user: { include: { profile: true } } },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (post) {
      db.postView.create({
        data: {
          postId: post.id,
          userId: userId || null,
          sessionId: userId || "anon-" + Math.random().toString(36).slice(2),
        },
      }).catch(() => {});

      relatedPosts = await db.post.findMany({
        where: {
          status: "PUBLISHED",
          section: post.section,
          NOT: { id: post.id },
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
      });
    }
  } catch (err) {
    console.warn("ArticlePage DB query fallback:", err);
  }

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const isLiked = userId ? post.likes?.some((l: any) => l.userId === userId) : false;
  const isBookmarked = userId ? (post.bookmarks as any[])?.length > 0 : false;
  const authorName = post.author?.profile?.displayName || post.author?.name || "The Pathak";
  const authorBio = post.author?.profile?.bio || "Lead Software Architect, Writer & Thinker.";
  const authorAvatar = post.author?.profile?.avatarUrl;
  const isCreative = post.section === "creative";
  const isHindi = post.tags?.some((t: any) => t.tag.slug === "hindi");
  const contentElement = await renderArticleContent(post.content, isCreative);

  return (
    <main className="min-h-screen pb-32 pt-6 sm:pt-8">
      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
        <Link
          href={`/${post.section}`}
          className="inline-flex items-center space-x-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {post.section.toUpperCase()}</span>
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Article Header */}
        <header className="space-y-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-3 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            <span>{post.section}</span>
            <span>•</span>
            <span className="text-muted-foreground font-normal">{post.contentType}</span>
          </div>

          <h1 className={isCreative && isHindi ? "font-devanagari text-4xl sm:text-5xl font-bold leading-snug" : "font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight"}>
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
              {post.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-4 border-t border-b border-border py-4 text-xs text-muted-foreground">
            <Link
              href={`/${post.author?.profile?.username || "pathak"}`}
              className="flex items-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0 border border-border">
                <Image
                  src={getSafeAvatarUrl(authorAvatar, post.author?.profile?.username || "pathak")}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-semibold text-foreground">{authorName}</span>
              {post.author?.profile?.username && (
                <span className="font-mono text-zinc-400 text-[11px]">@{post.author.profile.username}</span>
              )}
            </Link>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime || calculateReadingTime(post.content)} min read</span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="relative h-80 sm:h-[450px] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-border">
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
            />
          </div>
        )}

        {/* Article Body */}
        {contentElement}

        {/* Tags list */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-border max-w-3xl mx-auto">
            <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
            {post.tags.map(({ tag }: any) => (
              <span key={tag.id} className="px-3 py-1 text-xs rounded-full bg-muted text-foreground">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        <div className="p-6 rounded-2xl bg-card border border-border max-w-3xl mx-auto flex items-start space-x-4">
          <Link href={`/${post.author?.profile?.username || "pathak"}`} className="shrink-0">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-zinc-800 border border-border p-0.5 hover:scale-105 transition-transform">
              <Image
                src={authorAvatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${post.author?.profile?.username || "pathak"}`}
                alt={authorName}
                fill
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link href={`/${post.author?.profile?.username || "pathak"}`} className="font-semibold text-foreground text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {authorName}
              </Link>
              {post.author?.profile?.username && (
                <span className="font-mono text-zinc-400 text-xs">@{post.author.profile.username}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{authorBio}</p>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <ArticleActions
            postId={post.id}
            initialLiked={isLiked}
            initialLikeCount={post.likes?.length || 0}
            initialBookmarked={isBookmarked}
            commentCount={post.comments?.length || 0}
            slug={post.slug}
            title={post.title}
            isLoggedIn={!!userId}
          />
        </div>

        {/* Comment Section */}
        <CommentSection postId={post.id} comments={(post.comments as any) || []} isLoggedIn={!!userId} />

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="pt-16 border-t border-border space-y-6 max-w-4xl mx-auto">
            <h3 className="font-serif-editorial text-2xl font-bold text-foreground">
              More from {post.section.toUpperCase()}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <ArticleCard key={rel.id} post={rel as any} variant="standard" />
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
