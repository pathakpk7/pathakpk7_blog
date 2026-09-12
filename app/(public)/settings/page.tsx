import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Settings as SettingsIcon } from "lucide-react";

export const metadata = {
  title: "Settings | ThePathak.tech",
  description: "Manage your profile, avatar, theme preferences, and account.",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
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
  });

  if (!user) redirect("/login");

  const likedPosts = (user.likes || [])
    .map((l: any) => l.post)
    .filter((p: any) => p && p.status === "PUBLISHED");
  const bookmarkedPosts = (user.bookmarks || [])
    .map((b: any) => b.post)
    .filter((p: any) => p && p.status === "PUBLISHED");
  const comments = (user.comments || []).filter((c: any) => c && c.post);
  const publishedPosts = user.posts || [];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 min-h-screen">
      <header className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <SettingsIcon className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Account & Preferences</span>
        </div>
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your reader profile, avatar portraits, appearance themes, and activity timeline.
        </p>
      </header>

      <SettingsForm
        user={user as any}
        activity={{
          likedPosts,
          bookmarkedPosts,
          comments,
          publishedPosts,
        }}
      />
    </main>
  );
}
