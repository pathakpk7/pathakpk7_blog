"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { StudioHeader } from "./StudioHeader";
import { StudioSidebar } from "./StudioSidebar";
import { PanelLeftOpen } from "lucide-react";

interface StudioContextType {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within StudioLayoutClient");
  }
  return context;
}

export function StudioLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load saved sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("studio_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    } catch {}
    setIsMounted(true);
  }, []);

  // Persist sidebar state
  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("studio_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <StudioContext.Provider
      value={{
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
      }}
    >
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
        <StudioHeader />
        <div className="flex flex-1 relative overflow-hidden">
          <StudioSidebar />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-zinc-950 transition-all duration-300 w-full min-w-0">
            {children}
          </main>

          {/* Collapsed floating expand trigger (visible on desktop when sidebar is hidden) */}
          {isMounted && isSidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="hidden md:flex fixed bottom-6 left-5 z-30 items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-95 group"
              title="Expand Studio Sidebar (Ctrl+B)"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Sidebar</span>
            </button>
          )}
        </div>
      </div>
    </StudioContext.Provider>
  );
}
