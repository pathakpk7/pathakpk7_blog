"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24 min-h-screen">
      {/* Editorial Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="space-y-6"
      >
        <span className="text-xs font-medium tracking-wider text-muted-foreground">
          Manifesto
        </span>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[1.08]">
          Interpretation <br />
          <span className="font-normal text-muted-foreground">over repetition</span>
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground font-serif leading-relaxed max-w-3xl pt-2">
          We live in an age drowning in automated noise, ephemeral feeds, and recycled press releases. The true scarcity today is not information — it is clarity, rigorous synthesis, and human depth.
        </p>
      </motion.header>

      {/* Purpose & Origin */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease }}
        className="space-y-6 pt-6 border-t border-border"
      >
        <h2 className="text-xs font-medium tracking-wider text-muted-foreground">
          Foundation
        </h2>

        <div className="prose prose-zinc dark:prose-invert prose-editorial text-lg leading-relaxed space-y-5">
          <p>
            <strong>ThePathak.tech</strong> is an independent publishing platform created by software architect and writer <strong>Prasoon Pathak</strong>. It is built on a simple conviction: technology and science should be understood deeply from first principles, not merely summarized for quick clicks.
          </p>
          <p>
            When an artificial intelligence model launches, we do not ask for headline applause — we dissect what it changes in real-world systems engineering. When space telescopes peer into distant exoplanet atmospheres, we explain the physics of transmission spectroscopy. And when the noise of the digital world grows deafening, we return to the quiet craft of original poetry, essays, and literary reflections.
          </p>
        </div>
      </motion.section>

      {/* The Four Arenas */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease }}
        className="space-y-8 pt-6 border-t border-border"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif-editorial text-2xl sm:text-3xl font-semibold text-foreground">
            Curated Arenas
          </h2>
          <span className="text-xs text-muted-foreground">
            Core Disciplines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link
            href="/technology"
            className="group block space-y-2 p-4 -mx-4 rounded-sm hover:bg-secondary/40 transition-colors"
          >
            <h3 className="font-serif-editorial text-xl font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span>Technology & Intelligence</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Architectural analysis of autonomous agentic loops, distributed systems, compiler internals, and foundational technical shifts.
            </p>
          </Link>

          <Link
            href="/science"
            className="group block space-y-2 p-4 -mx-4 rounded-sm hover:bg-secondary/40 transition-colors"
          >
            <h3 className="font-serif-editorial text-xl font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span>Science & Space</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Astrophysics, JWST deep-sky spectroscopy, quantum phenomena, planetary atmospheric chemistry, and orbital mechanics.
            </p>
          </Link>

          <Link
            href="/coding"
            className="group block space-y-2 p-4 -mx-4 rounded-sm hover:bg-secondary/40 transition-colors"
          >
            <h3 className="font-serif-editorial text-xl font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span>Engineering & Systems</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hands-on Next.js App Router patterns, React 19 mental models, algorithmic problem breakdowns, and resilient full-stack architecture.
            </p>
          </Link>

          <Link
            href="/creative"
            className="group block space-y-2 p-4 -mx-4 rounded-sm hover:bg-secondary/40 transition-colors"
          >
            <h3 className="font-serif-editorial text-xl font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span>Creative & Literature</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Original Hindi and English poetry, philosophical essays on discipline, micro-prose, and the aesthetics of thought.
            </p>
          </Link>
        </div>
      </motion.section>

      {/* Editorial Standards */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease }}
        className="p-8 sm:p-10 bg-secondary/40 rounded-sm space-y-8"
      >
        <span className="text-xs font-medium tracking-wider text-muted-foreground">
          Commitments
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="font-serif-editorial text-lg font-semibold text-foreground">First Principles</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We deconstruct complex topics down to fundamental truths rather than copying consensus or PR buzzwords.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif-editorial text-lg font-semibold text-foreground">Zero Synthetic Slop</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every sentence, diagram, and code sample is deliberately written, verified, and polished with authentic human craft.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif-editorial text-lg font-semibold text-foreground">Enduring Value</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We publish evergreen mental models and deep dives intended to remain insightful years after publication.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Author Profile */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease }}
        className="pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center gap-6"
      >
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted border border-border shrink-0">
          <Image
            src="/avatars/anime-haruto.jpg"
            alt="Prasoon Pathak"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-3 flex-1">
          <div>
            <h3 className="font-serif-editorial text-2xl font-semibold text-foreground">
              Prasoon Pathak
            </h3>
            <p className="text-xs text-muted-foreground">Lead Architect & Writer</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Exploring modern web architectures, autonomous agent loops, physics, and creative literature.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://www.prasoonpathak7.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href="https://github.com/pathakpk7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
            </a>
            <Link
              href="/technology"
              className="inline-flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Recent Dispatches</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
