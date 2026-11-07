import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { formatDate, calculateReadingTime, getSafeAvatarUrl, cn, getBaseUrl } from "@/lib/utils";
import { ArticleActions } from "@/components/article/ArticleActions";
import { CommentSection } from "@/components/article/CommentSection";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Clock, Calendar, ArrowLeft, Edit3 } from "lucide-react";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { headers } from "next/headers";
import { DeletePostButton } from "@/components/article/DeletePostButton";

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function renderArticleContent(content: string, isCreative: boolean, isQuote: boolean = false) {
  if (!content) return null;

  const containerClass = isQuote
    ? "max-w-3xl mx-auto space-y-6 text-xl sm:text-2xl leading-relaxed font-serif-editorial italic text-center py-8 px-4 whitespace-pre-line"
    : isCreative
    ? "max-w-2xl mx-auto space-y-6 text-lg leading-relaxed font-serif whitespace-pre-line py-6"
    : "prose prose-zinc dark:prose-invert prose-editorial mx-auto max-w-3xl";

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
        subtitle: true,
        excerpt: true,
        content: true,
        section: true,
        contentType: true,
        seoTitle: true,
        seoDescription: true,
        coverImageUrl: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            profile: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!post) return { title: "Article Not Found | ThePathak.tech" };

    let baseUrl = getBaseUrl();
    try {
      const headerList = await headers();
      const host = headerList.get("x-forwarded-host") || headerList.get("host");
      const proto = headerList.get("x-forwarded-proto") || "https";
      if (host) {
        baseUrl = `${proto}://${host}`;
      }
    } catch {}

    const isQuote = post.contentType === "QUOTE";
    const rawTitle = post.seoTitle || (isQuote ? `“${post.title}”` : post.title);

    let plainContent = "";
    if (post.content) {
      plainContent = post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
    }
    const description =
      post.seoDescription ||
      post.excerpt ||
      post.subtitle ||
      (plainContent ? `${plainContent}...` : "") ||
      "An editorial publication on ThePathak.tech";

    const authorName = post.author?.profile?.displayName || post.author?.name || "The Pathak";

    let publishedTime: string | undefined = undefined;
    if (post.publishedAt instanceof Date && !isNaN(post.publishedAt.getTime())) {
      publishedTime = post.publishedAt.toISOString();
    }

    const emblemUrl = `${baseUrl}/emblem.png`;
    const canonicalUrl = `${baseUrl}/article/${slug}`;

    return {
      title: rawTitle,
      description,
      authors: [{ name: authorName }],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: post.title,
        description,
        url: canonicalUrl,
        siteName: "ThePathak.tech",
        locale: "en_US",
        type: "article",
        publishedTime,
        authors: [authorName],
        images: [
          {
            url: emblemUrl,
            secureUrl: emblemUrl,
            width: 512,
            height: 512,
            type: "image/png",
            alt: "ThePathak.tech Logo",
          },
        ],
      },
      twitter: {
        card: "summary",
        title: post.title,
        description,
        images: [emblemUrl],
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
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

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
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                profile: {
                  select: {
                    displayName: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        bookmarks: true,
        comments: {
          where: { parentId: null, status: "APPROVED" },
          include: {
            user: { include: { profile: true } },
            likes: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    profile: { select: { displayName: true, username: true, avatarUrl: true } },
                  },
                },
              },
            },
            replies: {
              where: { status: "APPROVED" },
              include: {
                user: { include: { profile: true } },
                likes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        image: true,
                        profile: { select: { displayName: true, username: true, avatarUrl: true } },
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (post) {
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
  const isBookmarked = userId ? (post.bookmarks as any[])?.some((b: any) => b.userId === userId) : false;
  const bookmarkCount = (post.bookmarks as any[])?.length || 0;
  const likedUsers = (post.likes || []).map((l: any) => ({
    id: l.user?.id,
    name: l.user?.profile?.displayName || l.user?.name || "Reader",
    username: l.user?.profile?.username || (l.user?.name ? l.user.name.toLowerCase().replace(/\s+/g, "_") : "reader"),
    avatarUrl: l.user?.profile?.avatarUrl || l.user?.image,
  }));

  const formatCommentLikedUsers = (likesList: any[]) =>
    (likesList || []).map((l: any) => ({
      id: l.user?.id || l.userId,
      name: l.user?.profile?.displayName || l.user?.name || "Reader",
      username: l.user?.profile?.username || (l.user?.name ? l.user.name.toLowerCase().replace(/\s+/g, "_") : "reader"),
      avatarUrl: l.user?.profile?.avatarUrl || l.user?.image,
    }));

  const formattedComments = (post.comments || []).map((c: any) => ({
    ...c,
    isLiked: userId ? (c.likes || []).some((l: any) => l.userId === userId) : false,
    likesCount: c.likes?.length || 0,
    likedUsers: formatCommentLikedUsers(c.likes),
    replies: (c.replies || []).map((r: any) => ({
      ...r,
      isLiked: userId ? (r.likes || []).some((l: any) => l.userId === userId) : false,
      likesCount: r.likes?.length || 0,
      likedUsers: formatCommentLikedUsers(r.likes),
    })),
  }));

  const totalCommentsCount = formattedComments.reduce(
    (acc: number, c: any) => acc + 1 + (c.replies?.length || 0),
    0
  );

  const authorName = post.author?.profile?.displayName || post.author?.name || "The Pathak";
  const authorBio = post.author?.profile?.bio || "Lead Software Architect, Writer & Thinker";
  const authorAvatar = post.author?.profile?.avatarUrl;
  const isCreative = post.section === "creative";
  const isQuote = post.contentType?.toUpperCase() === "QUOTE";
  const isHindi = post.tags?.some((t: any) => t.tag?.slug === "hindi" || t.slug === "hindi");
  const contentElement = await renderArticleContent(post.content, isCreative, isQuote);

  return (
    <main className="min-h-screen pb-32 pt-8 sm:pt-12">
      {/* Navigation and Administration Controls */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${post.section}`}
          className="inline-flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="capitalize">Back to {post.section}</span>
        </Link>

        {isAdmin && (
          <div className="flex items-center space-x-2">
            <Link
              href={`/studio/posts/${post.id}/edit`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Dispatch</span>
            </Link>
            <DeletePostButton
              postId={post.id}
              postTitle={post.title}
              redirectTo={`/${post.section}`}
              variant="button"
            />
          </div>
        )}
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Masthead Header */}
        <header className="space-y-6">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground capitalize">{post.section}</span>
            <span>/</span>
            <span className="capitalize">{post.contentType?.toLowerCase()}</span>
          </div>

          {isQuote ? (
            <div className="py-12 px-6 sm:px-12 text-center my-6 space-y-6">
              <blockquote className={cn(
                "text-2xl sm:text-4xl lg:text-5xl font-serif-editorial font-normal tracking-tight text-foreground leading-relaxed",
                isHindi && "font-devanagari text-3xl sm:text-4xl"
              )}>
                &ldquo;{post.title}&rdquo;
              </blockquote>
              {post.subtitle && (
                <cite className="block text-base sm:text-lg text-muted-foreground font-serif not-italic">
                  — {post.subtitle}
                </cite>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className={isCreative && isHindi ? "font-devanagari text-4xl sm:text-5xl font-semibold leading-snug" : "font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.12]"}>
                {post.title}
              </h1>

              {post.subtitle && (
                <p className="text-lg sm:text-xl text-muted-foreground font-normal leading-relaxed max-w-3xl">
                  {post.subtitle}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 py-4 border-t border-b border-border text-xs text-muted-foreground">
            <Link
              href={`/${post.author?.profile?.username || "pathak"}`}
              className="flex items-center space-x-2 text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                <Image
                  src={getSafeAvatarUrl(authorAvatar, post.author?.profile?.username || "pathak")}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <span>{authorName}</span>
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
          <div className="relative w-full rounded-sm overflow-hidden bg-muted flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              className="w-full h-auto max-h-[650px] object-contain rounded-sm"
              loading="eager"
            />
          </div>
        )}

        {/* Article Body */}
        {contentElement}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border max-w-3xl mx-auto text-xs text-muted-foreground">
            <span>Keywords:</span>
            {post.tags.map(({ tag }: any) => (
              <span key={tag.id} className="text-foreground hover:underline">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Author Byline Box */}
        <div className="p-6 sm:p-8 bg-secondary/40 rounded-sm max-w-3xl mx-auto flex items-start space-x-5">
          <Link href={`/${post.author?.profile?.username || "pathak"}`} className="shrink-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted border border-border">
              <Image
                src={authorAvatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${post.author?.profile?.username || "pathak"}`}
                alt={authorName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </Link>
          <div className="space-y-1">
            <Link
              href={`/${post.author?.profile?.username || "pathak"}`}
              className="font-medium text-foreground text-sm hover:underline"
            >
              {authorName}
            </Link>
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
            initialBookmarkCount={bookmarkCount}
            commentCount={totalCommentsCount}
            likedUsers={likedUsers}
            slug={post.slug}
            title={post.title}
            isLoggedIn={!!userId}
            isAdmin={isAdmin}
            section={post.section}
          />
        </div>

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          comments={formattedComments}
          isLoggedIn={!!userId}
          currentUserId={userId}
          isAdmin={isAdmin}
        />

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="pt-16 border-t border-border space-y-8 max-w-4xl mx-auto">
            <h3 className="font-serif-editorial text-2xl font-semibold text-foreground">
              Further Reading
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
