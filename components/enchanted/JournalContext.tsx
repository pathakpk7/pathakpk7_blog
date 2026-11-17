"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface JournalContextType {
  isJournalOpen: boolean;
  openJournal: () => void;
  closeJournal: () => void;
  visitorName: string;
  setVisitorName: (name: string) => void;
}

const JournalContext = createContext<JournalContextType>({
  isJournalOpen: false,
  openJournal: () => {},
  closeJournal: () => {},
  visitorName: "",
  setVisitorName: () => {},
});

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("thepathak_journal_name");
      if (saved) setVisitorName(saved);

      // Check if user already unsealed the journal in this session
      const enteredSession = sessionStorage.getItem("thepathak_journal_unsealed");
      const urlParams = new URLSearchParams(window.location.search);
      const forceDesk = urlParams.get("desk") === "true";

      if (enteredSession === "true" && !forceDesk) {
        setIsJournalOpen(true);
      }
    } catch {}
  }, []);

  const openJournal = () => {
    setIsJournalOpen(true);
    try {
      sessionStorage.setItem("thepathak_journal_unsealed", "true");
    } catch {}
  };

  const closeJournal = () => {
    setIsJournalOpen(false);
    try {
      sessionStorage.removeItem("thepathak_journal_unsealed");
    } catch {}
  };

  return (
    <JournalContext.Provider
      value={{
        isJournalOpen,
        openJournal,
        closeJournal,
        visitorName,
        setVisitorName,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  return useContext(JournalContext);
}
