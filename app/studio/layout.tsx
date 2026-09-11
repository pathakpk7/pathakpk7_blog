import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StudioSidebar } from "@/components/studio/StudioSidebar";
import { StudioHeader } from "@/components/studio/StudioHeader";

export const metadata = {
  title: "Writer Studio | ThePathak.tech CMS",
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  if (!session?.user || !isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <StudioHeader />
      <div className="flex flex-1">
        <StudioSidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
