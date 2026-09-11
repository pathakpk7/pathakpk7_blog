import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { BookOpen, Heart, Bookmark as BookmarkIcon, History } from "lucide-react";

export const metadata = {
  title: "My Library | ThePathak.tech",
  description: "Your saved articles, bookmarks, and reading history.",
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/library");
  }

  const userId = session.user.id;

  const likes = await db.like.findMany({
    where: { userId },
    include: {
      post: {
        include: { author: { include: { profile: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    include: {
      post: {
        include: { author: { include: { profile: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const history = await db.readingHistory.findMany({
    where: { userId },
    include: {
      post: {
        include: { author: { include: { profile: true } } },
      },
    },
    orderBy: { lastReadAt: "desc" },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      <header className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Personal Dashboard</span>
        </div>
        <h1 className="font-serif-editorial text-4xl font-bold tracking-tight text-foreground">
          My Library
        </h1>
        <p className="text-sm text-muted-foreground">
          Revisit saved publications, bookmarked essays, and continue reading where you left off.
        </p>
      </header>

      {/* Bookmarked Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-border pb-3">
          <BookmarkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
            Bookmarked ({bookmarks.length})
          </h2>
        </div>

        {bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">No bookmarked articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookmarks.map((b) => (
              <ArticleCard key={b.id} post={b.post as any} variant="standard" />
            ))}
          </div>
        )}
      </section>

      {/* Liked Articles Section */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center space-x-2 border-b border-border pb-3">
          <Heart className="w-4 h-4 text-rose-500" />
          <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
            Liked Articles ({likes.length})
          </h2>
        </div>

        {likes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">No liked articles yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {likes.map((l) => (
              <ArticleCard key={l.id} post={l.post as any} variant="standard" />
            ))}
          </div>
        )}
      </section>

      {/* Reading History Section */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center space-x-2 border-b border-border pb-3">
          <History className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-serif-editorial text-2xl font-bold text-foreground">
            Reading History ({history.length})
          </h2>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">No reading history recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((h) => (
              <ArticleCard key={h.id} post={h.post as any} variant="horizontal" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
