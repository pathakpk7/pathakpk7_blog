"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SearchModal } from "@/components/search/SearchModal";
import { usePathname } from "next/navigation";
import { JournalProvider, useJournal } from "@/components/enchanted/JournalContext";

function InnerLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { isJournalOpen } = useJournal();

  const isStudio = pathname.startsWith("/studio");
  const isAuth = pathname === "/login" || pathname === "/signup";
  const isLandingDesk = pathname === "/" && !isJournalOpen;

  // For Studio, Login/Signup, or the initial full-screen Enchanted Desk, don't show the standard tech navbar/footer
  if (isStudio || isAuth || isLandingDesk) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <div className="flex-1">{children}</div>
      <Footer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <JournalProvider>
      <InnerLayoutWrapper>{children}</InnerLayoutWrapper>
    </JournalProvider>
  );
}
