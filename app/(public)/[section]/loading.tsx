export default function SectionLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 min-h-screen animate-pulse">
      {/* Masthead Skeleton */}
      <header className="space-y-4 pb-8 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-24 bg-muted rounded-xs" />
          <div className="h-3 w-16 bg-muted/60 rounded-xs" />
        </div>
        <div className="h-10 sm:h-12 w-64 sm:w-80 bg-muted rounded-xs" />
        <div className="h-5 w-full max-w-xl bg-muted/70 rounded-xs" />

        {/* Filter Tabs Skeleton */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <div className="h-6 w-20 bg-muted rounded-xs" />
          <div className="h-6 w-24 bg-muted/70 rounded-xs" />
          <div className="h-6 w-20 bg-muted/70 rounded-xs" />
          <div className="h-6 w-28 bg-muted/70 rounded-xs" />
        </div>
      </header>

      {/* Publications Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col space-y-4 p-5 sm:p-6 bg-card border border-border/70 rounded-sm shadow-xs"
          >
            <div className="aspect-[16/10] w-full rounded-sm bg-muted/60" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded-xs" />
              <div className="h-6 w-full bg-muted rounded-xs" />
              <div className="h-6 w-4/5 bg-muted rounded-xs" />
              <div className="h-4 w-full bg-muted/60 rounded-xs mt-2" />
              <div className="h-4 w-3/4 bg-muted/60 rounded-xs" />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div className="h-3.5 w-20 bg-muted rounded-xs" />
              <div className="h-3.5 w-16 bg-muted rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
