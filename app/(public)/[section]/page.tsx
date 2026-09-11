import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { User, Calendar, BookOpen, ExternalLink, ArrowLeft, PenTool, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
            _count: {
              select: {
                posts: { where: { status: "PUBLISHED" } },
                likes: true,
                bookmarks: true,
              },
            },
          },
        },
      },
    });

    if (profile) {
      userPosts = profile.user?.posts || [];
    }
  } catch (err) {
    console.warn("Profile lookup fallback:", err);
  }

  if (!profile) {
    notFound();
  }

  const avatarUrl = profile.avatarUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${profile.username}`;
  const isAdmin = profile.user?.role === "ADMIN" || profile.user?.email === "prasoon7pathak@gmail.com";

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
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-border bg-zinc-950 shrink-0 p-1">
              <Image
                src={avatarUrl}
                alt={profile.displayName}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                  {profile.displayName}
                </h1>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase">
                    Admin / Author
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-muted text-muted-foreground uppercase">
                    Reader
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

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
            {profile.bio}
          </p>
        )}

        {/* Community Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/60 text-center">
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {profile.user?._count?.posts || 0}
            </span>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Published Articles
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {profile.user?._count?.likes || 0}
            </span>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Liked Posts
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">
              {profile.user?._count?.bookmarks || 0}
            </span>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Saved in Library
            </p>
          </div>
        </div>
      </section>

      {/* Publications by User */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
              Publications by {profile.displayName}
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {userPosts.length} {userPosts.length === 1 ? "article" : "articles"}
          </span>
        </div>

        {userPosts.length === 0 ? (
          <div className="py-12 text-center space-y-2 rounded-2xl bg-card border border-border">
            <p className="text-sm font-semibold text-foreground">No public articles yet.</p>
            <p className="text-xs text-muted-foreground">
              This author hasn&apos;t published any public articles yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userPosts.map((post) => (
              <ArticleCard key={post.id} post={post as any} variant="standard" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

