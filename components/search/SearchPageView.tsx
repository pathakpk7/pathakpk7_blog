"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { cn, getSafeAvatarUrl } from "@/lib/utils";
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
  { id: "all", label: "All Dispatches" },
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

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs font-medium tracking-wider text-muted-foreground">
          Index
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Search the Archive
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Search all technical publications, essays, scientific explainers, poetry, and author profiles across the platform.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="space-y-4 max-w-3xl">
        <div className="relative flex items-center bg-secondary/40 border border-border rounded-sm p-2 transition-colors focus-within:border-foreground">
          <Search className="w-5 h-5 ml-3 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearchSubmit(e.target.value)}
            placeholder="Search topics, #tags, @authors, or keywords..."
            className="w-full bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleSearchSubmit("")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors mr-1"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Explore:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSearchSubmit(tag)}
              className={cn(
                "px-2.5 py-1 rounded-sm transition-colors",
                query === tag
                  ? "bg-foreground text-background font-medium"
                  : "bg-secondary/60 text-foreground hover:bg-secondary"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-10 pt-4">
        {loading && (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Searching archive index...
          </div>
        )}

        {!loading && query && totalResults === 0 && (
          <div className="py-20 text-center space-y-2 max-w-md mx-auto bg-secondary/30 rounded-sm p-8">
            <h2 className="text-base font-medium text-foreground">
              No matching publications found
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We couldn&apos;t find anything matching &quot;<span className="font-semibold text-foreground">{query}</span>&quot;. Try checking for spelling errors, broader keywords, or a specific #tag.
            </p>
          </div>
        )}

        {!loading && !query && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-t border-border pt-10">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-foreground">Tag Classification</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter by topic using #tag (such as #technology, #ai, or #nextjs).
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm text-foreground">Author Discovery</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Locate specific writers and dispatches using @username.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm text-foreground">Full Text Search</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Queries search full article contents, quotes, and technical breakdowns simultaneously.
              </p>
            </div>
          </div>
        )}

        {!loading && query && totalResults > 0 && (
          <div className="space-y-12">
            {/* Authors Matches */}
            {authors.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-medium tracking-wider text-muted-foreground">
                  Authors ({authors.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {authors.map((author) => (
                    <Link
                      key={author.id}
                      href={`/${author.username}`}
                      className="flex items-center space-x-3 p-3 rounded-sm hover:bg-secondary/60 transition-colors group border border-border"
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                        <Image
                          src={getSafeAvatarUrl(author.avatarUrl, author.username)}
                          alt={author.displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {author.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">@{author.username}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Matches */}
            {tags.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-medium tracking-wider text-muted-foreground">
                  Topic Tags ({tags.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleSearchSubmit(`#${tag.name}`)}
                      className="px-3 py-1.5 rounded-sm bg-secondary text-foreground text-xs hover:bg-secondary/80 transition-colors"
                    >
                      #{tag.name} <span className="text-muted-foreground">({tag.postCount})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Matches */}
            {posts.length > 0 && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-border">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold font-serif-editorial text-foreground">
                      Publications ({filteredPosts.length})
                    </h2>
                  </div>

                  {/* Section Filters */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto">
                    {SECTIONS.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => setSelectedSection(sec.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-sm text-xs transition-colors",
                          selectedSection === sec.id
                            ? "bg-foreground text-background font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
