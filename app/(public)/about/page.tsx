import Link from "next/link";
import Image from "next/image";
import { Sparkles, Layers, Rocket, Code2, Feather, ArrowRight, ArrowUpRight, ShieldCheck, Compass, BookOpen, Lightbulb } from "lucide-react";

export const metadata = {
  title: "Editorial Philosophy & About | ThePathak.tech",
  description: "Interpretation over repetition. An independent publication exploring software architecture, autonomous intelligence, astrophysics, and literature.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 min-h-screen">
      {/* Editorial Header & Manifesto */}
      <header className="space-y-6 text-center sm:text-left border-b border-border pb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Editorial Manifesto</span>
        </div>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
          Interpretation <br />
          <span className="italic font-normal text-blue-600 dark:text-blue-400">over repetition.</span>
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground font-serif leading-relaxed max-w-3xl">
          We live in an age drowning in automated noise, ephemeral feeds, and recycled press releases. The true scarcity today is not information — it is clarity, rigorous synthesis, and human depth.
        </p>
      </header>

      {/* Core Mission & Why We Write */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">
          <Compass className="w-4 h-4" />
          <span>Why ThePathak.tech Exists</span>
        </div>

        <div className="prose prose-zinc dark:prose-invert prose-editorial text-lg leading-relaxed space-y-5">
          <p>
            <strong>ThePathak.tech</strong> is an independent publishing platform created by software architect and writer <strong>Prasoon Pathak</strong>. It is built on a simple conviction: technology and science should be understood deeply from first principles, not merely summarized for quick clicks.
          </p>
          <p>
            When an artificial intelligence model launches, we do not ask for headline applause — we dissect what it changes in real-world systems engineering. When space telescopes peer into distant exoplanet atmospheres, we explain the physics of transmission spectroscopy. And when the noise of the digital world grows deafening, we return to the quiet craft of original poetry, essays, and literary reflections.
          </p>
        </div>
      </section>

      {/* Four Arenas Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-serif-editorial text-3xl font-bold text-foreground">
            The Four Core Arenas
          </h2>
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            CURATED DISCIPLINES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Technology & AI */}
          <Link
            href="/technology"
            className="group p-6 rounded-2xl bg-card border border-border hover:border-blue-500/50 transition-all duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span>Technology & AI</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Architectural analysis of autonomous agentic loops, distributed systems, compiler internals, and foundational technical shifts.
            </p>
          </Link>

          {/* Science & Space */}
          <Link
            href="/science"
            className="group p-6 rounded-2xl bg-card border border-border hover:border-indigo-500/50 transition-all duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
              <span>Science & Space</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Astrophysics, JWST deep-sky spectroscopy, quantum phenomena, planetary atmospheric chemistry, and orbital mechanics.
            </p>
          </Link>

          {/* Coding & Systems */}
          <Link
            href="/coding"
            className="group p-6 rounded-2xl bg-card border border-border hover:border-emerald-500/50 transition-all duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
              <span>Coding & Systems</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hands-on Next.js App Router patterns, React 19 mental models, algorithmic problem breakdowns, and resilient full-stack architecture.
            </p>
          </Link>

          {/* Ideas & Words */}
          <Link
            href="/creative"
            className="group p-6 rounded-2xl bg-card border border-border hover:border-amber-500/50 transition-all duration-200 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Feather className="w-5 h-5" />
            </div>
            <h3 className="font-serif-editorial text-xl font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
              <span>Creative & Literature</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Original Hindi and English poetry (Devanagari typography), philosophical essays on discipline, micro-prose, and the aesthetics of thought.
            </p>
          </Link>
        </div>
      </section>

      {/* Editorial Commitments */}
      <section className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-blue-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Our Editorial Standards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="font-serif-editorial text-lg font-bold text-white">1. First Principles</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We deconstruct complex topics down to fundamental truths rather than copying consensus or PR buzzwords.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif-editorial text-lg font-bold text-white">2. Zero Synthetic Slop</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every sentence, diagram, and code sample is deliberately written, verified, and polished with authentic human craft.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif-editorial text-lg font-bold text-white">3. Enduring Value</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We publish evergreen mental models and deep dives intended to remain insightful years after publication.
            </p>
          </div>
        </div>
      </section>

      {/* Author Profile Block */}
      <section className="p-8 rounded-3xl bg-card border border-border space-y-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 border border-border shrink-0 shadow-md">
          <Image
            src="/avatars/anime-haruto.jpg"
            alt="Prasoon Pathak"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-serif-editorial text-2xl font-bold text-foreground">
              Prasoon Pathak
            </h3>
            <span className="text-xs font-mono text-zinc-400">@pathak</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Lead Software Architect, Writer, and Systems Builder exploring modern web architectures, autonomous agent loops, physics, and creative literature.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <a
              href="https://www.prasoonpathak7.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <span>Explore Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/pathakpk7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-xs border border-border transition-colors"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </a>
            <Link
              href="/technology"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-xs border border-border transition-colors"
            >
              <span>Latest Publications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

