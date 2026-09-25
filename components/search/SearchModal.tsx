"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, Tag, Quote, Edit3, User, Hash, AtSign, BookOpen, Layers, Sparkles } from "lucide-react";
import { cn, formatDate, getSafeAvatarUrl } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "@/components/article/DeletePostButton";

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
  const [searchMode, setSearchMode] = useState<"all" | "tag" | "author">("all");
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
      setSearchMode("all");
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
          setSearchMode(data.mode || "all");
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-card rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[82vh] transition-all cursor-default"
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border space-x-3 bg-muted/20">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex-1 flex items-center space-x-2">
            {query.startsWith("#") && (
              <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-mono font-semibold shrink-0">
                <Hash className="w-3 h-3" />
                <span>Tag</span>
              </span>
            )}
            {query.startsWith("@") && (
              <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-mono font-semibold shrink-0">
                <AtSign className="w-3 h-3" />
                <span>Author</span>
              </span>
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search headings, #tags, @authors, topics, or quotes..."
              className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        {/* Search Filter Shortcuts Bar */}
        <div className="flex items-center space-x-2 px-4 py-2 border-b border-border bg-zinc-50/80 dark:bg-zinc-900/60 text-xs overflow-x-auto">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0 font-semibold">
            Quick Filters:
          </span>
          <button
            onClick={() => handleFilterClick("#")}
            className={cn(
              "inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0",
              query.startsWith("#")
                ? "bg-blue-600 text-white font-semibold"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-700/80"
            )}
          >
            <Hash className="w-3 h-3" />
            <span>Search by #Tag</span>
          </button>
          <button
            onClick={() => handleFilterClick("@")}
            className={cn(
              "inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0",
              query.startsWith("@")
                ? "bg-purple-600 text-white font-semibold"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-700/80"
            )}
          >
            <AtSign className="w-3 h-3" />
            <span>Search by @User/Admin</span>
          </button>
          <button
            onClick={() => handleFilterClick("")}
            className={cn(
              "inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0",
              !query.startsWith("#") && !query.startsWith("@") && query
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-700/80"
            )}
          >
            <Search className="w-3 h-3" />
            <span>All Keywords</span>
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Searching publications & authors...</span>
            </div>
          )}

          {!loading && query && totalMatches === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">No matches found for &quot;{query}&quot;</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try searching with a headline keyword, using <span className="font-mono text-blue-500">#tag</span> to filter by topic, or <span className="font-mono text-purple-500">@username</span> to find specific authors.
              </p>
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 px-2 space-y-5 text-xs text-muted-foreground">
              {/* Popular Tags */}
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wider text-[10px] text-foreground flex items-center space-x-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-500" />
                  <span>Search by Tags (#tag)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["#technology", "#react", "#ai", "#nextjs", "#science", "#coding", "#ideas", "#poetry", "#hindi"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setQuery(t)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-mono text-xs transition-colors border border-blue-500/20"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authors & Admins */}
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wider text-[10px] text-foreground flex items-center space-x-1.5">
                  <AtSign className="w-3.5 h-3.5 text-purple-500" />
                  <span>Search by Author (@user)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["@thepathak", "@prasoon", "@admin"].map((u) => (
                    <button
                      key={u}
                      onClick={() => setQuery(u)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 font-mono text-xs transition-colors border border-purple-500/20"
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Topics / Headings */}
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wider text-[10px] text-zinc-900 dark:text-zinc-200 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Topic & Heading Keywords</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Autonomous AI Agents", "React 19", "Astrophysics", "Deep Work", "Tutorials", "Quotes"].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setQuery(topic)}
                      className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium border border-zinc-200/80 dark:border-zinc-700/80 transition-colors"
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
              {/* 1. Matching Authors / Users */}
              {authors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-purple-600 dark:text-purple-400 flex items-center space-x-1 px-1">
                    <User className="w-3 h-3" />
                    <span>Authors & Profiles ({authors.length})</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {authors.map((author) => (
                      <Link
                        key={author.id}
                        href={`/${author.username}`}
                        onClick={onClose}
                        className="flex items-center space-x-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/30 border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all group"
                      >
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                          <Image
                            src={getSafeAvatarUrl(author.avatarUrl, author.username)}
                            alt={author.displayName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                              {author.displayName}
                            </p>
                            {author.role === "ADMIN" && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 uppercase font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">@{author.username}</p>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                          {author.postCount} {author.postCount === 1 ? "post" : "posts"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Matching Tags */}
              {tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-1 px-1">
                    <Hash className="w-3 h-3" />
                    <span>Tags ({tags.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setQuery(`#${tag.name}`)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-mono font-medium transition-colors"
                      >
                        <span>#{tag.name}</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">({tag.postCount})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Matching Articles & Headings */}
              {posts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center space-x-1 px-1">
                    <BookOpen className="w-3 h-3" />
                    <span>Articles & Essays ({posts.length})</span>
                  </p>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {posts.map((item) => {
                      const authorName = item.author?.profile?.displayName || item.author?.name || "The Pathak";
                      const username = item.author?.profile?.username;

                      return (
                        <div
                          key={item.id}
                          className="group flex items-start justify-between py-3 px-2 rounded-xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors relative"
                        >
                          <Link
                            href={`/article/${item.slug}`}
                            onClick={onClose}
                            className="flex-1 space-y-1 pr-4"
                          >
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                              <span>{item.section}</span>
                              <span>•</span>
                              <span className="inline-flex items-center space-x-1 text-zinc-500 dark:text-zinc-400 font-normal">
                                {item.contentType === "QUOTE" && <Quote className="w-2.5 h-2.5 text-amber-500" />}
                                <span>{item.contentType}</span>
                              </span>
                              <span>•</span>
                              <span className="text-zinc-500 dark:text-zinc-400 font-normal lowercase">{authorName}</span>
                              {item.readingTime && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-500 dark:text-zinc-400 font-normal">{item.readingTime} min read</span>
                                </>
                              )}
                            </div>

                            <h4 className="font-serif-editorial text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                              {item.contentType === "QUOTE" ? `“${item.title}”` : item.title}
                            </h4>

                            {item.subtitle && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 italic font-serif">
                                — {item.subtitle}
                              </p>
                            )}

                            {item.excerpt && !item.subtitle && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">{item.excerpt}</p>
                            )}

                            {/* Tag badges on post */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 pt-1">
                                {item.tags.slice(0, 3).map(({ tag }) => (
                                  <span
                                    key={tag.slug}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setQuery(`#${tag.name}`);
                                    }}
                                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors"
                                  >
                                    #{tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>

                          <div className="flex items-center space-x-1 shrink-0 mt-2">
                            {isAdmin && (
                              <div
                                className="flex items-center space-x-1 mr-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Link
                                  href={`/studio/posts/${item.id}/edit`}
                                  onClick={onClose}
                                  title="Edit in Studio"
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </Link>
                                <DeletePostButton
                                  postId={item.id}
                                  postTitle={item.title}
                                  variant="icon"
                                  onDeleted={() => {
                                    setPosts((prev) => prev.filter((r) => r.id !== item.id));
                                  }}
                                />
                              </div>
                            )}
                            <Link href={`/article/${item.slug}`} onClick={onClose}>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="p-2.5 px-4 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center space-x-3">
            <span><kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">#tag</kbd> to filter tags</span>
            <span><kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">@user</kbd> to find authors</span>
          </div>
          <span>Press <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
