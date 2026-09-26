"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  Hash,
  AtSign,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  User,
  Quote,
  Clock,
} from "lucide-react";
import { cn, formatDate, getSafeAvatarUrl } from "@/lib/utils";
import { ArticleCard } from "@/components/article/ArticleCard";

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

const POPULAR_TAGS = [
  "#technology",
  "#ai",
  "#react",
  "#nextjs",
  "#science",
  "#coding",
  "#ideas",
  "#poetry",
  "#hindi",
];

const SECTIONS = [
  { id: "all", label: "All Sections" },
  { id: "technology", label: "Technology" },
  { id: "science", label: "Science" },
  { id: "coding", label: "Coding" },
  { id: "ideas", label: "Ideas" },
  { id: "creative", label: "Creative" },
  { id: "notes", label: "Notes" },
];

export function SearchPageView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedSection, setSelectedSection] = useState("all");
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [authors, setAuthors] = useState<SearchAuthor[]>([]);
  const [tags, setTags] = useState<SearchTag[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if URL query changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  // Execute search
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
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
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

  const handleSearchSubmit = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`, { scroll: false });
    } else {
      router.push("/search", { scroll: false });
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedSection === "all") return true;
    return post.section.toLowerCase() === selectedSection.toLowerCase();
  });

  const totalResults = posts.length + authors.length + tags.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono uppercase tracking-wider font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full Archive Index</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Search Archive
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Search all technical publications, essays, scientific explainers, poetry, and author profiles across the platform.
        </p>
      </div>

      {/* Main Search Input Box */}
      <div className="space-y-4">
        <div className="relative flex items-center bg-card rounded-2xl border-2 border-border focus-within:border-blue-500 shadow-lg p-2 transition-all">
          <Search className="w-5 h-5 ml-3 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearchSubmit(e.target.value)}
            placeholder="Search keywords, topics, #tags, @authors, or quotes..."
            className="w-full bg-transparent px-3 py-2 text-base sm:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleSearchSubmit("")}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-1"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-mono uppercase tracking-wider text-xs font-semibold mr-1">
            Explore Tags:
          </span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSearchSubmit(tag)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-mono transition-colors border",
                query === tag
                  ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-8 pt-4">
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Searching archive index...</p>
          </div>
        )}

        {!loading && query && totalResults === 0 && (
          <div className="py-16 text-center space-y-4 max-w-md mx-auto p-8 rounded-2xl bg-card border border-border">
            <div className="p-3 bg-muted rounded-full w-12 h-12 mx-auto flex items-center justify-center text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold font-serif-editorial text-foreground">
              No matching publications found
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We couldn&apos;t find anything matching &quot;<span className="font-semibold text-foreground">{query}</span>&quot;. Try checking for spelling errors, searching for broader terms, or using a <span className="font-mono text-blue-500">#tag</span>.
            </p>
          </div>
        )}

        {!loading && !query && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Hash className="w-5 h-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wider font-mono">Tag Search</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono">#tag</code> (like <span className="text-blue-500">#technology</span> or <span className="text-blue-500">#ai</span>) to filter publications by topic classification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <AtSign className="w-5 h-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wider font-mono">Author Discovery</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono">@username</code> (like <span className="text-purple-500">@thepathak</span>) to find author profiles, biographies, and author portfolios.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-semibold text-sm uppercase tracking-wider font-mono">Full-Text Matching</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Search matches across titles, subtitles, quotes, article summaries, and full article contents simultaneously.
              </p>
            </div>
          </div>
        )}

        {!loading && query && totalResults > 0 && (
          <div className="space-y-8">
            {/* Authors Matches */}
            {authors.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Matching Authors & Profiles ({authors.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {authors.map((author) => (
                    <Link
                      key={author.id}
                      href={`/${author.username}`}
                      className="flex items-center space-x-3 p-3.5 rounded-2xl bg-card hover:bg-muted/40 border border-border hover:border-purple-500/50 transition-all group shadow-xs"
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                        <Image
                          src={getSafeAvatarUrl(author.avatarUrl, author.username)}
                          alt={author.displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                            {author.displayName}
                          </p>
                          {author.role === "ADMIN" && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase font-semibold">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">@{author.username}</p>
                        <p className="text-[11px] text-muted-foreground pt-0.5">
                          {author.postCount} {author.postCount === 1 ? "publication" : "publications"}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Matches */}
            {tags.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2">
                  <Hash className="w-4 h-4" />
                  <span>Matching Topic Tags ({tags.length})</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSearchSubmit(`#${tag.name}`)}
                      className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-mono font-semibold transition-colors"
                    >
                      <span>#{tag.name}</span>
                      <span className="text-[11px] text-muted-foreground">({tag.postCount})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Filter Bar for Articles */}
            {posts.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold font-serif-editorial text-foreground">
                      Publications ({filteredPosts.length})
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Articles, essays, and stories matching your search criteria.
                    </p>
                  </div>

                  {/* Section Filters */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {SECTIONS.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => setSelectedSection(sec.id)}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                          selectedSection === sec.id
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No articles found in section &quot;{selectedSection}&quot;.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <ArticleCard
                        key={post.id}
                        post={post as any}
                        variant={post.contentType === "QUOTE" ? "quote" : "standard"}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
