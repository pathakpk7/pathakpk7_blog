"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, BookOpen, PenTool, LogOut, Home, Settings, User } from "lucide-react";
import { Navigation } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useSession, signOut } from "next-auth/react";
import { getSafeAvatarUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onOpenSearch?: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const drawerRef = useRef<HTMLDivElement>(null);

  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";
  const username = (session?.user as any)?.username || (session?.user?.name ? session.user.name.toLowerCase().replace(/\s+/g, "_") : "reader");
  const avatarUrl = getSafeAvatarUrl(session?.user?.image, username);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

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
      <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            {/* Top-Left: Mobile Menu Toggle + Brand Identity */}
            <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/" className="group flex items-center space-x-2.5 shrink-0">
                <div className="relative w-8 h-8 rounded-sm overflow-hidden bg-foreground shrink-0 flex items-center justify-center">
                  <Image
                    src="/emblem.png"
                    alt="ThePathak Logo"
                    fill
                    sizes="(max-width: 640px) 32px, 36px"
                    className="object-contain p-0.5 invert dark:invert-0"
                    priority
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif-editorial text-xl sm:text-2xl font-semibold tracking-tight text-foreground transition-colors">
                    ThePathak<span className="text-blue-600 dark:text-blue-400">.tech</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] tracking-wider text-muted-foreground -mt-1 font-sans">
                    Interpretation over repetition
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <Navigation />

            {/* Actions & Reader Controls */}
            <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 ml-auto lg:ml-0">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary rounded-sm transition-colors"
                title="Search publications (⌘K)"
                aria-label="Search articles"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Search</span>
                <kbd className="hidden lg:inline text-[10px] bg-background px-1.5 py-0.5 rounded-xs border border-border text-muted-foreground font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell */}
              {session?.user && <NotificationBell variant="header" />}

              {/* Session State */}
              {session?.user ? (
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  {isAdmin && (
                    <Link
                      href="/studio"
                      className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 rounded-sm transition-opacity"
                      title="Writer Studio CMS"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Studio</span>
                    </Link>
                  )}

                  <Link
                    href="/library"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
                    title="Saved Library"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/${username}`}
                    className="group flex items-center space-x-2 p-1 pr-2 rounded-sm hover:bg-secondary transition-colors"
                    title={`Profile (@${username})`}
                  >
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                      <Image
                        src={avatarUrl}
                        alt={session.user.name || "Profile"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="hidden xl:inline-block text-xs font-medium text-foreground max-w-[90px] truncate">
                      {session.user.name || username}
                    </span>
                  </Link>

                  <Link
                    href="/settings"
                    className="hidden sm:flex p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={async () => {
                      await signOut({ redirect: false });
                      window.location.href = "/";
                    }}
                    className="hidden lg:flex p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-sm transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary rounded-sm transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Animated Mobile & Tablet Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={drawerRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden border-t border-border bg-background px-5 pt-4 pb-8 space-y-5 relative z-40 shadow-xl"
            >
              {session?.user && (
                <div className="p-3 bg-secondary/60 rounded-sm flex items-center justify-between">
                  <Link
                    href={`/${username}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                      <Image
                        src={avatarUrl}
                        alt={session.user.name || "Profile"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {session.user.name || "Reader"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{username}
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                </div>
              )}

              <div className="flex flex-col space-y-1">
                {[
                  { name: "Home", href: "/" },
                  { name: "Technology & AI", href: "/technology" },
                  { name: "Science & Space", href: "/science" },
                  { name: "Coding & Tutorials", href: "/coding" },
                  { name: "Ideas & Essays", href: "/ideas" },
                  { name: "Creative & Poems", href: "/creative" },
                  { name: "Notes & Musings", href: "/notes" },
                  { name: "About Platform", href: "/about" },
                ].map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-border flex flex-col space-y-2">
                {session?.user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/studio"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-sm transition-opacity"
                      >
                        <PenTool className="w-4 h-4" />
                        <span>Writer Studio CMS</span>
                      </Link>
                    )}
                    <Link
                      href="/library"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Saved Library</span>
                    </Link>
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await signOut({ redirect: false });
                        window.location.href = "/";
                      }}
                      className="flex items-center space-x-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm w-full text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-sm"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Admin Mobile Floating Action Button */}
      {isAdmin && (
        <Link
          href="/studio"
          className="fixed bottom-6 right-5 z-40 lg:hidden flex items-center space-x-2 px-4 py-2.5 rounded-sm bg-primary text-primary-foreground font-medium text-xs shadow-lg active:scale-95 transition-transform"
          title="Open Writer Studio"
          aria-label="Open Writer Studio"
        >
          <PenTool className="w-4 h-4" />
          <span>Studio</span>
        </Link>
      )}

      {/* Backdrop overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
