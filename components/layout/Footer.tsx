import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-colors mt-12 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Horizontal Row: Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
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
            <p className="hidden md:inline text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Technology • Science • Code • Ideas • Words
            </p>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 italic font-serif">
            Interpretation over repetition
          </p>
        </div>

        {/* Structured Multi-Column Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-2">
          {/* Column 1: Core Sections */}
          <nav aria-label="Editorial Sections" className="space-y-3">
            <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold uppercase tracking-wider text-xs font-mono">
              Sections
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/technology" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link href="/science" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Science & Space
                </Link>
              </li>
              <li>
                <Link href="/coding" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Coding & Tutorials
                </Link>
              </li>
              <li>
                <Link href="/ideas" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Ideas & Essays
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 2: Creative & Notes */}
          <nav aria-label="Creative & Notes" className="space-y-3">
            <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold uppercase tracking-wider text-xs font-mono">
              The Other Side
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/creative" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Creative & Poems
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Notes & Musings
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Saved Library
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 3: Platform & Editorial */}
          <nav aria-label="Platform Links" className="space-y-3">
            <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold uppercase tracking-wider text-xs font-mono">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Editorial Philosophy
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Search Archive
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 4: Connect */}
          <nav aria-label="Social & Author Links" className="space-y-3">
            <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold uppercase tracking-wider text-xs font-mono">
              Connect
            </h3>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <a
                  href="https://github.com/pathakpk7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.prasoonpathak7.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>Portfolio</span>
                  <ArrowUpRight className="w-3 h-3 text-blue-500" />
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Horizontal Bar: Copyright */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 gap-2">
          <p>© {new Date().getFullYear()} ThePathak.tech. All rights reserved.</p>
          <p>Independent Technical & Creative Publication</p>
        </div>
      </div>
    </footer>
  );
}
