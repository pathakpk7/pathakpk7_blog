"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, BookOpen, PenTool, LogOut, Home, Settings, User } from "lucide-react";
import { Navigation } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useSession, signOut } from "next-auth/react";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const drawerRef = useRef<HTMLDivElement>(null);

  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";
  const rawUsername = (session?.user as any)?.username || (session?.user?.name ? session.user.name.toLowerCase().replace(/\s+/g, "_") : "reader");
  const userAvatar = session?.user?.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${rawUsername}`;

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open on small screens
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Top-Left: Hamburger Icon for Mobile & Tablet */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Brand Logo & Editorial Subtitle */}
              <Link href="/" className="group flex items-center space-x-2.5">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-zinc-200/60 dark:border-zinc-800 shrink-0 bg-zinc-950">
                  <Image
                    src="/emblem.png"
                    alt="ThePathak.tech Logo"
                    fill
                    sizes="72px"
                    className="object-contain p-0.5"
                    priority
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif-editorial text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    ThePathak<span className="text-blue-600 dark:text-blue-500">.tech</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 -mt-1 font-medium">
                    Tech • Science • Code • Words
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <Navigation />

            {/* Actions & Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
                title="Search articles (Cmd+K)"
                aria-label="Search articles"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Admin / User State */}
              {session?.user ? (
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  {isAdmin && (
                    <Link
                      href="/studio"
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors shadow-xs active:scale-95"
                      title="Writer Studio CMS"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Studio</span>
                    </Link>
                  )}

                  {/* Top-Right Username Handle Badge */}
                  <Link
                    href="/settings"
                    className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
                    title={`Logged in as @${rawUsername} (Settings)`}
                  >
                    <div className="relative w-5 h-5 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                      <Image
                        src={userAvatar}
                        alt={rawUsername}
                        fill
                        className="object-contain p-0.5"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate">
                      @{rawUsername}
                    </span>
                  </Link>

                  <Link
                    href="/library"
                    className="hidden sm:flex p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
                    title="My Library"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="hidden sm:flex p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-95"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors active:scale-95"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Drawer */}
        {mobileMenuOpen && (
          <div
            ref={drawerRef}
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pt-3 pb-6 space-y-3 relative z-40 shadow-xl"
          >
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <Home className="w-4 h-4 text-blue-500" />
                <span>Home</span>
              </Link>
              <Link
                href="/technology"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Technology & AI
              </Link>
              <Link
                href="/science"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Science & Space
              </Link>
              <Link
                href="/coding"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Coding & Tutorials
              </Link>
              <Link
                href="/ideas"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Ideas & Essays
              </Link>
              <Link
                href="/creative"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Creative & Poems
              </Link>
              <Link
                href="/notes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Notes & Musings
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
              >
                About Platform
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <Settings className="w-4 h-4 text-zinc-500" />
                <span>Settings</span>
              </Link>
            </div>
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col space-y-2">
              {session?.user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                      <Image
                        src={userAvatar}
                        alt={rawUsername}
                        fill
                        className="object-contain p-0.5"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {session.user.name || "Reader"}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">@{rawUsername}</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/studio"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-md"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Writer Studio CMS</span>
                    </Link>
                  )}
                  <Link
                    href="/library"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>My Library</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for closing mobile menu on click anywhere outside */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 top-16 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}
    </>
  );
}

