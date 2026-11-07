import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Calendar, ArrowLeft, Settings, ExternalLink } from "lucide-react";
import { formatDate, getSafeAvatarUrl, getBaseUrl, cn } from "@/lib/utils";
import { headers } from "next/headers";

export const revalidate = 60;

interface SectionPageProps {
  params: Promise<{ section: string }>;
  searchParams?: Promise<{ type?: string }>;
}

const VALID_SECTIONS: Record<string, { title: string; subtitle: string }> = {
  technology: {
    title: "Technology & AI",
    subtitle: "Analysis, explainers, autonomous agent systems, dev tools, and cybersecurity.",
  },
  science: {
    title: "Science & Space",
    subtitle: "Astrophysics, orbital space missions, quantum physics, and major discoveries.",
  },
  coding: {
    title: "Coding & Architecture",
    subtitle: "Tutorials, React 19, Next.js App Router, LeetCode, and developer roadmaps.",
  },
  ideas: {
    title: "Ideas & Essays",
    subtitle: "Observations on deep work, focus, discipline, and developer life.",
  },
  creative: {
    title: "Creative & Poems",
    subtitle: "Original poetry, Hindi Shayari, memorable quotes, microfiction, and short prose.",
  },
  notes: {
    title: "Notes & Musings",
    subtitle: "Short-form observations, quick tools, micro-tips, and technical thoughts.",
  },
};

