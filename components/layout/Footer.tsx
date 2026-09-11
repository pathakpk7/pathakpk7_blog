import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="font-serif-editorial text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              ThePathak<span className="text-blue-600 dark:text-blue-500">.tech</span>
            </Link>
            <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium">
              Technology • Science • Code • Ideas • Words
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              An independent editorial publication dedicated to interpretation over repetition. Exploring software engineering, autonomous systems, astrophysics, personal essays, and creative literature.
            </p>
          </div>

          {/* Sections Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Sections
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  Home Landing Page
                </Link>
              </li>
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
            </ul>
          </div>

          {/* Platform Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  About Editorial Philosophy
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Search Archive
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  My Library
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Author Links Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
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
                  className="inline-flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-foreground"
                >
                  <span>Portfolio</span>
                  <ArrowUpRight className="w-3 h-3 text-blue-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} ThePathak.tech. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Interpretation over repetition</span>
            <span>Made with Next.js & Neon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
