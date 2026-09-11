import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-colors mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Horizontal Row: Brand & Socials */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden shadow-xs border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-950">
                <Image
                  src="/emblem.png"
                  alt="ThePathak.tech Logo"
                  fill
                  sizes="56px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <span className="font-serif-editorial text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ThePathak<span className="text-blue-600 dark:text-blue-500">.tech</span>
              </span>
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700 hidden md:inline">|</span>
            <p className="hidden md:inline text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Technology • Science • Code • Ideas • Words
            </p>
          </div>

          {/* Connect Links Horizontal */}
          <div className="flex items-center space-x-4 text-xs">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">Connect</span>
            <a
              href="https://github.com/pathakpk7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://www.prasoonpathak7.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              <span>Portfolio</span>
              <ArrowUpRight className="w-3 h-3 text-blue-500" />
            </a>
          </div>
        </div>

        {/* Middle Horizontal Links: Sections */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="text-zinc-900 dark:text-zinc-200 font-semibold uppercase tracking-wider text-[10px] shrink-0">
            Sections:
          </span>
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home Landing</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/technology" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Technology & AI</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/science" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Science & Space</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/coding" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Coding & Tutorials</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/ideas" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Ideas & Essays</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/creative" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Creative & Poems</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/notes" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Notes & Musings</Link>
        </div>

        {/* Platform Links Horizontal */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="text-zinc-900 dark:text-zinc-200 font-semibold uppercase tracking-wider text-[10px] shrink-0">
            Platform:
          </span>
          <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Editorial Philosophy</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/search" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Search Archive</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/library" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">My Library</Link>
          <span className="text-zinc-300 dark:text-zinc-800">•</span>
          <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Sign In</Link>
        </div>

        {/* Bottom Horizontal Bar: Copyright & Tagline */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500 gap-2">
          <p>© {new Date().getFullYear()} ThePathak.tech. All rights reserved.</p>
          <p className="italic font-serif">Interpretation over repetition</p>
        </div>
      </div>
    </footer>
  );
}

