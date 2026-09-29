"use client";

import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { StudioHeader } from "./StudioHeader";
import { StudioSidebar } from "./StudioSidebar";
import { cn } from "@/lib/utils";

interface StudioContextType {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  isDragging: boolean;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error("useStudio must be used within StudioLayoutClient");
  }
  return context;
}

const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 180;
const MAX_WIDTH = 460;
const COLLAPSE_THRESHOLD = 90;

export function StudioLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastWidthRef = useRef(DEFAULT_WIDTH);

  // Load saved sidebar width & collapsed state from localStorage
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem("studio_sidebar_width");
      const savedCollapsed = localStorage.getItem("studio_sidebar_collapsed");
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setSidebarWidth(parsed);
          lastWidthRef.current = parsed;
        }
      }
      if (savedCollapsed !== null) {
        setIsSidebarCollapsed(savedCollapsed === "true");
      }
    } catch {}
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("studio_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

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
  }, [toggleSidebar]);

  // Mouse drag handlers for resizing sidebar (LeetCode style)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const clientX = e.clientX;

      if (clientX < COLLAPSE_THRESHOLD) {
        setIsSidebarCollapsed(true);
        try {
          localStorage.setItem("studio_sidebar_collapsed", "true");
        } catch {}
      } else {
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(clientX, MAX_WIDTH));
        setSidebarWidth(clampedWidth);
        lastWidthRef.current = clampedWidth;
        setIsSidebarCollapsed(false);
        try {
          localStorage.setItem("studio_sidebar_width", String(clampedWidth));
          localStorage.setItem("studio_sidebar_collapsed", "false");
        } catch {}
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <StudioContext.Provider
      value={{
        sidebarWidth,
        setSidebarWidth,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isDragging,
      }}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
        <StudioHeader />

        <div className="flex flex-1 overflow-hidden relative">
          <StudioSidebar />

          {/* LeetCode-style Draggable Resizer Gutter */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => {
              if (isSidebarCollapsed) {
                setIsSidebarCollapsed(false);
                setSidebarWidth(lastWidthRef.current || DEFAULT_WIDTH);
              } else {
                setIsSidebarCollapsed(true);
              }
            }}
            className={cn(
              "hidden md:flex relative items-center justify-center select-none z-30 cursor-col-resize shrink-0 transition-colors",
              "w-2 -ml-1 hover:w-2 hover:bg-blue-500/20",
              isDragging && "bg-blue-500/30 w-2",
              isSidebarCollapsed && "cursor-e-resize ml-0 w-2"
            )}
            title="Drag freely to resize sidebar width, or double click to toggle"
          >
            {/* Center border line indicator */}
            <div
              className={cn(
                "h-full w-[1px] bg-zinc-800 transition-colors duration-150",
                isDragging ? "bg-blue-500 w-[2px]" : "hover:bg-blue-500/80"
              )}
            />

            {/* Subtle LeetCode-style Grip Handle */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none",
                "w-3.5 h-10 rounded-full transition-all duration-150 shadow-md",
                "bg-zinc-800 border border-zinc-700/80",
                isDragging ? "bg-blue-600 border-blue-400 scale-105" : "hover:bg-zinc-700"
              )}
            >
              <div className="flex flex-col space-y-1 items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-zinc-400" />
                <span className="w-1 h-1 rounded-full bg-zinc-400" />
                <span className="w-1 h-1 rounded-full bg-zinc-400" />
              </div>
            </div>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-zinc-950 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </StudioContext.Provider>
  );
}
