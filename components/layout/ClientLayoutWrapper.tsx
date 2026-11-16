"use client";

import { useState, Suspense } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SearchModal } from "@/components/search/SearchModal";
import { TopProgressBar } from "./TopProgressBar";
import { usePathname } from "next/navigation";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const isStudio = pathname.startsWith("/studio");

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <div className="flex-1">{children}</div>
      <Footer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
