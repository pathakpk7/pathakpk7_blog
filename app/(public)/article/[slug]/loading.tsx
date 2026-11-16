export default function ArticleLoading() {
  return (
    <main className="min-h-screen pb-32 pt-8 sm:pt-12 animate-pulse">
      {/* Navigation placeholder */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8 flex items-center justify-between">
        <div className="h-4 w-28 bg-muted rounded-xs" />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Masthead Header */}
        <header className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="h-3.5 w-20 bg-muted rounded-xs" />
            <span className="text-muted-foreground/30">/</span>
            <div className="h-3.5 w-14 bg-muted rounded-xs" />
          </div>

          <div className="space-y-3">
            <div className="h-10 sm:h-14 w-full bg-muted rounded-xs" />
            <div className="h-10 sm:h-14 w-3/4 bg-muted rounded-xs" />
            <div className="h-5 sm:h-6 w-2/3 bg-muted/80 rounded-xs mt-4" />
          </div>

          {/* Author line */}
          <div className="flex items-center space-x-3 py-4 border-t border-b border-border/60">
            <div className="w-7 h-7 rounded-full bg-muted" />
            <div className="h-4 w-24 bg-muted rounded-xs" />
            <span className="text-muted-foreground/30">•</span>
            <div className="h-4 w-28 bg-muted rounded-xs" />
            <span className="text-muted-foreground/30">•</span>
            <div className="h-4 w-20 bg-muted rounded-xs" />
          </div>
        </header>

        {/* Cover image skeleton */}
        <div className="aspect-[16/9] w-full rounded-sm bg-muted/60 border border-border/40" />

        {/* Prose paragraph skeletons */}
        <div className="max-w-3xl mx-auto space-y-4 pt-4">
          <div className="h-4 w-full bg-muted/70 rounded-xs" />
          <div className="h-4 w-full bg-muted/70 rounded-xs" />
          <div className="h-4 w-5/6 bg-muted/70 rounded-xs" />
          <div className="h-4 w-full bg-muted/70 rounded-xs" />
          <div className="h-4 w-3/4 bg-muted/70 rounded-xs" />

          <div className="pt-6 space-y-4">
            <div className="h-7 w-48 bg-muted rounded-xs" />
            <div className="h-4 w-full bg-muted/70 rounded-xs" />
            <div className="h-4 w-full bg-muted/70 rounded-xs" />
            <div className="h-4 w-4/5 bg-muted/70 rounded-xs" />
          </div>
        </div>
      </article>
    </main>
  );
}
