"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Clock,
  MessageSquare,
  BarChart3,
  PlusCircle,
  ArrowLeft,
  Globe,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STUDIO_NAV = [
  { name: "Dashboard", href: "/studio", icon: LayoutDashboard },
  { name: "All Posts", href: "/studio/posts", icon: FileText },
  { name: "Scheduled", href: "/studio/scheduled", icon: Clock },
  { name: "Comments", href: "/studio/comments", icon: MessageSquare },
  { name: "Analytics", href: "/studio/analytics", icon: BarChart3 },
];

export function StudioSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-900 text-zinc-100 flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] shrink-0 hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-800 shrink-0 bg-zinc-950">
            <Image
              src="/emblem.png"
              alt="ThePathak.tech Logo"
              fill
              sizes="64px"
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="font-serif-editorial text-lg font-bold tracking-tight text-white">
                Writer Studio
              </span>
              <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 py-0.2 rounded font-mono font-semibold">
                CMS
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">ThePathak.tech Author CMS</p>
          </div>
        </div>

        {/* New Post Button */}
        <Link
          href="/studio/posts/new"
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>

        {/* CMS Nav links */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 px-3 py-1">
            Studio CMS
          </p>
          <nav className="space-y-1">
            {STUDIO_NAV.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/studio" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-zinc-800 text-white font-semibold border-l-2 border-blue-500"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Public Website Shortcuts */}
        <div className="space-y-1 pt-2 border-t border-zinc-800/80">
          <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 px-3 py-1">
            Navigate Public Site
          </p>
          <nav className="space-y-1 text-xs text-zinc-400">
            <Link href="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Homepage</span>
            </Link>
            <Link href="/technology" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1.5 mr-1" />
              <span>Technology</span>
            </Link>
            <Link href="/science" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-1.5 mr-1" />
              <span>Science & Space</span>
            </Link>
            <Link href="/coding" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1.5 mr-1" />
              <span>Coding</span>
            </Link>
            <Link href="/ideas" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-1.5 mr-1" />
              <span>Ideas</span>
            </Link>
            <Link href="/creative" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1.5 mr-1" />
              <span>Creative</span>
            </Link>
            <Link href="/notes" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 ml-1.5 mr-1" />
              <span>Notes</span>
            </Link>
            <Link href="/library" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 hover:text-white transition-colors">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>My Library</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Exit Studio Button */}
      <div className="p-4 border-t border-zinc-800">
        <Link
          href="/"
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors border border-zinc-700"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Exit Studio</span>
        </Link>
      </div>
    </aside>
  );
}
