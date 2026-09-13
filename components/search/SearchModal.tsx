"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, FileText, Tag, Folder, Quote, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { DeletePostButton } from "@/components/article/DeletePostButton";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email?.toLowerCase();
  const isAdmin = (session?.user as any)?.role === "ADMIN" || userEmail === "prasoon7pathak@gmail.com";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
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
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border space-x-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, quotes, code, science, poems, tags..."
            className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
              Searching publications...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">No matches found for &quot;{query}&quot;</p>
              <p className="text-xs text-muted-foreground">Try searching with broader terms or section names like Technology, Coding, Quotes, or Science.</p>
            </div>
          )}

          {!loading && !query && (
            <div className="py-8 px-2 space-y-4 text-xs text-muted-foreground">
              <p className="font-semibold uppercase tracking-wider text-[10px] text-foreground">Suggested Topics</p>
              <div className="flex flex-wrap gap-2">
                {["AI Agents", "Quotes", "React 19", "JWST", "Hindi Poetry", "Focus", "LeetCode"].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setQuery(topic)}
                    className="px-3 py-1.5 rounded-full bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-800 text-foreground transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground px-2">
                Found {results.length} results
              </p>
              {results.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start justify-between p-3 rounded-xl hover:bg-muted/70 transition-colors relative"
                >
                  <Link
                    href={`/article/${item.slug}`}
                    onClick={onClose}
                    className="flex-1 space-y-1 pr-4"
                  >
                    <div className="flex items-center space-x-2 text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                      <span>{item.section}</span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1 text-muted-foreground">
                        {item.contentType === "QUOTE" && <Quote className="w-2.5 h-2.5 text-amber-500" />}
                        <span>{item.contentType}</span>
                      </span>
                    </div>
                    <h4 className="font-serif-editorial text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.contentType === "QUOTE" ? `“${item.title}”` : item.title}
                    </h4>
                    {item.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.excerpt}</p>
                    )}
                  </Link>
                  <div className="flex items-center space-x-1 shrink-0 mt-2">
                    {isAdmin && (
                      <div className="flex items-center space-x-1 mr-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
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
                            setResults((prev) => prev.filter((r) => r.id !== item.id));
                          }}
                        />
                      </div>
                    )}
                    <Link href={`/article/${item.slug}`} onClick={onClose}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
