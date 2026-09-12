"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  FileText,
  Clock,
  MessageSquare,
  BarChart3,
  BookOpen,
  Tag,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const STUDIO_NAV = [
  { name: "Dashboard", href: "/studio", icon: LayoutDashboard },
  { name: "All Posts", href: "/studio/posts", icon: FileText },
  { name: "Tags", href: "/studio/tags", icon: Tag },
  { name: "Scheduled", href: "/studio/scheduled", icon: Clock },
  { name: "Comments", href: "/studio/comments", icon: MessageSquare },
  { name: "Analytics", href: "/studio/analytics", icon: BarChart3 },
];

export function StudioHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const username = (session?.user as any)?.username || session?.user?.email?.split("@")[0] || "admin";

  // Close on Escape or Route Change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className="w-full border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Mobile Drawer Toggle & Exit Button */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            aria-label="Toggle Studio navigation"
          >
            {mobileOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-blue-400" />}
          </button>

          <Link
            href="/"
            className="group inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-all border border-zinc-700 hover:border-zinc-500 shadow-xs active:scale-95"
            title="Exit Studio mode back to public site"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden xs:inline">Exit this Mode</span>
            <span className="xs:hidden">Exit</span>
          </Link>

          <span className="text-zinc-700 hidden lg:inline">|</span>
          <div className="hidden lg:flex items-center space-x-4 text-xs text-zinc-400">
            <Link href="/technology" className="hover:text-white transition-colors">Technology</Link>
            <Link href="/science" className="hover:text-white transition-colors">Science</Link>
            <Link href="/coding" className="hover:text-white transition-colors">Coding</Link>
            <Link href="/ideas" className="hover:text-white transition-colors">Ideas</Link>
            <Link href="/creative" className="hover:text-white transition-colors">Creative</Link>
            <Link href="/notes" className="hover:text-white transition-colors">Notes</Link>
          </div>
        </div>

        {/* Right: Quick Actions & Admin Badge */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <Link
            href="/studio/posts/new"
            className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Article</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 text-xs font-semibold transition-colors border border-blue-500/20 active:scale-95"
            title="Open public homepage in new tab"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Live ↗</span>
          </Link>

          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-zinc-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-zinc-700/80 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-semibold text-zinc-200 max-w-[80px] sm:max-w-[120px] truncate">
              @{username}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
              ADMIN
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-[49px] sm:top-[57px] bg-zinc-900 border-b border-zinc-800 z-40 p-4 space-y-4 shadow-2xl max-h-[calc(100vh-60px)] overflow-y-auto">
          {/* Write New Button */}
          <Link
            href="/studio/posts/new"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write New Article</span>
          </Link>

          {/* CMS Nav Links */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 px-2 py-1">
              Studio CMS Pages
            </p>
            <div className="grid grid-cols-1 gap-1">
              {STUDIO_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/studio" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
                      isActive
                        ? "bg-zinc-800 text-white font-semibold border-l-2 border-blue-500"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    )}
                  >
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Public Website Navigation Links */}
          <div className="space-y-1 pt-3 border-t border-zinc-800">
            <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 px-2 py-1">
              Public Sections
            </p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Home</span>
              </Link>
              <Link
                href="/technology"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Tech & AI</span>
              </Link>
              <Link
                href="/science"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Science</span>
              </Link>
              <Link
                href="/coding"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Coding</span>
              </Link>
              <Link
                href="/ideas"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>Ideas</span>
              </Link>
              <Link
                href="/creative"
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Creative</span>
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors border border-zinc-700"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Exit Studio Mode</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

