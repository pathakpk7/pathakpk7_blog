import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { LibraryView } from "@/components/library/LibraryView";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Library | ThePathak.tech",
  description: "Your saved articles, bookmarks, reading history, and discussions.",
};

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/library");
  }

  const userId = session.user.id;

  const [likes, bookmarks, history, comments] = await Promise.all([
    db.like.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { include: { profile: true } },
            tags: { include: { tag: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { include: { profile: true } },
            tags: { include: { tag: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.readingHistory.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { include: { profile: true } },
            tags: { include: { tag: true } },
          },
        },
      },
      orderBy: { lastReadAt: "desc" },
    }),
    db.comment.findMany({
      where: { userId },
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
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const publishedBookmarks = bookmarks
    .map((b) => b.post)
    .filter((p): p is any => Boolean(p && p.status === "PUBLISHED"));

  const publishedLikes = likes
    .map((l) => l.post)
    .filter((p): p is any => Boolean(p && p.status === "PUBLISHED"));

  const publishedHistory = history
    .filter((h) => Boolean(h.post && h.post.status === "PUBLISHED"))
    .map((h) => ({
      id: h.id,
      progress: h.progress,
      lastReadAt: h.lastReadAt,
      post: h.post as any,
    }));

  const validComments = comments.filter((c) => Boolean(c && c.post));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen">
      <header className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">
            Personal Reading Dashboard
          </span>
        </div>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          My Library
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Revisit saved publications, bookmarked technical breakdowns, track your reading history, and review discussion threads.
        </p>
      </header>

      <LibraryView
        user={{
          name: session.user.name,
          email: session.user.email,
          username: (session.user as any).username,
        }}
        bookmarks={publishedBookmarks}
        likes={publishedLikes}
        history={publishedHistory}
        comments={validComments as any}
      />
    </main>
  );
}
