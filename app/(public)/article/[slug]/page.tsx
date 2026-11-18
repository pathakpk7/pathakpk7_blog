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
import { BhojpatraManuscript } from "@/components/enchanted/BhojpatraManuscript";
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
    <main className="min-h-screen pb-24 bg-[#0F0A06]">
      {/* Top Navigation & Administration Controls */}
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/${post.section}`}
          className="inline-flex items-center space-x-2 text-xs font-serif text-[#C9AB75]/80 hover:text-[#FAF4E6] transition-colors py-1.5 px-3 rounded-sm bg-[#1A1209]/80 border border-[#8C6745]/30 hover:border-[#FAF4E6]/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="capitalize">← Return to {post.section}</span>
        </Link>

        {/* Client-side dynamic admin controls */}
        <ArticleAdminControls
          postId={post.id}
          postTitle={post.title}
          section={post.section}
        />
      </div>

      {/* =========================================================================
          BHOJPATRA BIRCH BARK MANUSCRIPT SHEET
          Stretched to complete screen, cover image at top middle, followed by blog
      ========================================================================= */}
      <BhojpatraManuscript>
        <article className="w-full space-y-10">
          {/* 1. TOP MIDDLE: Featured Cover Image */}
          {post.coverImageUrl && (
            <div className="w-full flex justify-center pb-2">
              <div className="relative w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl border-2 border-[#6E4018]/50 bg-[#241508]/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  className="w-full h-auto max-h-[460px] object-cover mx-auto"
                  loading="eager"
                />
              </div>
            </div>
          )}

          {/* 2. Manuscript Masthead Header */}
          <header className="space-y-6 text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-xs font-serif tracking-[0.25em] uppercase text-[#7A5230] font-semibold">
              <span>❦ {post.section}</span>
              <span>•</span>
              <span>{post.contentType?.toLowerCase()} ❦</span>
            </div>

            {isQuote ? (
              <div className="py-8 px-4 sm:px-8 text-center my-4 space-y-6">
                <blockquote className={cn(
                  "text-2xl sm:text-4xl lg:text-5xl font-manuscript font-normal text-[#1A1209] leading-relaxed",
                  isHindi && "font-devanagari text-3xl sm:text-4xl"
                )}>
                  &ldquo;{post.title}&rdquo;
                </blockquote>
                {post.subtitle && (
                  <cite className="block text-base sm:text-lg text-[#5A3A1E] font-cormorant italic">
                    — {post.subtitle}
                  </cite>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className={isCreative && isHindi ? "font-devanagari text-4xl sm:text-5xl font-semibold text-[#1A1209] leading-snug" : "font-manuscript text-3xl sm:text-5xl lg:text-6xl font-normal text-[#1A1209] tracking-tight leading-[1.12]"}>
                  {post.title}
                </h1>

                {post.subtitle && (
                  <p className="font-cormorant text-xl sm:text-2xl text-[#4A2F17] italic leading-relaxed max-w-2xl mx-auto">
                    {post.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Scribe Byline / Metadata Rule */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-3.5 border-t border-b border-[#7A5230]/25 text-xs sm:text-sm font-serif text-[#6E4018]">
              <Link
                href={`/${post.author?.profile?.username || "pathak"}`}
                className="flex items-center space-x-2 text-[#1A1209] font-medium hover:text-[#5A3A1E] transition-colors"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-[#FAF4E6] shrink-0 border border-[#7A5230]/40">
                  <Image
                    src={getSafeAvatarUrl(authorAvatar, post.author?.profile?.username || "pathak")}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-serif italic font-medium">{authorName}</span>
              </Link>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7A5230]" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7A5230]" />
                <span>{post.readingTime || calculateReadingTime(post.content)} min inscribe</span>
              </div>
            </div>
          </header>

          {/* 3. The Article Prose Body */}
          <div className="max-w-3xl mx-auto font-eb-garamond text-lg sm:text-xl text-[#1E150F] leading-relaxed sm:leading-[1.9] space-y-6">
            {contentElement}
          </div>

          {/* 4. Topics & Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-[#7A5230]/20 max-w-3xl mx-auto text-xs font-serif text-[#6E4018]">
              <span className="font-semibold text-[#1A1209]">Topics:</span>
              {post.tags.map(({ tag }: any) => (
                <Link
                  key={tag.id}
                  href={`/search?q=${tag.slug}`}
                  className="px-2.5 py-1 text-xs font-serif italic rounded-xs bg-[#FAF4E6]/70 hover:bg-[#FAF4E6] text-[#3D1A07] border border-[#7A5230]/30 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 5. Author Scribe Byline Card */}
          <div className="p-6 sm:p-8 bg-[#FAF4E6]/75 rounded-xs border border-[#7A5230]/30 max-w-3xl mx-auto flex items-start space-x-4 shadow-sm">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#E8D5AD] shrink-0 border border-[#7A5230]/40">
              <Image
                src={getSafeAvatarUrl(authorAvatar, post.author?.profile?.username || "pathak")}
                alt={authorName}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-manuscript text-xl font-normal text-[#1A1209]">
                {authorName}
              </h3>
              <p className="font-cormorant italic text-sm text-[#5A3A1E] leading-relaxed">
                {authorBio}
              </p>
            </div>
          </div>

          {/* 6. Related Dispatches */}
          {relatedPosts.length > 0 && (
            <div className="pt-10 border-t border-[#7A5230]/25 space-y-6 max-w-3xl mx-auto">
              <h3 className="font-manuscript text-2xl font-normal text-[#1A1209]">
                ❦ Related Dispatches in the Folio ❦
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedPosts.map((related: any) => (
                  <ArticleCard key={related.id} post={related} variant="compact" />
                ))}
              </div>
            </div>
          )}

          {/* 7. Comments Section */}
          <div className="max-w-3xl mx-auto pt-8 border-t border-[#7A5230]/25">
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
      </BhojpatraManuscript>
    </main>
  );
}
