import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StudioLayoutClient } from "@/components/studio/StudioLayoutClient";

export const metadata = {
  title: "Writer Studio | ThePathak.tech CMS",
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  if (!session?.user || !isAdmin) {
    redirect("/");
  }

  return <StudioLayoutClient>{children}</StudioLayoutClient>;
}