export async function generateMetadata({ params }: SectionPageProps) {
  const { section } = await params;
  let baseUrl = getBaseUrl();
  try {
    const headerList = await headers();
    const host = headerList.get("x-forwarded-host") || headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") || "https";
    if (host) baseUrl = `${proto}://${host}`;
  } catch {}

  const config = VALID_SECTIONS[section];

  if (config) {
    const title = `${config.title} | ThePathak.tech`;
    const description = config.subtitle;
    const url = `${baseUrl}/${section}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        siteName: "ThePathak.tech",
        type: "website",
        images: [
          {
            url: `${baseUrl}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: config.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${baseUrl}/opengraph-image`],
      },
    };
  }

  try {
    const profile = await db.profile.findFirst({
      where: {
        username: {
          equals: section.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (profile) {
      const title = `${profile.displayName} (@${profile.username}) | ThePathak.tech`;
      const description = profile.bio || `Profile and publications by ${profile.displayName} on ThePathak.tech`;
      const url = `${baseUrl}/${profile.username}`;
      const avatar = profile.avatarUrl || `${baseUrl}/emblem.png`;

      return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: {
          title,
          description,
          url,
          siteName: "ThePathak.tech",
          type: "profile",
          images: [
            {
              url: avatar.startsWith("http") ? avatar : `${baseUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`,
              width: 512,
              height: 512,
              alt: profile.displayName,
            },
          ],
        },
        twitter: {
          card: "summary",
          title,
          description,
          images: [avatar.startsWith("http") ? avatar : `${baseUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`],
        },
      };
    }
  } catch (err) {
    // Ignore metadata lookup error
  }

  return { title: "Page Not Found | ThePathak.tech" };
}

export default async function SectionOrProfilePage({ params, searchParams }: SectionPageProps) {
  const { section } = await params;
  const resolvedSearchParams = await searchParams;
  const typeFilter = resolvedSearchParams?.type?.toUpperCase();
  const sectionConfig = VALID_SECTIONS[section];

  if (sectionConfig && section !== "creative" && typeFilter === "QUOTE") {
    redirect("/creative?type=quote");
  }

  if (sectionConfig) {
    let posts: any[] = [];
    let allSectionPostTypes: string[] = [];

    try {
      const allPosts = await db.post.findMany({
        where: {
          status: "PUBLISHED",
          section: section,
        },
        select: { contentType: true },
      });
      allSectionPostTypes = Array.from(new Set(allPosts.map((p) => p.contentType)));

      const whereClause: any = {
        status: "PUBLISHED",
        section: section,
      };

      if (typeFilter && typeFilter !== "ALL") {
        whereClause.contentType = typeFilter;
      }

      posts = await db.post.findMany({
        where: whereClause,
        include: {
          author: { include: { profile: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: "desc" },
      });
    } catch (err) {
      console.warn("SectionPage DB query fallback:", err);
    }

    const isCreative = section === "creative";
    const defaultTypes = isCreative
      ? ["POEM", "SHAYARI", "QUOTE", "MICROFICTION", "SHORT_STORY", "SHORT_PROSE"]
      : section === "ideas"
      ? ["ESSAY", "ARTICLE"]
      : section === "notes"
      ? ["NOTE", "ARTICLE"]
      : ["ARTICLE", "TUTORIAL", "GUIDE"];

    const combinedTypes = Array.from(new Set([...allSectionPostTypes, ...defaultTypes]))
      .filter((t) => isCreative || t !== "QUOTE");
    const availableTypes = ["ALL", ...combinedTypes];

    const sectionThemeMap: Record<string, { badge: string; tabActive: string }> = {
      technology: {
        badge: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
        tabActive: "bg-blue-600 text-white font-medium shadow-xs",
      },
      science: {
        badge: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        tabActive: "bg-indigo-600 text-white font-medium shadow-xs",
      },
      coding: {
        badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        tabActive: "bg-emerald-600 text-white font-medium shadow-xs",
      },
      ideas: {
        badge: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
        tabActive: "bg-amber-600 text-white font-medium shadow-xs",
      },
      creative: {
        badge: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
        tabActive: "bg-orange-600 text-white font-medium shadow-xs",
      },
      notes: {
        badge: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        tabActive: "bg-cyan-600 text-white font-medium shadow-xs",
      },
    };
    const currentTheme = sectionThemeMap[section.toLowerCase()] || sectionThemeMap.technology;

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 min-h-screen">
        {/* Section Masthead */}
        <header className="space-y-4 pb-8 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <span className={cn("px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-xs border", currentTheme.badge)}>
              {section.toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">Archive</span>
          </div>
          <h1 className="font-serif-editorial text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            {sectionConfig.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {sectionConfig.subtitle}
          </p>

          {/* Minimal Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            {availableTypes.map((t) => {
              const isActive = (!typeFilter && t === "ALL") || typeFilter === t;
              return (
                <Link
                  key={t}
                  href={t === "ALL" ? `/${section}` : `/${section}?type=${t.toLowerCase()}`}
                  className={cn(
                    "px-3 py-1 text-xs rounded-sm transition-all",
                    isActive
                      ? currentTheme.tabActive
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {t === "ALL" ? "All Dispatches" : t.replace(/_/g, " ").toLowerCase()}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Publications Grid */}
        {posts.length === 0 ? (
          <div className="py-24 text-center space-y-3 bg-secondary/30 rounded-sm">
            <p className="text-base font-medium text-foreground">
              {typeFilter ? `No publications under ${typeFilter.toLowerCase()} in this section.` : "No publications found in this section yet."}
            </p>
            <p className="text-xs text-muted-foreground">
              {typeFilter ? (
                <Link href={`/${section}`} className="text-foreground hover:underline">
                  View all {sectionConfig.title} dispatches
                </Link>
              ) : (
                "New publications are in editorial review."
              )}
            </p>
          </div>
        ) : (
          <div className={isCreative ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "grid grid-cols-1 md:grid-cols-3 gap-8"}>
            {posts.map((post) => (
              <ArticleCard
                key={post.id}
                post={post as any}
                variant={post.contentType === "QUOTE" ? "quote" : isCreative ? "creative" : "standard"}
              />
            ))}
          </div>
        )}
      </main>
    );
  }

  // Profile View
  const session = await auth();
  const currentUserId = session?.user?.id;
  const currentUserEmail = session?.user?.email?.toLowerCase();
  const currentUsername = (session?.user as any)?.username;
  const isCurrentAdmin = (session?.user as any)?.role === "ADMIN" || currentUserEmail === "prasoon7pathak@gmail.com";

  let profile: any = null;
  let userPosts: any[] = [];
  let likedPosts: any[] = [];
  let bookmarkedPosts: any[] = [];
  let userComments: any[] = [];

  try {
    profile = await db.profile.findFirst({
      where: {
        username: {
          equals: section.toLowerCase(),
          mode: "insensitive",
        },
      },
      include: {
        user: {
          include: {
            posts: {
              where: { status: "PUBLISHED" },
              orderBy: { publishedAt: "desc" },
              include: {
                author: { include: { profile: true } },
                tags: { include: { tag: true } },
              },
            },
            likes: {
              orderBy: { createdAt: "desc" },
              include: {
                post: {
                  include: {
                    author: { include: { profile: true } },
                    tags: { include: { tag: true } },
                  },
                },
              },
            },
            bookmarks: {
              orderBy: { createdAt: "desc" },
              include: {
                post: {
                  include: {
                    author: { include: { profile: true } },
                    tags: { include: { tag: true } },
                  },
                },
              },
            },
            comments: {
              orderBy: { createdAt: "desc" },
              include: {
                post: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    section: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (profile) {
      const isViewerOwner =
        currentUserId === profile.userId ||
        currentUserEmail === profile.user?.email?.toLowerCase() ||
        currentUsername === profile.username ||
        isCurrentAdmin;

      userPosts = profile.user?.posts || [];
      likedPosts = (profile.user?.likes || [])
        .map((l: any) => l.post)
        .filter((p: any) => p && p.status === "PUBLISHED");

      if (isViewerOwner) {
        bookmarkedPosts = (profile.user?.bookmarks || [])
          .map((b: any) => b.post)
          .filter((p: any) => p && p.status === "PUBLISHED");
      } else {
        bookmarkedPosts = [];
      }

      userComments = (profile.user?.comments || []).filter((c: any) => {
        if (!c || !c.post) return false;
        if (isViewerOwner) return true;
        return c.status === "APPROVED" && c.post.status === "PUBLISHED";
      });
    }
  } catch (err) {
    console.warn("Profile lookup fallback:", err);
  }

  if (!profile) {
    notFound();
  }

  const avatarUrl = getSafeAvatarUrl(profile.avatarUrl, profile.username);
  const isAdmin = profile.user?.role === "ADMIN" || profile.user?.email === "prasoon7pathak@gmail.com";
  const hasPublishedPosts = userPosts.length > 0;
  const isOwnProfile =
    currentUserId === profile.userId ||
    currentUserEmail === profile.user?.email?.toLowerCase() ||
    currentUsername === profile.username;
  const isViewerOwner = isOwnProfile || isCurrentAdmin;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* User Profile Header */}
      <section className="space-y-6 pb-8 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-muted border border-border shrink-0">
              <Image
                src={avatarUrl}
                alt={profile.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-foreground">
                  {profile.displayName}
                </h1>
                {isAdmin && (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Author
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                @{profile.username}
              </p>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground pt-1">
                <Calendar className="w-3 h-3" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwnProfile && (
              <Link
                href="/settings"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-sm transition-colors border border-border"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Settings</span>
              </Link>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-sm transition-colors border border-border"
              >
                <span>Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            {profile.bio}
          </p>
        )}

        {/* Minimal Metrics */}
        <div className="flex items-center space-x-8 pt-4 text-xs text-muted-foreground">
          {(isAdmin || hasPublishedPosts) && (
            <div>
              <span className="font-semibold text-foreground mr-1">{userPosts.length}</span>
              <span>Dispatches</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-foreground mr-1">{likedPosts.length}</span>
            <span>Appreciations</span>
          </div>
          {isViewerOwner && (
            <div>
              <span className="font-semibold text-foreground mr-1">{bookmarkedPosts.length}</span>
              <span>Saved</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-foreground mr-1">{userComments.length}</span>
            <span>Notes</span>
          </div>
        </div>
      </section>

      {/* Activity History Tabs */}
      <ProfileTabs
        displayName={profile.displayName}
        username={profile.username}
        isAdmin={isAdmin}
        canViewBookmarks={isViewerOwner}
        publishedPosts={userPosts}
        likedPosts={likedPosts}
        bookmarkedPosts={bookmarkedPosts}
        comments={userComments}
      />
    </main>
  );
}
