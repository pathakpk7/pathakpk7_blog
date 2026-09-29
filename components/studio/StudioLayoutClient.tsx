"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { StudioHeader } from "./StudioHeader";
import { StudioSidebar } from "./StudioSidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

          {/* LeetCode-style Vertical Divider Collapse/Expand Handle */}
          <div
            className={cn(
              "hidden md:flex relative items-center justify-center select-none z-30 group cursor-pointer transition-colors",
              isSidebarCollapsed ? "w-2.5" : "w-1"
            )}
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          >
            {/* Divider Line Highlight */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 w-px transition-colors duration-150",
                "bg-zinc-800 group-hover:bg-blue-500",
                isSidebarCollapsed && "bg-zinc-800/80 group-hover:bg-blue-500"
              )}
            />

            {/* LeetCode-style Pill Handle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 flex items-center justify-center",
                "w-4 h-12 rounded-full transition-all duration-200 shadow-lg",
                "bg-zinc-900 border border-zinc-700 text-zinc-400 group-hover:text-white group-hover:border-blue-500 group-hover:bg-zinc-800",
                "active:scale-95",
                isSidebarCollapsed ? "-left-1 hover:scale-110" : "-left-2 hover:scale-110"
              )}
              aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-3 h-3 text-blue-400 group-hover:text-blue-300" />
              ) : (
                <ChevronLeft className="w-3 h-3 group-hover:text-zinc-100" />
              )}
            </button>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-zinc-950 transition-all duration-300 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </StudioContext.Provider>
  );
}
