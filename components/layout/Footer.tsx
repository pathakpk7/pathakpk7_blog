import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background mt-24 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Top Section: Architectural Brand Presence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
              <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-[#0d1117] border border-border/80 shrink-0 flex items-center justify-center shadow-xs">
                <Image
                  src="/emblem.png"
                  alt="ThePathak Logo"
                  fill
                  sizes="64px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <span className="font-serif-editorial text-2xl font-bold tracking-tight text-foreground transition-colors">
                ThePathak<span className="text-blue-600 dark:text-blue-400">.tech</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground font-normal leading-relaxed max-w-sm">
              An independent editorial publishing platform dedicated to deep technical synthesis, creative writing, and interpretation over repetition.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-foreground tracking-wider">
                Publications
              </h3>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li>
                  <Link href="/technology" className="hover:text-foreground transition-colors">
                    Technology & AI
                  </Link>
                </li>
                <li>
                  <Link href="/science" className="hover:text-foreground transition-colors">
                    Science & Space
                  </Link>
                </li>
                <li>
                  <Link href="/coding" className="hover:text-foreground transition-colors">
                    Coding & Architecture
                  </Link>
                </li>
                <li>
                  <Link href="/ideas" className="hover:text-foreground transition-colors">
                    Ideas & Essays
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium text-foreground tracking-wider">
                Perspectives
              </h3>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li>
                  <Link href="/creative" className="hover:text-foreground transition-colors">
                    Creative & Poetry
                  </Link>
                </li>
                <li>
                  <Link href="/notes" className="hover:text-foreground transition-colors">
                    Notes & Fragments
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    Editorial Philosophy
                  </Link>
                </li>
                <li>
                  <Link href="/library" className="hover:text-foreground transition-colors">
                    Saved Library
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h3 className="text-xs font-medium text-foreground tracking-wider">
                Dialogue
              </h3>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/pathakpk7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 hover:text-foreground transition-colors"
                  >
                    <span>GitHub</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.prasoonpathak7.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 hover:text-foreground transition-colors"
                  >
                    <span>Portfolio</span>
                    <ArrowUpRight className="w-3 h-3 opacity-70" />
                  </a>
                </li>
                <li>
                  <Link href="/search" className="hover:text-foreground transition-colors">
                    Archive Search
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Line: Colophon */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} ThePathak.tech — All rights reserved</p>
          <p className="font-serif italic text-muted-foreground">
            Thoughtful engineering, considered words
          </p>
        </div>
      </div>
    </footer>
  );
}
