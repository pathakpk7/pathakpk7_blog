import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { cache } from "react";
import { db } from "@/lib/db/prisma";
import { formatDate, calculateReadingTime, getSafeAvatarUrl, cn, getBaseUrl } from "@/lib/utils";
import { ArticleActions } from "@/components/article/ArticleActions";
import { CommentSection } from "@/components/article/CommentSection";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleAdminControls } from "@/components/article/ArticleAdminControls";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx/MdxComponents";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const getArticle = cache(async (slug: string) => {
  return await db.post.findUnique({
    where: { slug },
    include: {
      author: {
        include: {
          profile: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      likes: {
        select: {
          userId: true,
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
      },
      bookmarks: {
        select: {
          userId: true,
        },
      },
      comments: {
        where: {
          status: "APPROVED",
          parentId: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: {
            select: {
              userId: true,
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
          },
          replies: {
            where: {
              status: "APPROVED",
            },
            orderBy: {
              createdAt: "asc",
            },
            include: {
              likes: {
                select: {
                  userId: true,
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
              },
            },
          },
        },
      },
    },
  });
});

async function getRelatedPosts(section: string, currentPostId: string) {
  return await db.post.findMany({
    where: {
      section,
      status: "PUBLISHED",
      id: { not: currentPostId },
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: {
      author: { include: { profile: true } },
      tags: { include: { tag: true } },
    },
  });
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
    const post = await getArticle(slug);

    if (!post) return { title: "Article Not Found | ThePathak.tech" };

    const baseUrl = getBaseUrl();
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
  const post = await getArticle(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.section, post.id);

  const formatCommentLikedUsers = (likesList: any[]) =>
    (likesList || []).map((l: any) => ({
      id: l.user?.id || l.userId,
      name: l.user?.profile?.displayName || l.user?.name || "Reader",
      username: l.user?.profile?.username || (l.user?.name ? l.user.name.toLowerCase().replace(/\s+/g, "_") : "reader"),
      avatarUrl: l.user?.profile?.avatarUrl || l.user?.image,
    }));

  const formattedComments = (post.comments || []).map((c: any) => ({
    ...c,
    isLiked: false,
    likesCount: c.likes?.length || 0,
    likedUsers: formatCommentLikedUsers(c.likes),
    replies: (c.replies || []).map((r: any) => ({
      ...r,
      isLiked: false,
      likesCount: r.likes?.length || 0,
      likedUsers: formatCommentLikedUsers(r.likes),
    })),
  }));

  const totalCommentsCount = formattedComments.reduce(
    (acc: number, c: any) => acc + 1 + (c.replies?.length || 0),
    0
  );

  const likedUsers = (post.likes || []).map((l: any) => ({
    id: l.user?.id,
    name: l.user?.profile?.displayName || l.user?.name || "Reader",
    username: l.user?.profile?.username || (l.user?.name ? l.user.name.toLowerCase().replace(/\s+/g, "_") : "reader"),
    avatarUrl: l.user?.profile?.avatarUrl || l.user?.image,
  }));

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

        {/* Client-side dynamic admin controls */}
        <ArticleAdminControls
          postId={post.id}
          postTitle={post.title}
          section={post.section}
        />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Masthead Header */}
        <header className="space-y-6">
          <div className="flex items-center space-x-2 text-xs">
            <span className={cn(
              "font-semibold uppercase tracking-wider text-[11px]",
              post.section === "technology" && "text-blue-600 dark:text-blue-400",
              post.section === "science" && "text-indigo-600 dark:text-indigo-400",
              post.section === "coding" && "text-emerald-600 dark:text-emerald-400",
              post.section === "ideas" && "text-amber-600 dark:text-amber-400",
              post.section === "creative" && "text-orange-600 dark:text-orange-400",
              post.section === "notes" && "text-cyan-600 dark:text-cyan-400"
            )}>
              {post.section}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="capitalize text-muted-foreground">{post.contentType?.toLowerCase()}</span>
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
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-border max-w-3xl mx-auto text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Topics:</span>
            {post.tags.map(({ tag }: any) => (
              <Link
                key={tag.id}
                href={`/search?q=${tag.slug}`}
                className="px-2.5 py-1 text-xs font-mono rounded-xs bg-secondary/80 hover:bg-secondary text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-border"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Author Byline Box */}
        <div className="p-6 sm:p-8 bg-secondary/30 rounded-sm border border-border max-w-3xl mx-auto flex items-start space-x-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
            <Image
              src={getSafeAvatarUrl(authorAvatar, post.author?.profile?.username || "pathak")}
              alt={authorName}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif-editorial text-lg font-semibold text-foreground">
              {authorName}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {authorBio}
            </p>
          </div>
        </div>

        {/* Related Dispatches */}
        {relatedPosts.length > 0 && (
          <div className="pt-12 border-t border-border space-y-6 max-w-3xl mx-auto">
            <h3 className="font-serif-editorial text-xl font-semibold text-foreground">
              Related Dispatches
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((related: any) => (
                <ArticleCard key={related.id} post={related} variant="compact" />
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto pt-8 border-t border-border">
          <CommentSection
            postId={post.id}
            comments={formattedComments}
            isLoggedIn={false}
          />
        </div>

        {/* Reader Floating Dock */}
        <ArticleActions
          postId={post.id}
          initialLiked={false}
          initialLikeCount={post.likes?.length || 0}
          initialBookmarked={false}
          initialBookmarkCount={post.bookmarks?.length || 0}
          commentCount={totalCommentsCount}
          likedUsers={likedUsers}
          slug={post.slug}
          title={post.title}
          section={post.section}
        />
      </article>
    </main>
  );
}
