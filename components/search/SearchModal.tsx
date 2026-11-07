"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, User, Hash, AtSign, BookOpen } from "lucide-react";
import { cn, getSafeAvatarUrl } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "@/components/article/DeletePostButton";
import { motion, AnimatePresence } from "framer-motion";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchAuthor {
  id: string;
  name?: string | null;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  role: string;
  bio?: string | null;
  postCount: number;
}

interface SearchTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface SearchPost {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  section: string;
  contentType: string;
  readingTime: number;
  publishedAt?: Date | string | null;
  author?: {
    name?: string | null;
    profile?: {
      displayName?: string | null;
      username?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
  tags?: Array<{ tag: { name: string; slug: string } }>;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [authors, setAuthors] = useState<SearchAuthor[]>([]);
  const [tags, setTags] = useState<SearchTag[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setPosts([]);
      setAuthors([]);
      setTags([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
          setAuthors(data.authors || []);
          setTags(data.tags || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleFilterClick = (prefix: string) => {
    setQuery(prefix);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const totalMatches = posts.length + authors.length + tags.length;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-xs cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -8 }}
          transition={{ duration: 0.16 }}
          className="relative w-full max-w-2xl bg-background rounded-sm border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] cursor-default"
        >
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-border space-x-3 bg-secondary/30">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search publications, topics, #tags, or @authors..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <kbd className="hidden sm:inline text-[10px] bg-secondary px-1.5 py-0.5 rounded-xs border border-border text-muted-foreground font-mono">
              ESC
            </kbd>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex items-center space-x-2 px-4 py-2 border-b border-border text-xs text-muted-foreground">
            <span>Filter by:</span>
            <button
              onClick={() => handleFilterClick("#")}
              className={cn(
                "px-2 py-0.5 rounded-sm transition-colors",
                query.startsWith("#") ? "bg-foreground text-background font-medium" : "hover:text-foreground hover:bg-secondary"
              )}
            >
              #tags
            </button>
            <button
              onClick={() => handleFilterClick("@")}
              className={cn(
                "px-2 py-0.5 rounded-sm transition-colors",
                query.startsWith("@") ? "bg-foreground text-background font-medium" : "hover:text-foreground hover:bg-secondary"
              )}
            >
              @authors
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {loading && (
              <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                Searching archive...
              </div>
            )}

            {!loading && query && totalMatches === 0 && (
              <div className="py-12 text-center space-y-1">
                <p className="text-sm font-medium text-foreground">No matches found for &quot;{query}&quot;</p>
                <p className="text-xs text-muted-foreground">
                  Try searching for general keywords or section terms.
                </p>
              </div>
            )}

            {!loading && !query && (
              <div className="py-4 space-y-5 text-xs text-muted-foreground">
                <div className="space-y-2">
                  <p className="text-foreground font-medium">Suggested Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {["Autonomous AI Agents", "Astrophysics", "Next.js", "React 19", "Systems Architecture", "Poetry"].map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setQuery(topic)}
                        className="px-2.5 py-1 rounded-sm bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && totalMatches > 0 && (
              <div className="space-y-6">
                {/* Authors */}
                {authors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Authors ({authors.length})</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {authors.map((author) => (
                        <Link
                          key={author.id}
                          href={`/${author.username}`}
                          onClick={onClose}
                          className="flex items-center space-x-3 p-2.5 rounded-sm hover:bg-secondary transition-colors group"
                        >
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                            <Image
                              src={getSafeAvatarUrl(author.avatarUrl, author.username)}
                              alt={author.displayName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate">
                              {author.displayName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">@{author.username}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Tags ({tags.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => setQuery(`#${tag.name}`)}
                          className="px-2.5 py-1 rounded-sm bg-secondary text-foreground text-xs hover:bg-secondary/80 transition-colors"
                        >
                          #{tag.name} <span className="text-muted-foreground">({tag.postCount})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts */}
                {posts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Publications ({posts.length})</p>
                    <div className="divide-y divide-border">
                      {posts.map((item) => (
                        <div
                          key={item.id}
                          className="group flex items-start justify-between py-3 px-1 rounded-sm hover:bg-secondary/40 transition-colors"
                        >
                          <Link
                            href={`/article/${item.slug}`}
                            onClick={onClose}
                            className="flex-1 space-y-1 pr-4"
                          >
                            <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                              <span className="capitalize">{item.section}</span>
                              <span>•</span>
                              <span className="capitalize">{item.contentType.toLowerCase()}</span>
                            </div>
                            <h4 className="font-serif-editorial text-base font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h4>
                            {item.excerpt && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{item.excerpt}</p>
                            )}
                          </Link>

                          <div className="flex items-center space-x-2 shrink-0 mt-2">
                            {isAdmin && (
                              <DeletePostButton
                                postId={item.id}
                                postTitle={item.title}
                                variant="icon"
                                onDeleted={() => {
                                  setPosts((prev) => prev.filter((r) => r.id !== item.id));
                                }}
                              />
                            )}
                            <Link href={`/article/${item.slug}`} onClick={onClose}>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
