import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { User, Calendar, BookOpen, ExternalLink, ArrowLeft, PenTool, Sparkles, Heart, Bookmark as BookmarkIcon, MessageSquare, Settings } from "lucide-react";
import { formatDate, getSafeAvatarUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

const VALID_SECTIONS: Record<string, { title: string; subtitle: string; iconName: string }> = {
  technology: {
    title: "Technology & AI",
    subtitle: "Analysis, explainers, autonomous agent systems, dev tools, and cybersecurity.",
    iconName: "Layers",
  },
  science: {
    title: "Science & Space",
    subtitle: "Astrophysics, orbital space missions, quantum physics, and major discoveries.",
    iconName: "Rocket",
  },
  coding: {
    title: "Coding & Walkthroughs",
    subtitle: "Tutorials, React 19, Next.js App Router, LeetCode, and developer roadmaps.",
    iconName: "Code2",
  },
  ideas: {
    title: "Ideas & Essays",
    subtitle: "Personal observations on deep work, focus, discipline, and developer life.",
    iconName: "Lightbulb",
  },
  creative: {
    title: "Creative & Poems",
    subtitle: "Original poetry, Hindi Shayari, microfiction, short prose, and literary thoughts.",
    iconName: "Feather",
  },
  notes: {
    title: "Notes & Musings",
    subtitle: "Short-form observations, quick tools, micro-tips, and technical thoughts.",
    iconName: "BookOpen",
  },
};

export async function generateMetadata({ params }: SectionPageProps) {
  const { section } = await params;
  const config = VALID_SECTIONS[section];
  if (config) {
    return {
      title: `${config.title} | ThePathak.tech`,
      description: config.subtitle,
    };
  }

  // Check if it's a user profile handle
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
      return {
        title: `${profile.displayName} (@${profile.username}) | ThePathak.tech`,
        description: profile.bio || `Profile and publications by ${profile.displayName} on ThePathak.tech`,
      };
    }
  } catch (err) {
    // Ignore metadata lookup error
  }

  return { title: "Page Not Found | ThePathak.tech" };
}

export default async function SectionOrProfilePage({ params }: SectionPageProps) {
  const { section } = await params;
  const sectionConfig = VALID_SECTIONS[section];

  // If this is a valid section route, render the section archive
  if (sectionConfig) {
    let posts: any[] = [];
    try {
      posts = await db.post.findMany({
        where: {
          status: "PUBLISHED",
          section: section,
        },
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

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
        {/* Section Header */}
        <header className="space-y-3 border-b border-border pb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">
            Section Archive
          </span>
          <h1 className="font-serif-editorial text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            {sectionConfig.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {sectionConfig.subtitle}
          </p>
        </header>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="py-20 text-center space-y-3 rounded-2xl bg-card border border-border">
            <p className="text-lg font-semibold text-foreground">No articles published in this section yet.</p>
            <p className="text-sm text-muted-foreground">Check back soon for new publications from The Pathak.</p>
          </div>
        ) : (
          <div className={isCreative ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "grid grid-cols-1 md:grid-cols-3 gap-6"}>
            {posts.map((post) => (
              <ArticleCard
                key={post.id}
                post={post as any}
                variant={isCreative ? "creative" : "standard"}
              />
            ))}
          </div>
        )}
      </main>
    );
  }

  // Otherwise, check if this matches a unique User Profile handle
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
              where: {
                status: { in: ["APPROVED", "PENDING"] },
              },
              orderBy: { createdAt: "desc" },
              include: {
                post: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    section: true,
                  },
                },
              },
            },
            _count: {
              select: {
                posts: { where: { status: "PUBLISHED" } },
                likes: true,
                bookmarks: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    if (profile) {
      userPosts = profile.user?.posts || [];
      likedPosts = (profile.user?.likes || [])
        .map((l: any) => l.post)
        .filter((p: any) => p && p.status === "PUBLISHED");
      bookmarkedPosts = (profile.user?.bookmarks || [])
        .map((b: any) => b.post)
        .filter((p: any) => p && p.status === "PUBLISHED");
      userComments = (profile.user?.comments || []).filter((c: any) => c && c.post);
    }
  } catch (err) {
    console.warn("Profile lookup fallback:", err);
  }

  if (!profile) {
    notFound();
  }

  const session = await auth();
  const avatarUrl = getSafeAvatarUrl(profile.avatarUrl, profile.username);
  const isAdmin = profile.user?.role === "ADMIN" || profile.user?.email === "prasoon7pathak@gmail.com";
  const hasPublishedPosts = userPosts.length > 0;
  const isOwnProfile =
    session?.user?.id === profile.userId ||
    session?.user?.email === profile.user?.email ||
    (session?.user as any)?.username === profile.username;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* User Profile Card */}
      <section className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-border bg-zinc-950 shrink-0 shadow-sm">
              <Image
                src={avatarUrl}
                alt={profile.displayName}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                  {profile.displayName}
                </h1>
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                    Admin / Author
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-muted text-muted-foreground uppercase tracking-wider">
                    Community Member
                  </span>
                )}
              </div>
              <p className="font-mono text-sm text-blue-600 dark:text-blue-400 font-semibold">
                @{profile.username}
              </p>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground pt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
            {isOwnProfile && (
              <Link
                href="/settings"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all duration-150 shadow-xs active:scale-95"
                title="Manage profile, avatar, username, and appearance"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profile & Settings</span>
              </Link>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors"
              >
                <span>Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
            {profile.bio}
          </p>
        )}

        {/* Community Stats */}
        <div className={`grid ${isAdmin || hasPublishedPosts ? "grid-cols-4" : "grid-cols-3"} gap-4 pt-4 border-t border-border/60 text-center`}>
          {(isAdmin || hasPublishedPosts) && (
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                {profile.user?._count?.posts || 0}
              </span>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Published
              </p>
            </div>
          )}
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {profile.user?._count?.likes || 0}
            </span>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Liked Posts
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {profile.user?._count?.bookmarks || 0}
            </span>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Saved in Library
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {profile.user?._count?.comments || 0}
            </span>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Comments
            </p>
          </div>
        </div>
      </section>

      {/* Activity History Tabs */}
      <ProfileTabs
        displayName={profile.displayName}
        username={profile.username}
        isAdmin={isAdmin}
        publishedPosts={userPosts}
        likedPosts={likedPosts}
        bookmarkedPosts={bookmarkedPosts}
        comments={userComments}
      />
    </main>
  );
}

