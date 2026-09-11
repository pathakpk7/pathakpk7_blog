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
    include: { profile: true },
  });

  if (!user) redirect("/login");

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-screen">
      <header className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <SettingsIcon className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Account & Preferences</span>
        </div>
        <h1 className="font-serif-editorial text-4xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Customize your reader profile, select from preset avatar images, and manage theme options.
        </p>
      </header>

      <SettingsForm user={user as any} />
    </main>
  );
}
