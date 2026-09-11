import Link from "next/link";
import { Sparkles, Layers, Rocket, Code2, Feather, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Editorial | ThePathak.tech",
  description: "Learn about the editorial philosophy, technology focus, and literary space of ThePathak.tech.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 min-h-screen">
      {/* Header */}
      <header className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Editorial Manifesto</span>
        </div>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
          About <span className="text-blue-600 dark:text-blue-500">ThePathak.tech</span>
        </h1>
        <p className="text-xl text-muted-foreground font-serif italic max-w-2xl leading-relaxed">
          &quot;Interpretation over repetition.&quot;
        </p>
      </header>

      {/* Core Philosophy Section */}
      <section className="prose prose-zinc dark:prose-invert prose-editorial space-y-6">
        <p>
          <strong>ThePathak.tech</strong> is an independent publishing platform built by software architect and writer The Pathak. It is designed to serve as a deep, thoughtful alternative to shallow tech news aggregators and generic content mills.
        </p>
        <p>
          We do not publish simply to announce that a company released a new model or that an API endpoint changed. Instead, our goal is to answer: <em>What does this actually change for developers? Why does this scientific discovery matter for our understanding of the physical world?</em>
        </p>
      </section>

      {/* Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-serif-editorial text-xl font-bold text-foreground">Technology & AI</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Architectural analysis of autonomous AI agents, developer tooling, web architecture, and emerging technical paradigms.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="font-serif-editorial text-xl font-bold text-foreground">Science & Space</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Astrophysics, JWST transmission spectroscopy, quantum mechanics, and orbital space mission breakdowns.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-serif-editorial text-xl font-bold text-foreground">Coding & Systems</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Practical React 19 walkthroughs, Next.js App Router patterns, problem solving, and developer roadmaps.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Feather className="w-5 h-5" />
          </div>
          <h3 className="font-serif-editorial text-xl font-bold text-foreground">Creative & Words</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Original English and Hindi poetry (Devanagari typography), microfiction, short prose, and literary reflections.
          </p>
        </div>
      </section>

      {/* Author Callout */}
      <section className="p-8 rounded-2xl bg-zinc-900 text-zinc-100 space-y-4">
        <h3 className="font-serif-editorial text-2xl font-bold">The Author</h3>
        <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
          Written and curated by <strong>The Pathak</strong> — Lead Software Architect & Full-Stack Engineer passionate about building resilient systems and exploring ideas at the intersection of technology and words.
        </p>
        <div className="pt-2">
          <Link
            href="/technology"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            <span>Explore Publications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
