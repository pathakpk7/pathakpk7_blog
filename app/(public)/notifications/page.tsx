import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserNotifications } from "@/app/actions/notification";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Notifications | ThePathak.tech",
  description: "View all your interaction updates, replies, mentions, and reaction notifications.",
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/notifications");
  }

  const { personalNotifications, adminAggregatedNotifications, isAdmin } = await getUserNotifications();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 min-h-screen">
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      <NotificationCenter
        initialPersonalNotifications={personalNotifications}
        initialAdminNotifications={adminAggregatedNotifications}
        isAdmin={isAdmin}
        viewMode="full"
      />
    </main>
  );
}
