function SkeletonItem() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
      <div className="h-8 w-8 shrink-0 rounded-full bg-muted animate-pulse" />
      <div className="h-6 w-8 rounded-md bg-muted animate-pulse" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-[60%] rounded bg-muted animate-pulse" />
        <div className="h-3 w-[40%] rounded bg-muted animate-pulse" />
      </div>
      <div className="h-4 w-16 rounded bg-muted animate-pulse" />
    </div>
  );
}

export default function RankingLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded bg-muted animate-pulse" />
      <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
        <div className="h-9 w-24 rounded-md bg-muted/80 animate-pulse" />
        <div className="h-9 w-24 rounded-md bg-muted/80 animate-pulse" />
      </div>
      <div className="space-y-3">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    </div>
  );
}
