export default function RootPublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 min-h-screen animate-pulse">
      <div className="space-y-4 max-w-2xl">
        <div className="h-4 w-28 bg-muted rounded-xs" />
        <div className="h-10 sm:h-14 w-full bg-muted rounded-xs" />
        <div className="h-5 w-3/4 bg-muted/70 rounded-xs" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border/60">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 p-5 bg-card border border-border/70 rounded-sm">
            <div className="aspect-[16/10] bg-muted/60 rounded-xs" />
            <div className="h-5 w-full bg-muted rounded-xs" />
            <div className="h-4 w-2/3 bg-muted/70 rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}
