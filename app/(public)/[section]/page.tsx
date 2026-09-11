import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";

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
  if (!config) return { title: "Section Not Found | ThePathak.tech" };

  return {
    title: `${config.title} | ThePathak.tech`,
    description: config.subtitle,
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;
  const sectionConfig = VALID_SECTIONS[section];

  if (!sectionConfig) {
    notFound();
  }

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
