"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Eye, User, PenTool } from "lucide-react";
import { useSession } from "next-auth/react";

export function StudioHeader() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "prasoon7pathak@gmail.com";

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-900 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Back to Public Website Button & Brand */}
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors border border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Exit Studio to Public Site</span>
        </Link>
        <span className="text-zinc-700">|</span>
        <div className="hidden sm:flex items-center space-x-4 text-xs text-zinc-400">
          <Link href="/technology" className="hover:text-white transition-colors">Technology</Link>
          <Link href="/science" className="hover:text-white transition-colors">Science</Link>
          <Link href="/coding" className="hover:text-white transition-colors">Coding</Link>
          <Link href="/ideas" className="hover:text-white transition-colors">Ideas</Link>
          <Link href="/creative" className="hover:text-white transition-colors">Creative</Link>
          <Link href="/notes" className="hover:text-white transition-colors">Notes</Link>
        </div>
      </div>

      {/* Right: Admin Badge & Quick Site View */}
      <div className="flex items-center space-x-3">
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-semibold transition-colors border border-blue-500/30"
          title="Open public homepage in new tab"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>View Live Site ↗</span>
        </Link>
        <div className="flex items-center space-x-2 bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-zinc-200">{userEmail}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded">
            ADMIN
          </span>
        </div>
      </div>
    </header>
  );
}
