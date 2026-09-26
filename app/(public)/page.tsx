import Link from "next/link";
import { db } from "@/lib/db/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArrowRight, Sparkles, Code2, Rocket, Feather, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  let featuredPosts: any[] = [];
  let techPosts: any[] = [];
  let sciencePosts: any[] = [];
  let codingPosts: any[] = [];
  let creativePosts: any[] = [];
  let notesPosts: any[] = [];

  try {
    const [latestPosts, tech, science, coding, creative, notes] = await Promise.all([
      // Dynamic Featured: Latest published post dynamically becomes the featured publication
      db.post.findMany({
        where: { status: "PUBLISHED" },
        take: 1,
        orderBy: { publishedAt: "desc" },
        include: {
          author: { include: { profile: true } },
          tags: { include: { tag: true } },
        },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "technology" },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "science" },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "coding" },
        take: 3,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "creative" },
        take: 2,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } }, tags: { include: { tag: true } } },
      }),
      db.post.findMany({
        where: { status: "PUBLISHED", section: "notes" },
        take: 4,
        orderBy: { publishedAt: "desc" },
        include: { author: { include: { profile: true } } },
      }),
    ]);

    featuredPosts = latestPosts;
    techPosts = tech;
    sciencePosts = science;
    codingPosts = coding;
    creativePosts = creative;
    notesPosts = notes;
  } catch (err) {
    console.warn("HomePage DB queries fallback:", err);
  }

  return (
    <div className="space-y-24 pb-20">
      {/* Editorial Hero Section */}
      <section className="relative pt-12 pb-16 border-b border-border/80 bg-gradient-to-b from-transparent via-blue-50/20 dark:via-blue-950/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Independent Editorial Publication</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="font-serif-editorial text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              The world is changing. <br />
              <span className="italic font-normal text-blue-600 dark:text-blue-400">Let&apos;s understand it.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl font-normal leading-relaxed">
              Interpretation over repetition. Exploring software engineering, autonomous AI systems, astrophysics, personal essays, and creative literature.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/technology"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              <span>Explore Latest Publications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
            >
              <span>Read Editorial Philosophy</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Featured Spotlight — Latest Publication */}
      {featuredPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="space-y-0.5">
              <span className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono font-semibold">
                LATEST RELEASE
              </span>
              <h2 className="font-serif-editorial text-3xl font-bold tracking-tight text-foreground">
                Featured Publication
              </h2>
            </div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
              CURATED EDITORIAL
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {featuredPosts.map((post) => (
              <ArticleCard key={post.id} post={post as any} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* Technology Section */}
      {techPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                Technology & AI
              </h2>
            </div>
            <Link href="/technology" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techPosts.map((post) => (
              <ArticleCard key={post.id} post={post as any} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {/* Science & Space Spotlight */}
      {sciencePosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center space-x-3">
              <Rocket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                Science & Space
              </h2>
            </div>
            <Link href="/science" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sciencePosts.map((post) => (
              <ArticleCard key={post.id} post={post as any} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {/* Coding & Walkthroughs */}
      {codingPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center space-x-3">
              <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-foreground">
                Coding & Tutorials
              </h2>
            </div>
            <Link href="/coding" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {codingPosts.map((post) => (
              <ArticleCard key={post.id} post={post as any} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {/* The Other Side — Creative Section */}
      {creativePosts.length > 0 && (
        <section className="relative py-16 bg-amber-500/5 border-y border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 text-xs font-mono uppercase tracking-widest">
                  <Feather className="w-4 h-4" />
                  <span>The Other Side</span>
                </div>
                <h2 className="font-serif-editorial text-3xl font-bold text-foreground">
                  Creative Writing, Poetry & Quotes
                </h2>
              </div>
              <Link href="/creative" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center space-x-1">
                <span>Explore Creative</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {creativePosts.map((post) => (
                <ArticleCard key={post.id} post={post as any} variant={post.contentType === "QUOTE" ? "quote" : "creative"} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Notes & Quick Thoughts Feed */}
      {notesPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
                Notes & Quick Musings
              </h2>
            </div>
            <Link href="/notes" className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline">
              View All Notes
            </Link>
          </div>

          <div className={cn(
            "grid gap-4",
            notesPosts.length === 1
              ? "grid-cols-1 max-w-xl"
              : notesPosts.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : notesPosts.length === 3
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}>
            {notesPosts.map((post) => (
              <ArticleCard key={post.id} post={post as any} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
