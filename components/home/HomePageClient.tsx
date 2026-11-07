"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArrowRight, ArrowUpRight } from "lucide-react";

interface HomePageClientProps {
  featuredPosts: any[];
  techPosts: any[];
  sciencePosts: any[];
  codingPosts: any[];
  creativePosts: any[];
  notesPosts: any[];
}

const ease = [0.16, 1, 0.3, 1] as const;

export function HomePageClient({
  featuredPosts,
  techPosts,
  sciencePosts,
  codingPosts,
  creativePosts,
  notesPosts,
}: HomePageClientProps) {
  return (
    <div className="space-y-28 pb-24">
      {/* Editorial Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="flex items-center space-x-3 text-xs tracking-wider text-muted-foreground"
            >
              <span>Volume IV</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/60" />
              <span>Independent Technical & Cultural Review</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
              className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.08]"
            >
              Interpretation <br />
              <span className="font-normal text-muted-foreground">over repetition</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed"
            >
              Rigorous synthesis across software architecture, autonomous systems, astrophysics, personal essays, and poetry. No automated noise. Only deliberate craft.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/technology"
                className="group inline-flex items-center space-x-2 px-5 py-2.5 bg-foreground text-background text-xs sm:text-sm font-medium rounded-sm hover:opacity-90 transition-opacity"
              >
                <span>Read recent dispatches</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-secondary rounded-sm transition-colors"
              >
                <span>Editorial manifesto</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Lead Story */}
      {featuredPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-baseline justify-between border-b border-border pb-3 mb-8">
            <h2 className="text-xs font-medium tracking-wider text-muted-foreground">
              Lead Story
            </h2>
            <span className="text-xs text-muted-foreground">
              Curated Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1">
            {featuredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="featured" />
            ))}
          </div>
        </motion.section>
      )}

      {/* Technology & AI Section */}
      {techPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-foreground">
                Technology & Intelligence
              </h2>
            </div>
            <Link
              href="/technology"
              className="group inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        </motion.section>
      )}

      {/* Science & Cosmos Section */}
      {sciencePosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-foreground">
                Science & Cosmos
              </h2>
            </div>
            <Link
              href="/science"
              className="group inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sciencePosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        </motion.section>
      )}

      {/* Coding & Architecture Section */}
      {codingPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-foreground">
                Engineering & Architecture
              </h2>
            </div>
            <Link
              href="/coding"
              className="group inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {codingPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        </motion.section>
      )}

      {/* Literary & Creative Quarter */}
      {creativePosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-foreground">
                The Literary Quarter
              </h2>
            </div>
            <Link
              href="/creative"
              className="group inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Explore poetry & prose</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {creativePosts.map((post) => (
              <ArticleCard
                key={post.id}
                post={post}
                variant={post.contentType === "QUOTE" ? "quote" : "creative"}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Notes & Fragments */}
      {notesPosts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
        >
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-foreground">
                Field Notes & Fragments
              </h2>
            </div>
            <Link
              href="/notes"
              className="group inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>View archive</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {notesPosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
